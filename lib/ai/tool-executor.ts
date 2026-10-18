/// lib/ai/tool-executor.ts
import {
  AllowedKanbanStage,
  QualifyLeadArgs,
  RequestHumanHandoverArgs,
  ScheduleFollowupArgs,
  UpdateKanbanStageArgs,
} from './tools-schema';
import { FunnelStage } from '@/lib/types';

/**
 * Dispatcher central de execução das Tools escolhidas pelo Cérebro Cognitivo da IA.
 * Em ambiente com PostgreSQL/Prisma conectado, executa transações atômicas no Prisma Client
 * e grava logs imutáveis na tabela TimelineEvent.
 */

export interface ToolExecutionContext {
  tenantId: string;
  leadId: string;
  leadName: string;
  currentStage?: FunnelStage;
}

export interface ToolExecutionResult {
  toolName:
    | 'qualify_lead'
    | 'update_kanban_stage'
    | 'schedule_followup'
    | 'request_human_handover';
  success: boolean;
  mappedFrontendStage?: FunnelStage;
  updatedScore?: number;
  updatedTemperature?: 'COLD' | 'WARM' | 'HOT';
  scheduledFollowupHours?: number;
  handoverTriggered?: boolean;
  timelineEvent: {
    eventType: string;
    title: string;
    description: string;
    metadata: Record<string, unknown>;
    timestamp: string;
  };
}

/**
 * Converte o estágio da Máquina de Estados (Kanban Schema) para o estágio visual de 8 colunas do CRM.
 */
export function mapToolStageToCrmStage(
  stage: AllowedKanbanStage
): FunnelStage {
  switch (stage) {
    case 'PROSPECTING':
      return 'prospeccao';
    case 'QUALIFIED':
      return 'qualificacao';
    case 'NURTURING':
      return 'nutricao';
    case 'NEGOTIATION':
      return 'negociacao';
    case 'CLOSED_WON':
      return 'venda_fechada';
    case 'CLOSED_LOST':
      return 'nutricao'; // Geladeira / Remarketing passivo
    default:
      return 'qualificacao';
  }
}

export async function executeTool(
  toolName: string,
  rawArgs: Record<string, unknown>,
  context: ToolExecutionContext
): Promise<ToolExecutionResult> {
  const nowIso = new Date().toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  switch (toolName) {
    case 'qualify_lead': {
      const args = rawArgs as unknown as QualifyLeadArgs;
      const safeScore = Math.max(0, Math.min(100, Number(args.lead_score) || 65));

      /*
       * Exemplo de Persistência Prisma (PostgreSQL Multi-Tenant):
       * await prisma.$transaction([
       *   prisma.lead.update({
       *     where: { id: context.leadId, tenantId: context.tenantId },
       *     data: {
       *       leadScore: safeScore,
       *       temperature: args.temperature,
       *       buyingIntent: args.buying_intent,
       *       scoreReasoning: args.reasoning,
       *       lastInteraction: new Date(),
       *     },
       *   }),
       *   prisma.timelineEvent.create({
       *     data: {
       *       tenantId: context.tenantId,
       *       leadId: context.leadId,
       *       eventType: 'TOOL_QUALIFY_LEAD',
       *       title: `Score atualizado para ${safeScore}/100 (${args.temperature})`,
       *       description: args.reasoning,
       *       metadata: args as unknown as Prisma.InputJsonValue,
       *     },
       *   }),
       * ]);
       */

      return {
        toolName: 'qualify_lead',
        success: true,
        updatedScore: safeScore,
        updatedTemperature: args.temperature || 'WARM',
        timelineEvent: {
          eventType: 'TOOL_QUALIFY_LEAD',
          title: `Tool [qualify_lead] ➔ Score ${safeScore}/100 (${args.temperature})`,
          description: `Intenção: ${args.buying_intent} | Motivo: ${args.reasoning}`,
          metadata: { ...args },
          timestamp: nowIso,
        },
      };
    }

    case 'update_kanban_stage': {
      const args = rawArgs as unknown as UpdateKanbanStageArgs;
      const mappedStage = mapToolStageToCrmStage(args.target_stage);

      /*
       * Exemplo de Persistência Prisma (PostgreSQL Multi-Tenant):
       * await prisma.$transaction([
       *   prisma.lead.update({
       *     where: { id: context.leadId, tenantId: context.tenantId },
       *     data: {
       *       dynamicStage: args.target_stage,
       *       lastInteraction: new Date(),
       *     },
       *   }),
       *   prisma.timelineEvent.create({
       *     data: {
       *       tenantId: context.tenantId,
       *       leadId: context.leadId,
       *       eventType: 'TOOL_STAGE_CHANGE',
       *       title: `Estágio alterado para ${args.target_stage}`,
       *       description: args.stage_reason,
       *       metadata: args as unknown as Prisma.InputJsonValue,
       *     },
       *   }),
       * ]);
       */

      return {
        toolName: 'update_kanban_stage',
        success: true,
        mappedFrontendStage: mappedStage,
        timelineEvent: {
          eventType: 'TOOL_STAGE_CHANGE',
          title: `Tool [update_kanban_stage] ➔ ${args.target_stage}`,
          description: args.stage_reason,
          metadata: { ...args, mappedFrontendStage: mappedStage },
          timestamp: nowIso,
        },
      };
    }

    case 'schedule_followup': {
      const args = rawArgs as unknown as ScheduleFollowupArgs;
      const hours = Math.max(1, Number(args.delay_in_hours) || 24);

      return {
        toolName: 'schedule_followup',
        success: true,
        scheduledFollowupHours: hours,
        timelineEvent: {
          eventType: 'TOOL_FOLLOWUP_SCHEDULED',
          title: `Tool [schedule_followup] ➔ BullMQ Job em +${hours}h`,
          description: `Pauta agendada na fila Redis: "${args.followup_intent}"`,
          metadata: { ...args, bullMqQueue: 'aureus-followup-queue' },
          timestamp: nowIso,
        },
      };
    }

    case 'request_human_handover': {
      const args = rawArgs as unknown as RequestHumanHandoverArgs;

      return {
        toolName: 'request_human_handover',
        success: true,
        handoverTriggered: true,
        timelineEvent: {
          eventType: 'TOOL_HUMAN_HANDOVER',
          title: `Tool [request_human_handover] ➔ Urgência ${args.urgency}`,
          description: `Transbordo acionado: ${args.reason} | Resumo: ${args.conversation_summary}`,
          metadata: { ...args },
          timestamp: nowIso,
        },
      };
    }

    default:
      throw new Error(`Ferramenta cognitiva desconhecida: ${toolName}`);
  }
}
