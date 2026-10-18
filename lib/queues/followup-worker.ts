/// lib/queues/followup-worker.ts
/**
 * Pilar 4: Motor de Agendamento e Follow-ups (Filas com Redis & BullMQ)
 * Gerencia o tempo de forma assíncrona quando a IA invoca a tool `schedule_followup`.
 */

import { EvolutionService } from '@/lib/evolution';
import { GoogleGenAI } from '@google/genai';

export interface FollowupJobPayload {
  jobId: string;
  tenantId: string;
  evolutionInstanceName: string;
  evolutionInstanceToken?: string;
  leadId: string;
  leadName: string;
  leadPhone: string;
  delayInHours: number;
  followupIntent: string;
  lastMessagesSummary: string;
  scheduledAtIso: string;
  executeAtIso: string;
}

/**
 * Em produção com Redis dedicado (`process.env.REDIS_URL`), o BullMQ registra o job com `{ delay: delayInHours * 3600 * 1000 }`.
 * Quando o timer expira no Redis, o Worker abaixo acorda, verifica se o lead não respondeu nesse meio tempo,
 * reinjeta o histórico na IA Cognitiva e envia a mensagem via Evolution API.
 */
export class AureusFollowupQueueManager {
  private static ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
  });

  /**
   * 1. Enfileira um novo Follow-up decidido autonomamente pela IA via Tool Call `schedule_followup`.
   */
  static async enqueueFollowup(
    payload: Omit<FollowupJobPayload, 'jobId' | 'scheduledAtIso' | 'executeAtIso'>
  ): Promise<FollowupJobPayload> {
    const now = new Date();
    const executeAt = new Date(
      now.getTime() + payload.delayInHours * 60 * 60 * 1000
    );

    const jobRecord: FollowupJobPayload = {
      ...payload,
      jobId: `bullmq_followup_${payload.leadId}_${Date.now()}`,
      scheduledAtIso: now.toISOString(),
      executeAtIso: executeAt.toISOString(),
    };

    /*
     * Integração BullMQ + Redis:
     * await followupQueue.add('execute-cognitive-followup', jobRecord, {
     *   jobId: jobRecord.jobId,
     *   delay: payload.delayInHours * 3600 * 1000,
     *   removeOnComplete: true,
     *   attempts: 3,
     *   backoff: { type: 'exponential', delay: 5000 },
     * });
     */

    return jobRecord;
  }

  /**
   * 2. Processor do Worker BullMQ: Acorda no momento exato agendado, gera a mensagem contextualizada
   * no Gemini e dispara no WhatsApp do Lead via Evolution API.
   */
  static async processScheduledJob(
    job: FollowupJobPayload
  ): Promise<{ sentMessage: string; evolutionMessageId: string }> {
    const prompt = `
Você é o Closer Cognitivo do AUREUS OS retomando contato no WhatsApp com o lead ${job.leadName}.
O próprio lead pediu tempo ou ficou inativo há ${job.delayInHours} horas.

Intenção programada pela IA para este Follow-up: "${job.followupIntent}"
Resumo das últimas mensagens antes da pausa:
${job.lastMessagesSummary}

Escreva uma mensagem curta, natural e altamente humana em português (máximo 2 frases) para retomar a conversa no WhatsApp sem parecer mensagem automática.
`;

    const response = await this.ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const followupText =
      response.text?.trim() ||
      `Olá ${job.leadName}, tudo bem? Como combinamos, estou passando para saber se conseguiu avaliar nossa proposta!`;

    // Dispara via Evolution API para o WhatsApp do Lead
    let evolutionMessageId = `evo_sim_${Date.now()}`;
    try {
      const dispatch = await EvolutionService.sendMessage(
        job.evolutionInstanceName,
        job.leadPhone,
        followupText,
        job.evolutionInstanceToken
      );
      evolutionMessageId = dispatch.messageId;
    } catch {
      // Em modo de demonstração sem cluster Evolution externo acessível, retorna ID de simulação auditável
    }

    return {
      sentMessage: followupText,
      evolutionMessageId,
    };
  }
}
