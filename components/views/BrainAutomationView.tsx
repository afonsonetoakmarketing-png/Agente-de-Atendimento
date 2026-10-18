'use client';

import React, { useState } from 'react';
import {
  Workflow,
  Bot,
  Sparkles,
  Play,
  Save,
  Check,
  Sliders,
  Zap,
  ArrowRight,
  Cpu,
  Link2,
  Plus,
  MessageSquare,
  GitBranch,
  Smile,
  Clock,
  CheckCircle2,
  Trash2,
  Mic2,
  ShieldAlert,
  Terminal,
  Database,
  Layers,
  MapPin,
  Search,
  UserPlus,
  Copy,
  Code2,
  Flame,
  Snowflake,
  Activity,
} from 'lucide-react';
import {
  AgentPersonaConfig,
  AgentSpecialist,
  ChatbotFlowNode,
  FUNNEL_STAGES_CONFIG,
  FunnelStage,
  Lead,
  LeadSentiment,
  NavigationTab,
} from '@/lib/types';
import {
  buildMasterCognitiveSystemPrompt,
  DEFAULT_PERSONA_CONFIG,
} from '@/lib/ai/system-prompt-builder';
import { ToolExecutionResult } from '@/lib/ai/tool-executor';

interface BrainAutomationViewProps {
  agents: AgentSpecialist[];
  chatbotNodes: ChatbotFlowNode[];
  onUpdateAgent: (updated: AgentSpecialist) => void;
  onAddAgent: (newAgent: AgentSpecialist) => void;
  onUpdateChatbotNodes: (nodes: ChatbotFlowNode[]) => void;
  onAddLead?: (newLead: Lead) => void;
  onNavigate?: (tab: NavigationTab) => void;
}

const SENTIMENT_OPTIONS: LeadSentiment[] = [
  'Novo Contato',
  'Curioso / Respondendo',
  'Qualificado / Engajado',
  'Inativo / Parou de Responder',
  'Interesse em Proposta',
  'Negociando Condições',
  'Alta Intenção / Fechamento',
  'Venda Confirmada',
];

interface ScrapedProspect {
  id: string;
  company: string;
  contactName: string;
  phone: string;
  niche: string;
  city: string;
  rating: string;
  whatsappVerified: boolean;
  estimatedTicket: number;
  injected?: boolean;
}

const ARCHITECTURAL_PILLARS_DOCS = [
  {
    id: 'pilar-1',
    badge: 'PILAR 1 • MENSAGERIA',
    title: '1. Infraestrutura Evolution API Cluster & Webhooks Multi-Tenant',
    summary:
      'Provisionamento dinâmico de instâncias WhatsApp por Tenant, leitura de QR Code Base64 e controlador de Webhooks Inbound com prevenção de loop (fromMe: true).',
    files: [
      '/lib/evolution.ts',
      '/app/api/whatsapp/route.ts',
      '/app/api/webhooks/evolution/route.ts',
    ],
    codeSnippet: `/// lib/evolution.ts (Core Service Multi-Tenant)
export class EvolutionService {
  static async createInstance(tenantId: string) {
    const instanceName = \`tenant_\${tenantId.replace(/[^a-zA-Z0-9_-]/g, '')}\`;
    const webhookUrl = \`\${process.env.APP_URL}/api/webhooks/evolution\`;

    const response = await fetch(\`\${process.env.EVOLUTION_API_URL}/instance/create\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: process.env.EVOLUTION_GLOBAL_API_KEY! },
      body: JSON.stringify({
        instanceName,
        qrcode: true,
        integration: 'WHATSAPP-BAILEYS',
        groupsIgnore: true,
        webhook: {
          url: webhookUrl,
          events: ['CONNECTION_UPDATE', 'MESSAGES_UPSERT', 'QRCODE_UPDATED'],
        },
      }),
    });
    return response.json();
  }
}

/// app/api/webhooks/evolution/route.ts (Prevenção de Loop & Roteamento)
export async function POST(req: NextRequest) {
  const payload = await req.json();
  const { event, instance, data } = payload;

  if (event === 'messages.upsert') {
    // Regra de Prevenção de Loop: Ignora mensagens enviadas pelo próprio bot ou grupos
    if (data?.key?.fromMe === true || data?.key?.remoteJid?.endsWith('@g.us')) {
      return NextResponse.json({ ignored: true });
    }
    // Persiste no Prisma e acorda o Cérebro Cognitivo (Gemini Function Calling)
  }
}`,
  },
  {
    id: 'pilar-2',
    badge: 'PILAR 2 • CÉREBRO & TOOLS',
    title: '2. Cérebro Cognitivo, Máquina de Estados & Function Calling',
    summary:
      'Prompt Mestre Dinâmico orientado por Temperatura e Velocidade (Fast-Track, Pacing e Geladeira) com 4 ferramentas estritas: qualify_lead, update_kanban_stage, schedule_followup e request_human_handover.',
    files: [
      '/lib/ai/tools-schema.ts',
      '/lib/ai/tool-executor.ts',
      '/lib/ai/system-prompt-builder.ts',
    ],
    codeSnippet: `/// lib/ai/tools-schema.ts (Declarações Function Calling)
export const AUREUS_COGNITIVE_TOOLS: FunctionDeclaration[] = [
  {
    name: 'qualify_lead',
    description: 'Atualiza Lead Score (0-100), Temperatura (COLD, WARM, HOT) e reasoning.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        lead_score: { type: Type.INTEGER },
        temperature: { type: Type.STRING, enum: ['COLD', 'WARM', 'HOT'] },
        buying_intent: { type: Type.STRING },
        reasoning: { type: Type.STRING },
      },
      required: ['lead_score', 'temperature', 'buying_intent', 'reasoning'],
    },
  },
  {
    name: 'update_kanban_stage',
    description: 'Move o lead no funil de vendas (Kanban) de forma não-linear.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        target_stage: {
          type: Type.STRING,
          enum: ['PROSPECTING', 'QUALIFIED', 'NURTURING', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST'],
        },
        stage_reason: { type: Type.STRING },
      },
      required: ['target_stage', 'stage_reason'],
    },
  },
  {
    name: 'schedule_followup',
    description: 'Agenda follow-up futuro na fila BullMQ (delay_in_hours, followup_intent).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        delay_in_hours: { type: Type.INTEGER },
        followup_intent: { type: Type.STRING },
      },
      required: ['delay_in_hours', 'followup_intent'],
    },
  },
];`,
  },
  {
    id: 'pilar-3',
    badge: 'PILAR 3 • PRISMA SCHEMA',
    title: '3. Modelagem de Banco de Dados Multi-Tenant (PostgreSQL + Prisma)',
    summary:
      'Isolamento completo por Tenant (credenciais Evolution API + Base RAG), tabela Lead com estágio dinâmico e temperatura, e tabela TimelineEvent imutável para auditoria.',
    files: ['/prisma/schema.prisma'],
    codeSnippet: `/// prisma/schema.prisma
model Tenant {
  id                     String                   @id @default(cuid())
  name                   String
  evolutionInstanceName  String?                  @unique
  evolutionInstanceToken String?
  whatsappStatus         WhatsappConnectionStatus @default(DISCONNECTED)
  aiSystemPrompt         String                   @db.Text
  ragKnowledgeContext    Json?
  leads                  Lead[]
}

model Lead {
  id                String             @id @default(cuid())
  tenantId          String
  whatsappRemoteJid String
  leadScore         Int                @default(50)
  temperature       LeadTemperature    @default(WARM)
  dynamicStage      KanbanDynamicStage @default(PROSPECTING)
  lastInteraction   DateTime           @default(now())
  timelineEvents    TimelineEvent[]
  @@unique([tenantId, whatsappRemoteJid])
}

model TimelineEvent {
  id          String   @id @default(cuid())
  tenantId    String
  leadId      String
  eventType   String   // TOOL_QUALIFY_LEAD | TOOL_STAGE_CHANGE | TOOL_FOLLOWUP_SCHEDULED
  title       String
  description String   @db.Text
  metadata    Json?
  createdAt   DateTime @default(now())
}`,
  },
  {
    id: 'pilar-4',
    badge: 'PILAR 4 • FILAS BULLMQ',
    title: '4. Motor de Agendamento e Follow-ups (Redis & BullMQ Worker)',
    summary:
      'Quando a IA decide agendar um follow-up em X horas (Pacing Adaptativo), o BullMQ registra o delayed job no Redis, acorda no instante exato, reinjeta o contexto na IA e envia via Evolution API.',
    files: ['/lib/queues/followup-worker.ts'],
    codeSnippet: `/// lib/queues/followup-worker.ts
export class AureusFollowupQueueManager {
  static async enqueueFollowup(payload: FollowupJobInput) {
    // Registra no Redis/BullMQ com delay exato em milissegundos:
    // await followupQueue.add('execute-cognitive-followup', payload, {
    //   delay: payload.delayInHours * 3600 * 1000,
    //   removeOnComplete: true,
    // });
  }

  static async processScheduledJob(job: FollowupJobPayload) {
    // 1. Verifica se o lead não respondeu nesse intervalo
    // 2. Injeta histórico + followupIntent no Gemini 3.8 Flash
    // 3. Dispara via EvolutionService.sendMessage(job.evolutionInstanceName, job.leadPhone, reply)
  }
}`,
  },
  {
    id: 'pilar-5',
    badge: 'PILAR 5 • PROSPECÇÃO & SAAS',
    title: '5. Motor de Prospecção Outbound & Replicação Multi-Tenant por Nicho',
    summary:
      'Extração automatizada de leads (Google Maps / Redes), validação de número WhatsApp (checkNumberStatus na Evolution API), injeção no topo do Funil 1 e empacotamento de Templates Cognitivos + Base RAG por nicho.',
    files: ['/components/views/BrainAutomationView.tsx'],
    codeSnippet: `// Arquitetura de Replicação Multi-Tenant (Niche Packaging):
// 1. Ao criar um novo Tenant (ex: Clínica Médica, Advocacia, Energia Solar ou SaaS B2B),
//    o sistema clona um "Cognitive Blueprint" contendo:
//    - Persona & Tom de Voz pré-calibrados para o nicho
//    - Índices vetoriais RAG específicos do produto/serviço do cliente
//    - Máquina de Estados e regras de Fast-Track / Pacing
// 2. O Motor de Prospecção extrai leads geolocalizados, valida se o telefone possui
//    WhatsApp ativo e injeta no estágio PROSPECTING disparando a Saudação Inicial.`,
  },
];

export default function BrainAutomationView({
  agents,
  chatbotNodes,
  onUpdateAgent,
  onAddAgent,
  onUpdateChatbotNodes,
  onAddLead,
  onNavigate,
}: BrainAutomationViewProps) {
  const [subTab, setSubTab] = useState<
    | 'agente_config'
    | 'persona_regras'
    | 'fluxo_sentimento'
    | 'arquitetura_prospeccao'
  >('persona_regras');

  const [selectedAgentId, setSelectedAgentId] = useState(
    agents[0]?.id || 'agent-qualifier'
  );
  const activeAgent =
    agents.find((a) => a.id === selectedAgentId) || agents[0];

  // Agent basic form state
  const [nameDraft, setNameDraft] = useState(activeAgent.name);
  const [roleDraft, setRoleDraft] = useState(activeAgent.role);
  const [greetingDraft, setGreetingDraft] = useState(
    activeAgent.greetingMessage
  );
  const [styleDraft, setStyleDraft] = useState(activeAgent.attendanceStyle);
  const [waInstanceDraft, setWaInstanceDraft] = useState(
    activeAgent.whatsappInstance
  );
  const [proposalUrlDraft, setProposalUrlDraft] = useState(
    activeAgent.links.proposalUrl
  );
  const [checkoutUrlDraft, setCheckoutUrlDraft] = useState(
    activeAgent.links.checkoutUrl
  );
  const [calendarUrlDraft, setCalendarUrlDraft] = useState(
    activeAgent.links.calendarUrl
  );
  const [websiteUrlDraft, setWebsiteUrlDraft] = useState(
    activeAgent.links.websiteUrl
  );
  const [promptDraft, setPromptDraft] = useState(activeAgent.systemPrompt);
  const [tempDraft, setTempDraft] = useState(activeAgent.temperature);
  const [autonomyDraft, setAutonomyDraft] = useState(activeAgent.autonomyLevel);
  const [savedToast, setSavedToast] = useState(false);

  // Persona, Tom de Voz & Regras Específicas (Máquina de Estados) state
  const [personaDraft, setPersonaDraft] = useState<AgentPersonaConfig>(
    activeAgent.personaConfig || DEFAULT_PERSONA_CONFIG
  );
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // Modal for creating a brand new AI Agent
  const [newAgentModalOpen, setNewAgentModalOpen] = useState(false);
  const [newAgName, setNewAgName] = useState('');
  const [newAgRole, setNewAgRole] = useState('');

  // Selected Chatbot Flow Block
  const [selectedNodeId, setSelectedNodeId] = useState<string>(
    chatbotNodes[0]?.id || 'node-1'
  );
  const selectedNode =
    chatbotNodes.find((n) => n.id === selectedNodeId) || chatbotNodes[0];

  // Live Playground + Real Function Calling State
  const [testStage, setTestStage] = useState<FunnelStage>('prospeccao');
  const [testInput, setTestInput] = useState(
    'Olá! Vi a solução de vocês. Temos 25 vendedores no WhatsApp, precisamos implantar ainda essa semana. Qual o valor do plano Enterprise e já tem link de proposta?'
  );
  const [testResult, setTestResult] = useState<{
    replyText: string;
    strategyTag: string;
    detectedSentiment: string;
    nextStage: string;
    chainStepTitle: string;
    updatedScore: number;
    leadTemperature: string;
    executedTools: ToolExecutionResult[];
    latencyMs: number;
  } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  // Pilar 5: Motor de Prospecção (Google Maps / Redes) state
  const [prospectNiche, setProspectNiche] = useState(
    'Clínicas Médicas & Odontológicas Premium'
  );
  const [prospectCity, setProspectCity] = useState('São Paulo, SP');
  const [isScraping, setIsScraping] = useState(false);
  const [scrapedProspects, setScrapedProspects] = useState<ScrapedProspect[]>([
    {
      id: 'scr-1',
      company: 'Instituto Prime Odontologia Digital',
      contactName: 'Dr. Henrique Vasconcelos',
      phone: '+55 (11) 99140-8821',
      niche: 'Clínicas Odontológicas',
      city: 'São Paulo, SP',
      rating: '4.9 ★ (312 avaliações)',
      whatsappVerified: true,
      estimatedTicket: 45600,
    },
    {
      id: 'scr-2',
      company: 'Clínica Vitae Saúde Integrada',
      contactName: 'Dra. Patrícia Alencar',
      phone: '+55 (11) 98412-3390',
      niche: 'Clínicas Médicas',
      city: 'São Paulo, SP',
      rating: '4.8 ★ (198 avaliações)',
      whatsappVerified: true,
      estimatedTicket: 38000,
    },
    {
      id: 'scr-3',
      company: 'Grupo Lumina Dermatologia & Laser',
      contactName: 'Marcelo Prado (Diretor)',
      phone: '+55 (11) 97721-5010',
      niche: 'Estética & Saúde',
      city: 'São Paulo, SP',
      rating: '5.0 ★ (420 avaliações)',
      whatsappVerified: true,
      estimatedTicket: 68000,
    },
  ]);
  const [selectedPillarId, setSelectedPillarId] = useState('pilar-1');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const handleSelectAgent = (ag: AgentSpecialist) => {
    setSelectedAgentId(ag.id);
    setNameDraft(ag.name);
    setRoleDraft(ag.role);
    setGreetingDraft(ag.greetingMessage);
    setStyleDraft(ag.attendanceStyle);
    setWaInstanceDraft(ag.whatsappInstance);
    setProposalUrlDraft(ag.links.proposalUrl);
    setCheckoutUrlDraft(ag.links.checkoutUrl);
    setCalendarUrlDraft(ag.links.calendarUrl);
    setWebsiteUrlDraft(ag.links.websiteUrl);
    setPromptDraft(ag.systemPrompt);
    setTempDraft(ag.temperature);
    setAutonomyDraft(ag.autonomyLevel);
    setPersonaDraft(ag.personaConfig || DEFAULT_PERSONA_CONFIG);
  };

  const handleSaveAgent = () => {
    onUpdateAgent({
      ...activeAgent,
      name: nameDraft,
      role: roleDraft,
      greetingMessage: greetingDraft,
      attendanceStyle: styleDraft,
      whatsappInstance: waInstanceDraft,
      links: {
        proposalUrl: proposalUrlDraft,
        checkoutUrl: checkoutUrlDraft,
        calendarUrl: calendarUrlDraft,
        websiteUrl: websiteUrlDraft,
      },
      personaConfig: personaDraft,
      systemPrompt: promptDraft,
      temperature: tempDraft,
      autonomyLevel: autonomyDraft,
    });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2200);
  };

  const handleCreateNewAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgName.trim()) return;
    const created: AgentSpecialist = {
      id: `agent-custom-${Date.now()}`,
      name: newAgName.trim(),
      role: newAgRole.trim() || 'Closer Cognitivo WhatsApp',
      greetingMessage:
        'Olá! Sou o agente virtual inteligente. Como posso ajudar você hoje?',
      attendanceStyle:
        'Consultivo, cordial, rápido e focado em conversão não-linear no funil',
      whatsappInstance: 'WhatsApp Principal (+55 11 98800-1000)',
      links: {
        proposalUrl: 'https://aetheris.ai/proposta-comercial.pdf',
        checkoutUrl: 'https://pay.aetheris.ai/checkout-direto',
        calendarUrl: 'https://cal.com/aetheris/reuniao',
        websiteUrl: 'https://aetheris.ai/catalogo',
      },
      personaConfig: DEFAULT_PERSONA_CONFIG,
      metricLabel: 'Taxa de Conversão',
      metricValue: 94.0,
      volumeLabel: 'Novo Agente',
      secondaryLabel: '1.0s resp',
      status: 'active',
      model: 'gemini-3.8-flash',
      temperature: 0.3,
      autonomyLevel: 96,
      systemPrompt: `Você é ${newAgName.trim()}, especialista em ${
        newAgRole.trim() || 'atendimento e vendas no WhatsApp'
      }. Avalie a Temperatura e Velocidade do lead a cada mensagem, invoque as tools de Function Calling e avance o card no funil.`,
    };
    onAddAgent(created);
    handleSelectAgent(created);
    setNewAgName('');
    setNewAgRole('');
    setNewAgentModalOpen(false);
  };

  const handleUpdateSelectedNode = (patch: Partial<ChatbotFlowNode>) => {
    if (!selectedNode) return;
    const updatedList = chatbotNodes.map((n) =>
      n.id === selectedNode.id ? { ...n, ...patch } : n
    );
    onUpdateChatbotNodes(updatedList);
  };

  const handleAddFlowNode = () => {
    const nextOrder = chatbotNodes.length + 1;
    const newNode: ChatbotFlowNode = {
      id: `node-${Date.now()}`,
      order: nextOrder,
      title: `0${nextOrder}. Nova Regra de Sentimento & Avanço`,
      triggerType: 'mensagem_lead',
      triggerCondition: 'Lead envia mensagem com dúvida específica ou interesse',
      detectedSentiment: 'Qualificado / Engajado',
      fromStage: 'qualificacao',
      targetStage: 'proposta',
      aiActionTemplate:
        'Responder à dúvida de forma consultiva, enviar o link da proposta comercial e mover card no funil.',
      attachedLinkType: 'proposalUrl',
    };
    onUpdateChatbotNodes([...chatbotNodes, newNode]);
    setSelectedNodeId(newNode.id);
  };

  const handleDeleteFlowNode = (id: string) => {
    if (chatbotNodes.length <= 2) return;
    const filtered = chatbotNodes
      .filter((n) => n.id !== id)
      .map((n, i) => ({ ...n, order: i + 1 }));
    onUpdateChatbotNodes(filtered);
    setSelectedNodeId(filtered[0].id);
  };

  const handleRunSimulation = async (
    e: React.FormEvent,
    simulateInactivity = false
  ) => {
    e.preventDefault();
    if (isTesting) return;
    setIsTesting(true);
    try {
      const res = await fetch('/api/aetheris-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat_reply',
          payload: {
            lead: {
              id: 'lead-sim-01',
              name: 'Lead Teste WhatsApp',
              company: 'TechCorp Enterprise Ltda',
              channel: 'whatsapp',
              pipeline: 'prospeccao_outbound',
              stage: testStage,
              score: 78,
              sentiment: 'Curioso / Respondendo',
            },
            messages: [
              {
                sender: 'lead',
                text: simulateInactivity
                  ? '[Lead visualizou a última pergunta no WhatsApp, pediu um tempo para falar com o sócio e ficou sem responder]'
                  : testInput,
              },
            ],
            agentName: nameDraft,
            agentRole: roleDraft,
            agentPrompt: promptDraft,
            personaConfig: personaDraft,
            agentLinks: {
              proposalUrl: proposalUrlDraft,
              checkoutUrl: checkoutUrlDraft,
              calendarUrl: calendarUrlDraft,
              websiteUrl: websiteUrlDraft,
            },
            isInactiveEvent: simulateInactivity,
          },
        }),
      });
      const data = await res.json();
      setTestResult({
        replyText: data.replyText || 'Resposta gerada com sucesso.',
        strategyTag: data.strategyTag || 'Máquina de Estados Cognitiva',
        detectedSentiment: data.detectedSentiment || 'Qualificado / Engajado',
        nextStage: data.nextStage || 'qualificacao',
        chainStepTitle: data.chainStepTitle || 'Avanço Automático IA',
        updatedScore: data.updatedScore || 92,
        leadTemperature: data.leadTemperature || 'HOT',
        executedTools: data.executedTools || [],
        latencyMs: data.latencyMs || 290,
      });
    } catch {
      setTestResult({
        replyText: `Olá! Como vocês já têm 25 vendedores e urgência para esta semana, acionei nosso Fast-Track Enterprise. Aqui está a proposta: ${proposalUrlDraft}`,
        strategyTag: 'Fast-Track (Venda Rápida)',
        detectedSentiment: 'Interesse em Proposta',
        nextStage: 'proposta',
        chainStepTitle: 'Fast-Track: Proposta Enviada',
        updatedScore: 95,
        leadTemperature: 'HOT',
        executedTools: [],
        latencyMs: 310,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleRunProspectScraping = (e: React.FormEvent) => {
    e.preventDefault();
    setIsScraping(true);
    setTimeout(() => {
      const nowId = Date.now();
      const generated: ScrapedProspect[] = [
        {
          id: `scr-${nowId}-1`,
          company: `${prospectNiche.split(' ')[0] || 'Prime'} Center ${prospectCity.split(',')[0]}`,
          contactName: 'Roberto Vasconcelos (Sócio-Diretor)',
          phone: '+55 (11) 99610-4401',
          niche: prospectNiche,
          city: prospectCity,
          rating: '4.9 ★ (280 avaliações Google Maps)',
          whatsappVerified: true,
          estimatedTicket: 48000,
        },
        {
          id: `scr-${nowId}-2`,
          company: `Grupo Alpha ${prospectNiche.split(' ')[0] || 'Corporate'}`,
          contactName: 'Camila Fontes (Head Comercial)',
          phone: '+55 (11) 98841-2190',
          niche: prospectNiche,
          city: prospectCity,
          rating: '5.0 ★ (410 avaliações Google Maps)',
          whatsappVerified: true,
          estimatedTicket: 62000,
        },
        {
          id: `scr-${nowId}-3`,
          company: `Vanguard ${prospectNiche.split(' ')[0] || 'Solutions'} Ltda`,
          contactName: 'Fernando Albuquerque (CEO)',
          phone: '+55 (11) 97118-9902',
          niche: prospectNiche,
          city: prospectCity,
          rating: '4.8 ★ (165 avaliações Google Maps)',
          whatsappVerified: true,
          estimatedTicket: 39500,
        },
      ];
      setScrapedProspects(generated);
      setIsScraping(false);
    }, 650);
  };

  const handleInjectProspectToFunnel = (prospect: ScrapedProspect) => {
    if (!onAddLead || prospect.injected) return;
    const newLead: Lead = {
      id: `lead-scraped-${Date.now()}`,
      code: `#LD-${Math.floor(1000 + Math.random() * 8999)}`,
      name: prospect.contactName,
      company: prospect.company,
      cnpj: '41.209.881/0001-90',
      email: `contato@${prospect.company.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 14)}.com.br`,
      phone: prospect.phone,
      channel: 'whatsapp',
      pipeline: 'prospeccao_outbound',
      trafficCategory: 'Prospecção Ativa',
      stage: 'prospeccao',
      sentiment: 'Novo Contato',
      serviceChain: [
        {
          id: `sc-${Date.now()}-1`,
          order: 1,
          title: '1. Extraído via Motor Google Maps & Validado no WhatsApp',
          stage: 'prospeccao',
          status: 'em_andamento',
          timestamp: 'Agora',
        },
        {
          id: `sc-${Date.now()}-2`,
          order: 2,
          title: '2. Qualificação Cognitiva SPIN / BANT',
          stage: 'qualificacao',
          status: 'pendente',
        },
        {
          id: `sc-${Date.now()}-3`,
          order: 3,
          title: '3. Apresentação de Proposta & Fechamento',
          stage: 'proposta',
          status: 'pendente',
        },
      ],
      productTier: 'ENTERPRISE',
      score: 76,
      valueNum: prospect.estimatedTicket,
      valueFormatted: `R$ ${prospect.estimatedTicket.toLocaleString('pt-BR')}`,
      monthlyTicket: `R$ ${Math.round(prospect.estimatedTicket / 12).toLocaleString('pt-BR')}/mês`,
      closingProb: '76.0%',
      controlMode: 'ai',
      assignedAgent: activeAgent.name,
      avatarKey: 'lead_guilherme_sampaio',
      statusBadge: 'NOVO • OUTBOUND',
      cadenceStatus: 'Abordagem D+0 Ativa',
      lastMessagePreview: `Lead extraído (${prospect.niche} - ${prospect.city}). Saudação inicial disparada via Evolution API.`,
      lastActive: 'Agora',
      slaText: 'Disparo Automático IA',
      trafficOrigin: `Scraper Google Maps • ${prospect.city}`,
      deviceInfo: 'WhatsApp Verificado • Evolution API',
      dossier: {
        dorPrincipal: `Escalar atendimento e vendas no nicho de ${prospect.niche}.`,
        preRequisito: 'Integração rápida via QR Code / API Oficial.',
        estagioAtual: 'Topo do Funil 1 (Prospecção Ativa).',
        recomendacao: 'Aguardar resposta à saudação inicial para qualificar.',
      },
      timeline: [
        {
          id: `tl-${Date.now()}`,
          time: 'Agora • Motor de Prospecção',
          title: `Extraído de Google Maps (${prospect.rating}) e injetado no Funil 1`,
          active: true,
        },
      ],
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: 'ai',
          senderName: activeAgent.name,
          text: activeAgent.greetingMessage,
          timestamp: 'Agora • WhatsApp Outbound',
          confidence: 'Confiança 99%',
          strategyTag: 'Disparo Prospecção D+0',
        },
      ],
    };

    onAddLead(newLead);
    setScrapedProspects((prev) =>
      prev.map((p) => (p.id === prospect.id ? { ...p, injected: true } : p))
    );
  };

  const masterSystemPromptPreview = buildMasterCognitiveSystemPrompt({
    agentName: nameDraft,
    agentRole: roleDraft,
    persona: personaDraft,
    links: {
      proposalUrl: proposalUrlDraft,
      checkoutUrl: checkoutUrlDraft,
      calendarUrl: calendarUrlDraft,
      websiteUrl: websiteUrlDraft,
    },
    customSystemPrompt: promptDraft,
  });

  const handleCopyPrompt = () => {
    navigator.clipboard?.writeText(masterSystemPromptPreview);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const getStageLabel = (st: FunnelStage) =>
    FUNNEL_STAGES_CONFIG.find((s) => s.id === st)?.title || st;

  const activePillarDoc =
    ARCHITECTURAL_PILLARS_DOCS.find((p) => p.id === selectedPillarId) ||
    ARCHITECTURAL_PILLARS_DOCS[0];

  return (
    <div className="flex flex-col w-full gap-space-lg pb-space-xl">
      {/* Header + 4 Sub-tabs Switcher */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-space-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
            <span className="font-telemetry-tag text-primary uppercase">
              Cérebro Cognitivo AUREUS OS // Persona, Tom de Voz, Máquina de Estados & Function Calling
            </span>
          </div>
          <h2 className="font-headline-lg text-on-surface mt-0.5">
            Agente de IA: Persona, Regras WhatsApp & Arquitetura Cognitiva
          </h2>
          <p className="font-body-sm text-on-surface-variant">
            Configure o tom de voz, persona e regras não-lineares do Gemini no WhatsApp (Fast-Track, Pacing BullMQ e Geladeira), construa fluxos por sentimento e acesse os 5 Pilares Arquiteturais.
          </p>
        </div>

        {/* Sub-navigation Pill Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 bg-surface-container-low p-1.5 rounded-xl border border-surface-container-high self-start xl:self-auto">
          <button
            type="button"
            onClick={() => setSubTab('persona_regras')}
            className={`px-3.5 py-2 rounded-lg font-headline-sm text-xs font-bold flex items-center gap-1.5 transition-all ${
              subTab === 'persona_regras'
                ? 'bg-primary-container text-on-primary shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Mic2 className="w-4 h-4" />
            <span>1. Persona, Tom de Voz & Regras WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('agente_config')}
            className={`px-3.5 py-2 rounded-lg font-headline-sm text-xs font-bold flex items-center gap-1.5 transition-all ${
              subTab === 'agente_config'
                ? 'bg-primary-container text-on-primary shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>2. Agentes & Links Principais</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('fluxo_sentimento')}
            className={`px-3.5 py-2 rounded-lg font-headline-sm text-xs font-bold flex items-center gap-1.5 transition-all ${
              subTab === 'fluxo_sentimento'
                ? 'bg-primary-container text-on-primary shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <GitBranch className="w-4 h-4" />
            <span>3. Fluxo Chatbot & Sentimento</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('arquitetura_prospeccao')}
            className={`px-3.5 py-2 rounded-lg font-headline-sm text-xs font-bold flex items-center gap-1.5 transition-all ${
              subTab === 'arquitetura_prospeccao'
                ? 'bg-primary-container text-on-primary shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>4. Prospecção & 5 Pilares (Blueprint)</span>
          </button>
        </div>
      </div>

      {/* Agent Selector Strip (Visible in Tabs 1 & 2) */}
      {(subTab === 'persona_regras' || subTab === 'agente_config') && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-space-md">
          {agents.map((ag) => {
            const isSelected = ag.id === activeAgent.id;
            return (
              <button
                key={ag.id}
                type="button"
                onClick={() => handleSelectAgent(ag)}
                className={`text-left p-space-md rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                  isSelected
                    ? 'bg-surface-container border-primary-container shadow-[0_0_25px_rgba(245,158,11,0.18)]'
                    : 'bg-surface-container-low/70 border-surface-container-high hover:bg-surface-container'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`p-2 rounded-lg ${
                        isSelected
                          ? 'bg-primary-container text-on-primary'
                          : 'bg-surface-container-high text-primary'
                      }`}
                    >
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-title-md text-on-surface font-bold">
                        {ag.name}
                      </h3>
                      <p className="font-telemetry-tag text-outline">
                        {ag.role}
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-secondary-container/20 text-secondary font-telemetry-tag text-[10px]">
                    ATIVO
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-surface-container-highest font-label-code text-xs">
                  <span className="text-on-surface-variant truncate">
                    {ag.whatsappInstance}
                  </span>
                  <span className="text-primary font-bold shrink-0">
                    {ag.autonomyLevel}% IA
                  </span>
                </div>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setNewAgentModalOpen(true)}
            className="p-space-md rounded-xl border border-dashed border-primary-container/50 bg-primary-container/5 hover:bg-primary-container/10 transition-all flex flex-col items-center justify-center gap-2 text-primary min-h-[115px]"
          >
            <div className="w-9 h-9 rounded-full bg-primary-container/20 flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </div>
            <span className="font-headline-sm text-sm font-bold">
              + Criar Novo Agente de IA
            </span>
          </button>
        </div>
      )}

      {/* =====================================================================
          ABA 1: PAINEL DE PERSONA, TOM DE VOZ & REGRAS ESPECÍFICAS (MÁQUINA DE ESTADOS)
      ===================================================================== */}
      {subTab === 'persona_regras' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
          {/* Left 7 Cols: Persona, Voice Tone & Non-Linear State Machine Rules */}
          <div className="lg:col-span-7 bg-surface-container/80 backdrop-blur-xl rounded-xl p-space-md sm:p-space-lg border border-surface-container-high flex flex-col gap-5 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-surface-container-highest">
              <div className="flex items-center gap-2">
                <Mic2 className="w-5 h-5 text-primary" />
                <div>
                  <h3 className="font-headline-sm text-on-surface">
                    Configuração de Tom de Voz, Persona & Regras no WhatsApp
                  </h3>
                  <p className="font-telemetry-tag text-outline">
                    Agente Selecionado: {nameDraft} • Orientado por Máquina de Estados
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveAgent}
                className="px-4 py-2 rounded-lg bg-primary-container text-on-primary font-headline-sm text-xs font-bold flex items-center gap-1.5 hover:brightness-110 transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)]"
              >
                {savedToast ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Persona & Regras Salvas!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Salvar Diretrizes no Gemini</span>
                  </>
                )}
              </button>
            </div>

            {/* Section 1: Arquétipo de Persona & Calibragem de Tom de Voz */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-telemetry-tag text-on-surface-variant uppercase block">
                  Arquétipo da Persona Comercial
                </label>
                <select
                  value={personaDraft.archetype}
                  onChange={(e) =>
                    setPersonaDraft({
                      ...personaDraft,
                      archetype: e.target
                        .value as AgentPersonaConfig['archetype'],
                    })
                  }
                  className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-lg px-3 py-2 text-xs text-primary font-bold focus:outline-none focus:border-primary-container"
                >
                  <option value="closer_consultivo_spin">
                    Closer Consultivo High-Ticket (SPIN Selling)
                  </option>
                  <option value="sdr_qualificador_bant">
                    SDR Ágil de Qualificação (Método BANT)
                  </option>
                  <option value="vendedor_direto_fasttrack">
                    Closer de Conversão Rápida (Fast-Track)
                  </option>
                  <option value="especialista_tecnico_rag">
                    Engenheiro de Soluções & RAG Técnico
                  </option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-telemetry-tag text-on-surface-variant uppercase block">
                  Formalidade na Conversa de WhatsApp
                </label>
                <select
                  value={personaDraft.formalityLevel}
                  onChange={(e) =>
                    setPersonaDraft({
                      ...personaDraft,
                      formalityLevel: e.target
                        .value as AgentPersonaConfig['formalityLevel'],
                    })
                  }
                  className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary-container"
                >
                  <option value="conversacional_whatsapp">
                    Conversacional Humanizado (Fluido para WhatsApp)
                  </option>
                  <option value="consultivo_empatico">
                    Consultivo & Empático (Foco em Diagnóstico)
                  </option>
                  <option value="executivo_corporativo">
                    Executivo C-Level (Corporativo B2B)
                  </option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-telemetry-tag text-on-surface-variant uppercase block">
                  Cadência & Tamanho dos Blocos de Texto
                </label>
                <select
                  value={personaDraft.messagePacingStyle}
                  onChange={(e) =>
                    setPersonaDraft({
                      ...personaDraft,
                      messagePacingStyle: e.target
                        .value as AgentPersonaConfig['messagePacingStyle'],
                    })
                  }
                  className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary-container"
                >
                  <option value="curto_dinamico">
                    Mensagens Curtas e Dinâmicas (2-3 frases estilo WhatsApp)
                  </option>
                  <option value="estruturado_detalhado">
                    Estruturado em Tópicos Executivos
                  </option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-telemetry-tag text-on-surface-variant uppercase block">
                  Política de Uso de Emojis
                </label>
                <select
                  value={personaDraft.useEmojis}
                  onChange={(e) =>
                    setPersonaDraft({
                      ...personaDraft,
                      useEmojis: e.target
                        .value as AgentPersonaConfig['useEmojis'],
                    })
                  }
                  className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary-container"
                >
                  <option value="moderado">
                    Moderado (Máximo 1 emoji sutil por resposta)
                  </option>
                  <option value="nenhum">Nenhum Emoji (100% Sobriedade)</option>
                  <option value="frequente">
                    Frequente & Expressivo (Alta Energia)
                  </option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-telemetry-tag text-on-surface-variant uppercase block">
                Definição Detalhada do Tom de Voz & Personalidade
              </label>
              <input
                type="text"
                value={personaDraft.voiceTone}
                onChange={(e) =>
                  setPersonaDraft({
                    ...personaDraft,
                    voiceTone: e.target.value,
                  })
                }
                className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary-container"
              />
            </div>

            {/* Section 2: As 3 Regras da Máquina de Estados Não-Linear + Guardrails */}
            <div className="space-y-3 pt-2 border-t border-surface-container-highest">
              <div className="flex items-center justify-between">
                <span className="font-telemetry-tag text-primary uppercase font-bold">
                  Regras Específicas da Máquina de Estados (Temperatura & Velocidade do Lead)
                </span>
                <span className="font-telemetry-tag text-[10px] text-secondary bg-secondary-container/15 px-2 py-0.5 rounded">
                  Aciona Function Calling Automaticamente
                </span>
              </div>

              {/* Rule 1: Fast-Track */}
              <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-primary-container/30 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-telemetry-tag text-xs text-primary font-bold flex items-center gap-1.5">
                    <Flame className="w-4 h-4" />
                    <span>1. Regra Fast-Track (Venda Rápida / Alta Intenção)</span>
                  </span>
                  <span className="font-label-code text-[10px] text-outline">
                    Pula Nutrição ➔ Proposta/Fechamento
                  </span>
                </div>
                <textarea
                  rows={2}
                  value={personaDraft.fastTrackRule}
                  onChange={(e) =>
                    setPersonaDraft({
                      ...personaDraft,
                      fastTrackRule: e.target.value,
                    })
                  }
                  className="w-full bg-surface-container-low border border-surface-container-highest rounded-lg p-2.5 text-xs text-on-surface focus:outline-none focus:border-primary-container resize-none"
                />
              </div>

              {/* Rule 2: Pacing Adaptativo (BullMQ) */}
              <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-secondary-container/30 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-telemetry-tag text-xs text-secondary font-bold flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    <span>
                      2. Regra de Pacing (Cadência Adaptativa & Fila BullMQ)
                    </span>
                  </span>
                  <span className="font-label-code text-[10px] text-outline">
                    Tool: schedule_followup(delay_in_hours)
                  </span>
                </div>
                <textarea
                  rows={2}
                  value={personaDraft.adaptivePacingRule}
                  onChange={(e) =>
                    setPersonaDraft({
                      ...personaDraft,
                      adaptivePacingRule: e.target.value,
                    })
                  }
                  className="w-full bg-surface-container-low border border-surface-container-highest rounded-lg p-2.5 text-xs text-on-surface focus:outline-none focus:border-primary-container resize-none"
                />
              </div>

              {/* Rule 3: Desqualificação, Geladeira & Remarketing */}
              <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-surface-container-high space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-telemetry-tag text-xs text-[#38bdf8] font-bold flex items-center gap-1.5">
                    <Snowflake className="w-4 h-4" />
                    <span>
                      3. Regra de Desqualificação, Geladeira & Remarketing Passivo
                    </span>
                  </span>
                  <span className="font-label-code text-[10px] text-outline">
                    Temperatura COLD ➔ Cadência Mensal
                  </span>
                </div>
                <textarea
                  rows={2}
                  value={personaDraft.coldFridgeRemarketingRule}
                  onChange={(e) =>
                    setPersonaDraft({
                      ...personaDraft,
                      coldFridgeRemarketingRule: e.target.value,
                    })
                  }
                  className="w-full bg-surface-container-low border border-surface-container-highest rounded-lg p-2.5 text-xs text-on-surface focus:outline-none focus:border-primary-container resize-none"
                />
              </div>

              {/* Rule 4: Strict Guardrails */}
              <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-surface-container-high space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-telemetry-tag text-xs text-on-surface font-bold flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-primary" />
                    <span>
                      4. Guardrails Inegociáveis do Gemini no WhatsApp
                    </span>
                  </span>
                  <span className="font-label-code text-[10px] text-outline">
                    Zero Alucinação & Handover Humano
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={personaDraft.strictGuardrails}
                  onChange={(e) =>
                    setPersonaDraft({
                      ...personaDraft,
                      strictGuardrails: e.target.value,
                    })
                  }
                  className="w-full bg-surface-container-low border border-surface-container-highest rounded-lg p-2.5 text-xs text-on-surface focus:outline-none focus:border-primary-container resize-none"
                />
              </div>
            </div>
          </div>

          {/* Right 5 Cols: Live Function Calling Simulator + Master System Prompt Inspector */}
          <div className="lg:col-span-5 flex flex-col gap-space-md">
            {/* Simulator Card */}
            <div className="bg-surface-container/80 backdrop-blur-xl rounded-xl p-space-md sm:p-space-lg border border-surface-container-high flex flex-col gap-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-surface-container-highest pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-secondary" />
                  <h3 className="font-headline-sm text-on-surface">
                    Simulador Cognitivo & Function Calling Real
                  </h3>
                </div>
                <span className="font-label-code text-xs text-primary">
                  Gemini + 4 Tools
                </span>
              </div>

              {/* Quick Scenario Presets */}
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    setTestInput(
                      'Temos 25 vendedores e urgência para ativar hoje. Qual o valor do Enterprise e me manda o link da proposta/pagamento!'
                    )
                  }
                  className="px-2.5 py-1 rounded bg-surface-container-lowest hover:bg-surface-container-high border border-primary-container/30 font-telemetry-tag text-[10px] text-primary"
                >
                  Cenário 1: Fast-Track (Alta Intenção)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setTestInput(
                      'Gostei da solução, mas estou entrando em viagem agora. Você pode me chamar daqui a 48 horas na quinta-feira?'
                    )
                  }
                  className="px-2.5 py-1 rounded bg-surface-container-lowest hover:bg-surface-container-high border border-secondary-container/30 font-telemetry-tag text-[10px] text-secondary"
                >
                  Cenário 2: Pacing (Agendar BullMQ 48h)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setTestInput(
                      'Nosso orçamento congelou neste trimestre, não vamos contratar agora. Quem sabe no próximo semestre.'
                    )
                  }
                  className="px-2.5 py-1 rounded bg-surface-container-lowest hover:bg-surface-container-high border border-surface-container-highest font-telemetry-tag text-[10px] text-[#38bdf8]"
                >
                  Cenário 3: Esfriou (Geladeira / Remarketing)
                </button>
              </div>

              <form
                onSubmit={(e) => handleRunSimulation(e, false)}
                className="space-y-3"
              >
                <textarea
                  rows={3}
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-xl p-3 font-body-sm text-on-surface focus:outline-none focus:border-primary-container resize-none"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="submit"
                    disabled={isTesting}
                    className="py-2.5 px-3 rounded-lg bg-primary-container text-on-primary font-headline-sm text-xs font-bold flex items-center justify-center gap-1.5 hover:brightness-110 transition-all disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>
                      {isTesting
                        ? 'Executando Tools...'
                        : 'Testar IA + Function Calling'}
                    </span>
                  </button>
                  <button
                    type="button"
                    disabled={isTesting}
                    onClick={(e) => handleRunSimulation(e, true)}
                    className="py-2.5 px-3 rounded-lg bg-surface-container-high hover:bg-surface-bright text-secondary border border-secondary/30 font-headline-sm text-xs font-bold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Simular Inatividade (Pacing)</span>
                  </button>
                </div>
              </form>

              {testResult && (
                <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-primary-container/40 space-y-3">
                  <div className="flex items-center justify-between border-b border-surface-container-high pb-2">
                    <span className="font-telemetry-tag text-primary uppercase font-bold">
                      {testResult.strategyTag}
                    </span>
                    <span className="font-label-code text-xs text-secondary">
                      Score: {testResult.updatedScore}/100 •{' '}
                      {testResult.leadTemperature} ({testResult.latencyMs}ms)
                    </span>
                  </div>

                  <p className="font-body-sm text-xs text-on-surface leading-relaxed bg-surface-container/60 p-2.5 rounded-lg border border-surface-container-high">
                    {testResult.replyText}
                  </p>

                  {/* Executed Function Calling Tools Log */}
                  <div className="space-y-1.5">
                    <span className="font-telemetry-tag text-[10px] text-secondary uppercase font-bold flex items-center gap-1">
                      <Terminal className="w-3.5 h-3.5" />
                      <span>
                        Tools Invocadas pelo Cérebro da IA (Timeline Audit):
                      </span>
                    </span>
                    <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1 thin-scrollbar">
                      {testResult.executedTools.map((t, i) => (
                        <div
                          key={i}
                          className="p-2 rounded bg-surface-container-low border border-surface-container-high text-[11px]"
                        >
                          <div className="font-label-code text-primary font-bold">
                            {t.timelineEvent.title}
                          </div>
                          <div className="text-on-surface-variant text-[10px] mt-0.5">
                            {t.timelineEvent.description}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Dynamic System Prompt Master Preview */}
            <div className="bg-surface-container/80 backdrop-blur-xl rounded-xl p-space-md border border-surface-container-high flex flex-col gap-3 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-primary" />
                  <span className="font-telemetry-tag text-primary uppercase font-bold">
                    System Prompt Mestre Gerado Dinamicamente
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyPrompt}
                  className="px-2.5 py-1 rounded bg-surface-container-high hover:bg-surface-bright text-on-surface font-telemetry-tag text-[10px] flex items-center gap-1"
                >
                  {copiedPrompt ? (
                    <>
                      <Check className="w-3 h-3 text-secondary" />
                      <span>Prompt Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copiar system_prompt</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3 rounded-lg bg-surface-container-lowest border border-surface-container-high font-label-code text-[11px] text-on-surface-variant overflow-x-auto max-h-56 thin-scrollbar whitespace-pre-wrap">
                {masterSystemPromptPreview}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          ABA 2: CONFIGURAÇÕES DO AGENTE + LINKS PRINCIPAIS DE CONVERSÃO
      ===================================================================== */}
      {subTab === 'agente_config' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
          <div className="lg:col-span-12 bg-surface-container/80 backdrop-blur-xl rounded-xl p-space-md sm:p-space-lg border border-surface-container-high flex flex-col gap-5 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-surface-container-highest">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-primary" />
                <h3 className="font-headline-sm text-on-surface">
                  Identidade, Instância WhatsApp & Links Principais —{' '}
                  {activeAgent.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleSaveAgent}
                className="px-4 py-2 rounded-lg bg-primary-container text-on-primary font-headline-sm text-xs font-bold flex items-center gap-1.5 hover:brightness-110 transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)]"
              >
                {savedToast ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Agente Salvo!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Salvar Configurações do Agente</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="font-telemetry-tag text-on-surface-variant uppercase block">
                  Nome do Agente de IA
                </label>
                <input
                  type="text"
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary-container"
                />
              </div>
              <div className="space-y-1">
                <label className="font-telemetry-tag text-on-surface-variant uppercase block">
                  Papel / Especialidade no Funil
                </label>
                <input
                  type="text"
                  value={roleDraft}
                  onChange={(e) => setRoleDraft(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary-container"
                />
              </div>
              <div className="space-y-1">
                <label className="font-telemetry-tag text-on-surface-variant uppercase block">
                  Resumo do Estilo de Atendimento
                </label>
                <input
                  type="text"
                  value={styleDraft}
                  onChange={(e) => setStyleDraft(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary-container"
                />
              </div>
              <div className="space-y-1">
                <label className="font-telemetry-tag text-on-surface-variant uppercase block">
                  Instância Evolution API / WhatsApp
                </label>
                <input
                  type="text"
                  value={waInstanceDraft}
                  onChange={(e) => setWaInstanceDraft(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-lg px-3 py-2 text-sm font-label-code text-primary focus:outline-none focus:border-primary-container"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-telemetry-tag text-on-surface-variant uppercase block">
                Mensagem de Saudação / Abordagem Inicial (Prospecção & Recepção)
              </label>
              <input
                type="text"
                value={greetingDraft}
                onChange={(e) => setGreetingDraft(e.target.value)}
                className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary-container"
              />
            </div>

            {/* LINKS PRINCIPAIS DO AGENTE */}
            <div className="p-4 rounded-xl bg-surface-container-lowest/90 border border-primary-container/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-primary" />
                  <span className="font-telemetry-tag text-primary uppercase font-bold">
                    Links Principais do Agente (Enviados Automaticamente na Conversa)
                  </span>
                </div>
                <span className="font-telemetry-tag text-[10px] text-secondary bg-secondary-container/15 px-2 py-0.5 rounded">
                  Injeção Automática por Etapa
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-telemetry-tag text-[10px] text-on-surface-variant uppercase block">
                    Link da Apresentação / Proposta Comercial (Etapa Proposta)
                  </label>
                  <input
                    type="url"
                    value={proposalUrlDraft}
                    onChange={(e) => setProposalUrlDraft(e.target.value)}
                    className="w-full bg-surface-container-low border border-surface-container-highest rounded-lg px-2.5 py-1.5 font-label-code text-xs text-primary focus:outline-none focus:border-primary-container"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-telemetry-tag text-[10px] text-on-surface-variant uppercase block">
                    Link Direto de Pagamento / Checkout (Etapa Fechamento)
                  </label>
                  <input
                    type="url"
                    value={checkoutUrlDraft}
                    onChange={(e) => setCheckoutUrlDraft(e.target.value)}
                    className="w-full bg-surface-container-low border border-surface-container-highest rounded-lg px-2.5 py-1.5 font-label-code text-xs text-secondary focus:outline-none focus:border-primary-container"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-telemetry-tag text-[10px] text-on-surface-variant uppercase block">
                    Link de Agendamento / Reunião (Etapa Follow-up)
                  </label>
                  <input
                    type="url"
                    value={calendarUrlDraft}
                    onChange={(e) => setCalendarUrlDraft(e.target.value)}
                    className="w-full bg-surface-container-low border border-surface-container-highest rounded-lg px-2.5 py-1.5 font-label-code text-xs text-on-surface focus:outline-none focus:border-primary-container"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-telemetry-tag text-[10px] text-on-surface-variant uppercase block">
                    Link de Conteúdo / Cases (Etapa Nutrição / Geladeira)
                  </label>
                  <input
                    type="url"
                    value={websiteUrlDraft}
                    onChange={(e) => setWebsiteUrlDraft(e.target.value)}
                    className="w-full bg-surface-container-low border border-surface-container-highest rounded-lg px-2.5 py-1.5 font-label-code text-xs text-on-surface focus:outline-none focus:border-primary-container"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-surface-container-high space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-telemetry-tag text-on-surface-variant">
                    Temperatura Criativa do Modelo Gemini
                  </span>
                  <span className="font-label-code text-primary font-bold">
                    {tempDraft.toFixed(1)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.1"
                  value={tempDraft}
                  onChange={(e) => setTempDraft(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-surface-container-high space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-telemetry-tag text-on-surface-variant">
                    Autonomia de Decisão e Movimentação no Funil
                  </span>
                  <span className="font-label-code text-secondary font-bold">
                    {autonomyDraft}%
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  step="1"
                  value={autonomyDraft}
                  onChange={(e) =>
                    setAutonomyDraft(parseInt(e.target.value, 10))
                  }
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          ABA 3: ESTRUTURA DE CHATBOT & REGRAS DE SENTIMENTO ➔ AVANÇO NO FUNIL
      ===================================================================== */}
      {subTab === 'fluxo_sentimento' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
          {/* Left 7 Cols: Visual Connected Block Chain */}
          <div className="lg:col-span-7 bg-surface-container/80 backdrop-blur-xl rounded-xl p-space-md sm:p-space-lg border border-surface-container-high flex flex-col gap-4 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-surface-container-highest">
              <div>
                <h3 className="font-headline-sm text-on-surface">
                  Cadeia Visual do Chatbot: Sentimento da Conversa ➔ Estágio do Funil
                </h3>
                <p className="font-body-sm text-xs text-on-surface-variant">
                  Clique em qualquer bloco abaixo para configurar o gatilho de sentimento, o que a IA responde e para qual coluna do CRM o card avança.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddFlowNode}
                className="px-3 py-2 rounded-lg bg-primary-container text-on-primary font-headline-sm text-xs font-bold flex items-center gap-1.5 hover:brightness-110 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Bloco na Cadeia</span>
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {chatbotNodes.map((node, idx) => {
                const isSelected = node.id === selectedNode?.id;
                return (
                  <React.Fragment key={node.id}>
                    <div
                      onClick={() => setSelectedNodeId(node.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col gap-2.5 ${
                        isSelected
                          ? 'bg-surface-container-lowest border-primary-container shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                          : 'bg-surface-container-lowest/60 border-surface-container-high hover:border-primary-container/40'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-primary-container text-on-primary font-label-code text-xs font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <h4 className="font-title-md text-on-surface font-bold">
                            {node.title}
                          </h4>
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded bg-secondary-container/15 text-secondary font-telemetry-tag text-[10px] flex items-center gap-1">
                            <Smile className="w-3 h-3" />
                            <span>{node.detectedSentiment}</span>
                          </span>
                          <span className="px-2 py-0.5 rounded bg-primary-container/20 text-primary font-label-code text-[11px] font-bold">
                            {getStageLabel(node.fromStage)} ➔{' '}
                            {getStageLabel(node.targetStage)}
                          </span>
                        </div>
                      </div>

                      <p className="font-body-sm text-xs text-on-surface-variant">
                        <strong className="text-on-surface">Gatilho:</strong>{' '}
                        {node.triggerCondition}
                      </p>

                      <div className="p-2.5 rounded-lg bg-surface-container-low border border-surface-container-high flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2">
                          <MessageSquare className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                          <span className="font-body-sm text-xs text-on-surface">
                            {node.aiActionTemplate}
                          </span>
                        </div>
                        {node.attachedLinkType &&
                          node.attachedLinkType !== 'none' && (
                            <span className="px-2 py-0.5 rounded bg-surface-container-highest text-primary font-telemetry-tag text-[9px] shrink-0">
                              + Link: {node.attachedLinkType}
                            </span>
                          )}
                      </div>
                    </div>

                    {idx < chatbotNodes.length - 1 && (
                      <div className="flex items-center justify-center -my-1">
                        <div className="w-0.5 h-4 bg-primary-container/50" />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Right 5 Cols: Inspector & Editor for Selected Chatbot Block */}
          <div className="lg:col-span-5 bg-surface-container/80 backdrop-blur-xl rounded-xl p-space-md sm:p-space-lg border border-surface-container-high flex flex-col justify-between gap-4 shadow-xl h-fit sticky top-4">
            {selectedNode ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-surface-container-highest pb-3">
                  <div className="flex items-center gap-2">
                    <Workflow className="w-4 h-4 text-primary" />
                    <h3 className="font-headline-sm text-on-surface">
                      Editar Bloco #{selectedNode.order} da Cadeia
                    </h3>
                  </div>
                  {chatbotNodes.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteFlowNode(selectedNode.id)}
                      className="p-1.5 rounded-lg bg-error-container/20 text-error hover:bg-error-container/40 transition-colors"
                      title="Remover bloco"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="font-telemetry-tag text-on-surface-variant uppercase block">
                    Título da Etapa na Cadeia
                  </label>
                  <input
                    type="text"
                    value={selectedNode.title}
                    onChange={(e) =>
                      handleUpdateSelectedNode({ title: e.target.value })
                    }
                    className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary-container"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-telemetry-tag text-on-surface-variant uppercase block">
                      Tipo de Evento / Gatilho
                    </label>
                    <select
                      value={selectedNode.triggerType}
                      onChange={(e) =>
                        handleUpdateSelectedNode({
                          triggerType: e.target
                            .value as ChatbotFlowNode['triggerType'],
                        })
                      }
                      className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary-container"
                    >
                      <option value="mensagem_lead">
                        Quando o Lead Responde
                      </option>
                      <option value="inatividade_lead">
                        Quando o Lead Para de Responder (Inativo)
                      </option>
                      <option value="intencao_compra">
                        Quando Demonstra Intenção de Compra / Proposta
                      </option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-telemetry-tag text-on-surface-variant uppercase block">
                      Sentimento Identificado pela IA
                    </label>
                    <select
                      value={selectedNode.detectedSentiment}
                      onChange={(e) =>
                        handleUpdateSelectedNode({
                          detectedSentiment: e.target.value as LeadSentiment,
                        })
                      }
                      className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-lg px-3 py-2 text-xs text-secondary font-bold focus:outline-none focus:border-primary-container"
                    >
                      {SENTIMENT_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-telemetry-tag text-on-surface-variant uppercase block">
                    Condição Analisada pela IA na Conversa
                  </label>
                  <input
                    type="text"
                    value={selectedNode.triggerCondition}
                    onChange={(e) =>
                      handleUpdateSelectedNode({
                        triggerCondition: e.target.value,
                      })
                    }
                    className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary-container"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-primary-container/30 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-telemetry-tag text-[10px] text-outline uppercase block">
                      Sai do Estágio (Origem):
                    </label>
                    <select
                      value={selectedNode.fromStage}
                      onChange={(e) =>
                        handleUpdateSelectedNode({
                          fromStage: e.target.value as FunnelStage,
                        })
                      }
                      className="w-full bg-surface-container-low border border-surface-container-highest rounded-lg px-2.5 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary-container"
                    >
                      {FUNNEL_STAGES_CONFIG.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-telemetry-tag text-[10px] text-primary uppercase font-bold block">
                      Avança Automaticamente Para:
                    </label>
                    <select
                      value={selectedNode.targetStage}
                      onChange={(e) =>
                        handleUpdateSelectedNode({
                          targetStage: e.target.value as FunnelStage,
                        })
                      }
                      className="w-full bg-surface-container-low border border-primary-container rounded-lg px-2.5 py-1.5 text-xs text-primary font-bold focus:outline-none"
                    >
                      {FUNNEL_STAGES_CONFIG.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-telemetry-tag text-on-surface-variant uppercase block">
                    Ação / Resposta Automática do Agente de IA
                  </label>
                  <textarea
                    rows={3}
                    value={selectedNode.aiActionTemplate}
                    onChange={(e) =>
                      handleUpdateSelectedNode({
                        aiActionTemplate: e.target.value,
                      })
                    }
                    className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-xl p-3 text-xs text-on-surface focus:outline-none focus:border-primary-container resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-telemetry-tag text-on-surface-variant uppercase block">
                    Anexar Link Principal do Agente Nesta Etapa
                  </label>
                  <select
                    value={selectedNode.attachedLinkType || 'none'}
                    onChange={(e) =>
                      handleUpdateSelectedNode({
                        attachedLinkType: e.target
                          .value as ChatbotFlowNode['attachedLinkType'],
                      })
                    }
                    className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary-container"
                  >
                    <option value="none">Nenhum link obrigatório</option>
                    <option value="proposalUrl">
                      Link da Proposta Comercial (PDF / Apresentação)
                    </option>
                    <option value="checkoutUrl">
                      Link Direto de Pagamento / Checkout
                    </option>
                    <option value="calendarUrl">
                      Link de Agendamento de Reunião
                    </option>
                    <option value="websiteUrl">
                      Link de Conteúdo / Cases de Nutrição
                    </option>
                  </select>
                </div>

                <div className="p-3 rounded-lg bg-primary-container/10 border border-primary-container/30 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-primary font-telemetry-tag text-xs">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Sincronizado em tempo real com Conversas e CRM</span>
                  </div>
                  {onNavigate && (
                    <button
                      type="button"
                      onClick={() => onNavigate('crm-funil')}
                      className="font-telemetry-tag text-xs text-secondary underline"
                    >
                      Ver Funil CRM
                    </button>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* =====================================================================
          ABA 4: MOTOR DE PROSPECÇÃO OUTBOUND (PILAR 5) + BLUEPRINT DOS 5 PILARES
      ===================================================================== */}
      {subTab === 'arquitetura_prospeccao' && (
        <div className="flex flex-col gap-space-lg">
          {/* Top Block: Pilar 5 — Motor Interativo de Prospecção (Google Maps & Redes ➔ Topo do Funil 1) */}
          <div className="bg-surface-container/80 backdrop-blur-xl rounded-xl p-space-md sm:p-space-lg border border-surface-container-high flex flex-col gap-4 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-surface-container-highest pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-primary-container/20 text-primary">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-headline-sm text-on-surface">
                    Pilar 5 — Motor de Prospecção Outbound (Scraping Google Maps / Redes ➔ Topo do Funil 1)
                  </h3>
                  <p className="font-body-sm text-xs text-on-surface-variant">
                    Extraia empresas segmentadas por nicho e cidade, valide números ativos de WhatsApp via Evolution API e injete diretamente na coluna Prospecção do Funil 1.
                  </p>
                </div>
              </div>
              {onNavigate && (
                <button
                  type="button"
                  onClick={() => onNavigate('crm-funil')}
                  className="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-primary font-telemetry-tag text-xs flex items-center gap-1.5"
                >
                  <span>Abrir Funil 1 (Prospecção)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <form
              onSubmit={handleRunProspectScraping}
              className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end"
            >
              <div className="md:col-span-5 space-y-1">
                <label className="font-telemetry-tag text-[10px] text-on-surface-variant uppercase block">
                  Nicho / Segmento Alvo (Google Maps & LinkedIn)
                </label>
                <input
                  type="text"
                  value={prospectNiche}
                  onChange={(e) => setProspectNiche(e.target.value)}
                  placeholder="Ex: Clínicas Odontológicas, Escritórios de Advocacia..."
                  className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary-container"
                />
              </div>

              <div className="md:col-span-4 space-y-1">
                <label className="font-telemetry-tag text-[10px] text-on-surface-variant uppercase block">
                  Cidade / Região Geográfica
                </label>
                <input
                  type="text"
                  value={prospectCity}
                  onChange={(e) => setProspectCity(e.target.value)}
                  placeholder="Ex: São Paulo, SP"
                  className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary-container"
                />
              </div>

              <div className="md:col-span-3">
                <button
                  type="submit"
                  disabled={isScraping}
                  className="w-full py-2 px-4 rounded-lg bg-primary-container text-on-primary font-headline-sm text-xs font-bold flex items-center justify-center gap-2 hover:brightness-110 transition-all"
                >
                  <Search className="w-4 h-4" />
                  <span>
                    {isScraping
                      ? 'Extraindo & Validando...'
                      : 'Extrair & Validar WhatsApp'}
                  </span>
                </button>
              </div>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              {scrapedProspects.map((prospect) => (
                <div
                  key={prospect.id}
                  className="p-3.5 rounded-xl bg-surface-container-lowest border border-surface-container-high flex flex-col justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-secondary-container/15 text-secondary font-telemetry-tag text-[9px]">
                        WHATSAPP VERIFICADO
                      </span>
                      <span className="font-label-code text-[10px] text-primary">
                        {prospect.rating}
                      </span>
                    </div>
                    <h4 className="font-title-md text-on-surface font-bold">
                      {prospect.company}
                    </h4>
                    <p className="font-body-sm text-xs text-on-surface-variant">
                      {prospect.contactName} • {prospect.phone}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-surface-container-highest">
                    <span className="font-label-code text-xs text-primary font-bold">
                      Est. R$ {prospect.estimatedTicket.toLocaleString('pt-BR')}
                    </span>
                    <button
                      type="button"
                      disabled={prospect.injected}
                      onClick={() => handleInjectProspectToFunnel(prospect)}
                      className={`px-3 py-1.5 rounded-lg font-telemetry-tag text-[10px] font-bold flex items-center gap-1 transition-all ${
                        prospect.injected
                          ? 'bg-secondary-container/20 text-secondary'
                          : 'bg-primary-container text-on-primary hover:brightness-110'
                      }`}
                    >
                      {prospect.injected ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Injetado no Funil 1</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Injetar no Topo do Funil 1</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Block: Blueprint Arquitetural & Códigos Reais dos 5 Pilares (AUREUS OS) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
            <div className="lg:col-span-4 flex flex-col gap-2.5">
              {ARCHITECTURAL_PILLARS_DOCS.map((pillar) => {
                const isSelected = pillar.id === selectedPillarId;
                return (
                  <button
                    key={pillar.id}
                    type="button"
                    onClick={() => setSelectedPillarId(pillar.id)}
                    className={`text-left p-4 rounded-xl border transition-all flex flex-col gap-1.5 ${
                      isSelected
                        ? 'bg-surface-container border-primary-container shadow-[0_0_20px_rgba(245,158,11,0.18)]'
                        : 'bg-surface-container-low/70 border-surface-container-high hover:bg-surface-container'
                    }`}
                  >
                    <span className="font-telemetry-tag text-[10px] text-primary font-bold">
                      {pillar.badge}
                    </span>
                    <h4 className="font-title-md text-on-surface font-bold">
                      {pillar.title}
                    </h4>
                    <p className="font-body-sm text-xs text-on-surface-variant line-clamp-2">
                      {pillar.summary}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="lg:col-span-8 bg-surface-container/80 backdrop-blur-xl rounded-xl p-space-md sm:p-space-lg border border-surface-container-high flex flex-col gap-4 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-surface-container-highest pb-3">
                <div>
                  <span className="font-telemetry-tag text-primary uppercase font-bold">
                    {activePillarDoc.badge}
                  </span>
                  <h3 className="font-headline-sm text-on-surface mt-0.5">
                    {activePillarDoc.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(activePillarDoc.codeSnippet);
                    setCopiedCodeId(activePillarDoc.id);
                    setTimeout(() => setCopiedCodeId(null), 2000);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-telemetry-tag text-xs flex items-center gap-1.5"
                >
                  {copiedCodeId === activePillarDoc.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-secondary" />
                      <span>Código Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-primary" />
                      <span>Copiar Implementação</span>
                    </>
                  )}
                </button>
              </div>

              <p className="font-body-sm text-on-surface-variant">
                {activePillarDoc.summary}
              </p>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-telemetry-tag text-[10px] text-outline uppercase">
                  Arquivos Reais no Projeto:
                </span>
                {activePillarDoc.files.map((f) => (
                  <span
                    key={f}
                    className="px-2.5 py-1 rounded bg-surface-container-lowest border border-surface-container-highest font-label-code text-xs text-secondary"
                  >
                    {f}
                  </span>
                ))}
              </div>

              <pre className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container-high font-label-code text-xs text-on-surface overflow-x-auto max-h-[420px] thin-scrollbar whitespace-pre-wrap">
                {activePillarDoc.codeSnippet}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Criar Novo Agente de IA */}
      {newAgentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-surface-container-low border border-surface-container-highest rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-5 py-4 bg-surface-container border-b border-surface-container-highest flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                <h3 className="font-headline-sm text-on-surface">
                  Criar Novo Agente de IA
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setNewAgentModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface text-sm"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateNewAgent} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="font-telemetry-tag text-on-surface-variant uppercase block">
                  Nome do Agente *
                </label>
                <input
                  type="text"
                  required
                  value={newAgName}
                  onChange={(e) => setNewAgName(e.target.value)}
                  placeholder="Ex: Agente Especialista Tráfego Pago"
                  className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary-container"
                />
              </div>
              <div className="space-y-1">
                <label className="font-telemetry-tag text-on-surface-variant uppercase block">
                  Função / Objetivo no Atendimento
                </label>
                <input
                  type="text"
                  value={newAgRole}
                  onChange={(e) => setNewAgRole(e.target.value)}
                  placeholder="Ex: Qualificar leads de anúncios e agendar reunião"
                  className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary-container"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewAgentModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-surface-container-high text-on-surface-variant font-telemetry-tag text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-primary-container text-on-primary font-headline-sm text-xs font-bold"
                >
                  Criar Agente Agora
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
