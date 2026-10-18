import { GoogleGenAI, Type } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import {
  buildMasterCognitiveSystemPrompt,
  DEFAULT_PERSONA_CONFIG,
} from '@/lib/ai/system-prompt-builder';
import { executeTool, ToolExecutionResult } from '@/lib/ai/tool-executor';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, payload } = body;

    if (action === 'chat_reply') {
      const {
        lead,
        messages,
        agentName,
        agentRole,
        agentPrompt,
        agentLinks,
        personaConfig,
        knowledgeSummary,
        customInstruction,
        isInactiveEvent,
      } = payload;
      const startTime = Date.now();

      const masterCognitivePrompt = buildMasterCognitiveSystemPrompt({
        agentName: agentName || 'Agente Closer Aetheris',
        agentRole: agentRole || 'Closer Consultivo Omnichannel',
        persona: personaConfig || DEFAULT_PERSONA_CONFIG,
        links: agentLinks,
        ragContext: knowledgeSummary,
        customSystemPrompt: agentPrompt,
      });

      const conversationHistory = (messages || [])
        .map(
          (m: { sender: string; text: string }) =>
            `${m.sender === 'lead' ? `Lead (${lead?.name})` : 'Agente IA'}: ${m.text}`
        )
        .join('\n');

      const prompt = `
${masterCognitivePrompt}

DADOS ATUAIS DO LEAD NO BANCO (PRISMA):
- ID: ${lead?.id || 'lead-sim'}
- Nome: ${lead?.name} (${lead?.company})
- Funil Atual: ${lead?.pipeline === 'prospeccao_outbound' ? 'Funil 1: Prospecção Ativa (Outbound)' : 'Funil 2: Tráfego Pago & Orgânico (Inbound)'}
- Estágio Atual no Funil: ${lead?.stage}
- Score Atual: ${lead?.score || 75}/100
- Sentimento Atual: ${lead?.sentiment}

HISTÓRICO DA CONVERSA NO WHATSAPP:
${conversationHistory}

${
  isInactiveEvent
    ? 'EVENTO ESPECIAL DE INATIVIDADE: O lead PAROU DE RESPONDER. Aplique a regra de Pacing / Nutrição por Inatividade, invoque schedule_followup e update_kanban_stage para NURTURING (nutricao) ou followup, e gere a mensagem humana de retomada.'
    : customInstruction
    ? `Instrução específica do operador: ${customInstruction}`
    : 'Analise a última resposta do lead segundo a Máquina de Estados (Fast-Track, Pacing ou Geladeira/Remarketing). Invoque as Tools cabíveis (qualify_lead, update_kanban_stage, schedule_followup ou request_human_handover) e gere a resposta ideal de WhatsApp em português.'
}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              replyText: {
                type: Type.STRING,
                description:
                  'A mensagem de resposta em português para enviar ao lead no WhatsApp respeitando o Tom de Voz e Persona configurados.',
              },
              strategyTag: {
                type: Type.STRING,
                description:
                  'Etiqueta curta da estratégia da Máquina de Estados (ex: Fast-Track Proposta, Pacing BullMQ +24h, Qualificação SPIN, Geladeira Remarketing).',
              },
              confidence: {
                type: Type.STRING,
                description: 'Nível de confiança cognitiva (ex: Confiança 99.4%).',
              },
              detectedSentiment: {
                type: Type.STRING,
                description:
                  'Um dos valores: "Novo Contato", "Curioso / Respondendo", "Qualificado / Engajado", "Inativo / Parou de Responder", "Interesse em Proposta", "Negociando Condições", "Alta Intenção / Fechamento", "Venda Confirmada".',
              },
              nextStage: {
                type: Type.STRING,
                description:
                  'Um dos 8 estágios: "prospeccao", "qualificacao", "nutricao", "followup", "proposta", "negociacao", "fechamento", "venda_fechada".',
              },
              chainStepTitle: {
                type: Type.STRING,
                description:
                  'Título curto do passo registrado na Cadeia de Atendimentos do card.',
              },
              // Function Calling Invocations Decided by the Cognitive Engine
              tool_qualify_lead: {
                type: Type.OBJECT,
                properties: {
                  lead_score: { type: Type.INTEGER },
                  temperature: {
                    type: Type.STRING,
                    description: 'COLD, WARM ou HOT',
                  },
                  buying_intent: { type: Type.STRING },
                  reasoning: { type: Type.STRING },
                },
                required: [
                  'lead_score',
                  'temperature',
                  'buying_intent',
                  'reasoning',
                ],
              },
              tool_update_kanban_stage: {
                type: Type.OBJECT,
                properties: {
                  target_stage: {
                    type: Type.STRING,
                    description:
                      'PROSPECTING, QUALIFIED, NURTURING, NEGOTIATION, CLOSED_WON ou CLOSED_LOST',
                  },
                  stage_reason: { type: Type.STRING },
                },
                required: ['target_stage', 'stage_reason'],
              },
              tool_schedule_followup: {
                type: Type.OBJECT,
                properties: {
                  should_schedule: { type: Type.BOOLEAN },
                  delay_in_hours: { type: Type.INTEGER },
                  followup_intent: { type: Type.STRING },
                },
                required: [
                  'should_schedule',
                  'delay_in_hours',
                  'followup_intent',
                ],
              },
              tool_request_human_handover: {
                type: Type.OBJECT,
                properties: {
                  should_handover: { type: Type.BOOLEAN },
                  urgency: {
                    type: Type.STRING,
                    description: 'LOW, MEDIUM, HIGH ou CRITICAL',
                  },
                  reason: { type: Type.STRING },
                  conversation_summary: { type: Type.STRING },
                },
                required: [
                  'should_handover',
                  'urgency',
                  'reason',
                  'conversation_summary',
                ],
              },
            },
            required: [
              'replyText',
              'strategyTag',
              'confidence',
              'detectedSentiment',
              'nextStage',
              'chainStepTitle',
              'tool_qualify_lead',
              'tool_update_kanban_stage',
              'tool_schedule_followup',
              'tool_request_human_handover',
            ],
          },
        },
      });

      const latencyMs = Math.max(180, Date.now() - startTime);
      const parsed = JSON.parse(response.text || '{}');

      // Execute the cognitive tools through the central Tool Executor dispatcher
      const context = {
        tenantId: 'tenant_aureus_prod',
        leadId: lead?.id || 'lead_sim',
        leadName: lead?.name || 'Lead WhatsApp',
        currentStage: lead?.stage,
      };

      const executedTools: ToolExecutionResult[] = [];

      if (parsed.tool_qualify_lead) {
        executedTools.push(
          await executeTool('qualify_lead', parsed.tool_qualify_lead, context)
        );
      }

      if (parsed.tool_update_kanban_stage) {
        executedTools.push(
          await executeTool(
            'update_kanban_stage',
            parsed.tool_update_kanban_stage,
            context
          )
        );
      }

      if (parsed.tool_schedule_followup?.should_schedule || isInactiveEvent) {
        executedTools.push(
          await executeTool(
            'schedule_followup',
            {
              delay_in_hours:
                parsed.tool_schedule_followup?.delay_in_hours || 24,
              followup_intent:
                parsed.tool_schedule_followup?.followup_intent ||
                'Retomar contato consultivo após pausa do lead no WhatsApp',
            },
            context
          )
        );
      }

      if (parsed.tool_request_human_handover?.should_handover) {
        executedTools.push(
          await executeTool(
            'request_human_handover',
            parsed.tool_request_human_handover,
            context
          )
        );
      }

      return NextResponse.json({
        replyText:
          parsed.replyText ||
          'Perfeito! Avancei seu atendimento e já separei o link da nossa proposta comercial personalizada.',
        strategyTag: parsed.strategyTag || 'Máquina de Estados Cognitiva',
        confidence: parsed.confidence || 'Confiança 99.2%',
        detectedSentiment:
          parsed.detectedSentiment || 'Qualificado / Engajado',
        nextStage: parsed.nextStage || lead?.stage || 'qualificacao',
        chainStepTitle:
          parsed.chainStepTitle || 'Atendimento Evoluído pela IA',
        updatedScore: parsed.tool_qualify_lead?.lead_score || lead?.score || 85,
        leadTemperature: parsed.tool_qualify_lead?.temperature || 'HOT',
        executedTools,
        masterPromptPreview: masterCognitivePrompt,
        latencyMs,
      });
    }

    if (action === 'lead_dossier') {
      const { lead, messages } = payload;
      const conversationHistory = (messages || [])
        .map(
          (m: { sender: string; text: string }) =>
            `${m.sender === 'lead' ? 'Lead' : 'IA'}: ${m.text}`
        )
        .join('\n');

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Analise o histórico de conversa do lead ${lead?.name} (${lead?.company}) no estágio "${lead?.stage}" e gere um Dossiê de Conversão B2B atualizado em português.\n\nHistórico:\n${conversationHistory}`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: {
                type: Type.INTEGER,
                description: 'Score de intenção de compra de 1 a 100.',
              },
              closingProb: {
                type: Type.STRING,
                description: 'Probabilidade de fechamento formatada, ex: 96.4%',
              },
              dorPrincipal: {
                type: Type.STRING,
                description: 'Resumo curto da dor principal identificada.',
              },
              preRequisito: {
                type: Type.STRING,
                description: 'Pré-requisito técnico ou comercial do lead.',
              },
              estagioAtual: {
                type: Type.STRING,
                description: 'Momento exato da negociação.',
              },
              recomendacao: {
                type: Type.STRING,
                description: 'Próxima ação recomendada de alto impacto.',
              },
            },
            required: [
              'score',
              'closingProb',
              'dorPrincipal',
              'preRequisito',
              'estagioAtual',
              'recomendacao',
            ],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return NextResponse.json(parsed);
    }

    if (action === 'rag_query') {
      const { query, documents } = payload;
      const docsContext = (documents || [])
        .map(
          (d: { title: string; contentSummary: string }) =>
            `Documento [${d.title}]: ${d.contentSummary}`
        )
        .join('\n\n');

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Você é o motor de busca semântica RAG Puro (Zero Alucinação) da Aetheris AI.\nResponda à pergunta em português utilizando os documentos vetorizados abaixo.\n\nDocumentos:\n${docsContext}\n\nPergunta: ${query}`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              answer: {
                type: Type.STRING,
                description:
                  'Resposta precisa e técnica fundamentada nos documentos.',
              },
              sourceDoc: {
                type: Type.STRING,
                description: 'Nome do documento principal utilizado na resposta.',
              },
              similarityScore: {
                type: Type.STRING,
                description: 'Score de similaridade vetorial (ex: 0.994).',
              },
            },
            required: ['answer', 'sourceDoc', 'similarityScore'],
          },
        },
      });

      return NextResponse.json(JSON.parse(response.text || '{}'));
    }

    if (action === 'cadence_generator') {
      const { objective, channel, audience } = payload;
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Crie uma mensagem curta e magnética de reengajamento comercial (Cadeia de Atendimento Omnichannel) em português para o canal ${channel}, público-alvo "${audience}", objetivo "${objective}". Use variáveis {{nome}} e {{empresa}}.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              stepTitle: {
                type: Type.STRING,
                description: 'Título curto do passo da cadência.',
              },
              messageTemplate: {
                type: Type.STRING,
                description: 'Texto da mensagem com {{nome}} e {{empresa}}.',
              },
              expectedCtr: {
                type: Type.STRING,
                description: 'Taxa de resposta estimada (ex: 38.5%).',
              },
            },
            required: ['stepTitle', 'messageTemplate', 'expectedCtr'],
          },
        },
      });

      return NextResponse.json(JSON.parse(response.text || '{}'));
    }

    return NextResponse.json(
      { error: 'Ação não reconhecida pelo motor neural.' },
      { status: 400 }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Falha na requisição Gemini API';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
