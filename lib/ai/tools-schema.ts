/// lib/ai/tools-schema.ts
import { FunctionDeclaration, Type } from '@google/genai';

/**
 * Definições estritas de Function Calling (Tools) para o Cérebro Cognitivo (Gemini / OpenAI).
 * Permitem que o Agente de IA atue sobre o CRM, mova o lead de estágio, agende follow-ups
 * no BullMQ e acione transbordo humano.
 */

export type AllowedKanbanStage =
  | 'PROSPECTING'
  | 'QUALIFIED'
  | 'NURTURING'
  | 'NEGOTIATION'
  | 'CLOSED_WON'
  | 'CLOSED_LOST';

export type AllowedLeadTemperature = 'COLD' | 'WARM' | 'HOT';

export interface QualifyLeadArgs {
  lead_score: number;
  temperature: AllowedLeadTemperature;
  buying_intent: string;
  reasoning: string;
}

export interface UpdateKanbanStageArgs {
  target_stage: AllowedKanbanStage;
  stage_reason: string;
}

export interface ScheduleFollowupArgs {
  delay_in_hours: number;
  followup_intent: string;
}

export interface RequestHumanHandoverArgs {
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  reason: string;
  conversation_summary: string;
}

export const AUREUS_COGNITIVE_TOOLS: FunctionDeclaration[] = [
  {
    name: 'qualify_lead',
    description:
      'Atualiza o Lead Score (0 a 100), a Temperatura (COLD, WARM, HOT) e extrai a intenção de compra com base na última mensagem do lead no WhatsApp. Exige justificativa analítica (reasoning).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        lead_score: {
          type: Type.INTEGER,
          description: 'Nota de qualificação de 0 a 100 baseada em perfil, urgência e orçamento.',
        },
        temperature: {
          type: Type.STRING,
          enum: ['COLD', 'WARM', 'HOT'],
          description: 'Temperatura atual do lead: COLD (Frio), WARM (Morno) ou HOT (Quente).',
        },
        buying_intent: {
          type: Type.STRING,
          description: 'Resumo objetivo da intenção de compra demonstrada pelo lead.',
        },
        reasoning: {
          type: Type.STRING,
          description: 'Motivo técnico e comercial pelo qual a IA atribuiu esta nota e temperatura.',
        },
      },
      required: ['lead_score', 'temperature', 'buying_intent', 'reasoning'],
    },
  },
  {
    name: 'update_kanban_stage',
    description:
      'Move o card do lead no funil de vendas (Kanban) de forma não-linear conforme a evolução ou desaceleração da conversa.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        target_stage: {
          type: Type.STRING,
          enum: [
            'PROSPECTING',
            'QUALIFIED',
            'NURTURING',
            'NEGOTIATION',
            'CLOSED_WON',
            'CLOSED_LOST',
          ],
          description:
            'Estágio de destino no Kanban: PROSPECTING, QUALIFIED, NURTURING, NEGOTIATION, CLOSED_WON ou CLOSED_LOST.',
        },
        stage_reason: {
          type: Type.STRING,
          description: 'Justificativa da mudança de estágio para registro na auditoria (Timeline).',
        },
      },
      required: ['target_stage', 'stage_reason'],
    },
  },
  {
    name: 'schedule_followup',
    description:
      'Agenda uma mensagem futura na fila Redis/BullMQ (Pacing Adaptativo) quando o lead pede tempo, responde devagar ou entra em cadência de nutrição/remarketing.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        delay_in_hours: {
          type: Type.INTEGER,
          description: 'Quantidade de horas para aguardar antes de disparar o follow-up (ex: 2, 24, 48, 720).',
        },
        followup_intent: {
          type: Type.STRING,
          description:
            'Contexto e gancho exato do que a IA deve abordar quando o job do BullMQ acordar.',
        },
      },
      required: ['delay_in_hours', 'followup_intent'],
    },
  },
  {
    name: 'request_human_handover',
    description:
      'Transfere o atendimento para um especialista humano quando o lead pede explicitamente um atendente, quando a dúvida foge da Base RAG ou quando uma conta Enterprise está pronta para assinatura final.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        urgency: {
          type: Type.STRING,
          enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
          description: 'Nível de urgência para o alerta da equipe comercial.',
        },
        reason: {
          type: Type.STRING,
          description: 'Motivo que acionou o transbordo humano.',
        },
        conversation_summary: {
          type: Type.STRING,
          description: 'Resumo executivo do contexto para o closer humano assumir sem repetir perguntas.',
        },
      },
      required: ['urgency', 'reason', 'conversation_summary'],
    },
  },
];
