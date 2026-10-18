export type NavigationTab =
  | 'dashboard'
  | 'inbox-omnichannel'
  | 'conexoes-whatsapp'
  | 'cerebro-automacao'
  | 'crm-funil'
  | 'cadencias-remarketing'
  | 'base-de-conhecimento'
  | 'configuracoes-gerais'
  | 'links-imagens-html';

export type ChannelType = 'whatsapp' | 'instagram' | 'webchat';

export type FunnelPipelineType = 'prospeccao_outbound' | 'trafego_inbound';

export type FunnelStage =
  | 'prospeccao'
  | 'qualificacao'
  | 'nutricao'
  | 'followup'
  | 'proposta'
  | 'negociacao'
  | 'fechamento'
  | 'venda_fechada';

export type LeadSentiment =
  | 'Novo Contato'
  | 'Curioso / Respondendo'
  | 'Qualificado / Engajado'
  | 'Inativo / Parou de Responder'
  | 'Interesse em Proposta'
  | 'Negociando Condições'
  | 'Alta Intenção / Fechamento'
  | 'Venda Confirmada';

export interface ServiceChainStep {
  id: string;
  order: number;
  title: string;
  stage: FunnelStage;
  status: 'concluido' | 'em_andamento' | 'pendente';
  timestamp?: string;
  note?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'lead' | 'ai' | 'human';
  senderName?: string;
  text: string;
  timestamp: string;
  confidence?: string;
  strategyTag?: string;
  sentimentDetected?: LeadSentiment;
  stageTransition?: {
    from: FunnelStage;
    to: FunnelStage;
  };
  latencyMs?: number;
}

export interface LeadDossierSummary {
  dorPrincipal: string;
  preRequisito: string;
  estagioAtual: string;
  recomendacao: string;
}

export interface LeadTimelineEvent {
  id: string;
  time: string;
  title: string;
  active?: boolean;
}

export interface Lead {
  id: string;
  code: string;
  name: string;
  company: string;
  cnpj: string;
  email: string;
  phone: string;
  channel: ChannelType;
  pipeline: FunnelPipelineType;
  trafficCategory: 'Prospecção Ativa' | 'Tráfego Pago' | 'Orgânico';
  stage: FunnelStage;
  sentiment: LeadSentiment;
  serviceChain: ServiceChainStep[];
  productTier: 'ENTERPRISE' | 'PRO';
  score: number;
  valueNum: number;
  valueFormatted: string;
  monthlyTicket: string;
  closingProb: string;
  controlMode: 'ai' | 'human';
  assignedAgent: string;
  humanOperator?: string;
  humanAvatarKey?: string;
  avatarKey: string;
  statusBadge: string;
  cadenceStatus: string;
  lastMessagePreview: string;
  lastActive: string;
  slaText: string;
  aiReasoningNote?: string;
  bantApproved?: string;
  stripeTx?: string;
  trafficOrigin: string;
  deviceInfo: string;
  dossier: LeadDossierSummary;
  timeline: LeadTimelineEvent[];
  messages: ChatMessage[];
}

export interface AgentLinks {
  proposalUrl: string;
  checkoutUrl: string;
  calendarUrl: string;
  websiteUrl: string;
}

export interface AgentPersonaConfig {
  archetype:
    | 'closer_consultivo_spin'
    | 'sdr_qualificador_bant'
    | 'especialista_tecnico_rag'
    | 'vendedor_direto_fasttrack';
  voiceTone: string;
  formalityLevel: 'executivo_corporativo' | 'conversacional_whatsapp' | 'consultivo_empatico';
  messagePacingStyle: 'curto_dinamico' | 'estruturado_detalhado';
  useEmojis: 'moderado' | 'nenhum' | 'frequente';
  fastTrackRule: string;
  adaptivePacingRule: string;
  coldFridgeRemarketingRule: string;
  strictGuardrails: string;
}

export interface ExecutedToolCallLog {
  id: string;
  toolName:
    | 'qualify_lead'
    | 'update_kanban_stage'
    | 'schedule_followup'
    | 'request_human_handover';
  args: Record<string, unknown>;
  resultSummary: string;
  timestamp: string;
}

export interface AgentSpecialist {
  id: string;
  name: string;
  role: string;
  greetingMessage: string;
  attendanceStyle: string;
  whatsappInstance: string;
  links: AgentLinks;
  personaConfig?: AgentPersonaConfig;
  metricLabel: string;
  metricValue: number;
  volumeLabel: string;
  secondaryLabel: string;
  status: 'active' | 'standby';
  model: string;
  temperature: number;
  autonomyLevel: number;
  systemPrompt: string;
}

export interface ChatbotFlowNode {
  id: string;
  order: number;
  title: string;
  triggerType: 'mensagem_lead' | 'inatividade_lead' | 'intencao_compra';
  triggerCondition: string;
  detectedSentiment: LeadSentiment;
  fromStage: FunnelStage;
  targetStage: FunnelStage;
  aiActionTemplate: string;
  attachedLinkType?:
    | 'none'
    | 'proposalUrl'
    | 'checkoutUrl'
    | 'calendarUrl'
    | 'websiteUrl';
  waitMinutesIfInactive?: number;
}

export interface TelemetryStreamEvent {
  id: string;
  category: string;
  categoryColor: 'amber' | 'gold' | 'cyan' | 'slate';
  timeAgo: string;
  description: string;
  highlightName: string;
  tag: string;
  channel: ChannelType;
  linkedLeadId?: string;
  targetTab?: NavigationTab;
}

export interface KnowledgeDocument {
  id: string;
  title: string;
  type: 'PDF' | 'MARKDOWN' | 'JSON_API' | 'PLAYBOOK';
  chunks: number;
  embeddingModel: string;
  updatedAt: string;
  status: 'indexed' | 'syncing';
  contentSummary: string;
}

export interface CadenceSequence {
  id: string;
  name: string;
  channel: ChannelType;
  targetAudience: string;
  activeLeads: number;
  conversionRate: string;
  steps: {
    day: string;
    title: string;
    template: string;
    delay: string;
  }[];
}

export interface IntegrationConnector {
  id: string;
  name: string;
  category: 'Messaging' | 'ERP & CRM' | 'Pagamentos' | 'LLM Engine';
  status: 'connected' | 'live' | 'standby';
  latency: string;
  webhookUrl: string;
  throughput: string;
  description: string;
  assignedAgentId?: string;
  phoneOrHandle?: string;
  connectionType?: 'qr_code' | 'cloud_api' | 'webhook';
}

export interface GeneralSystemConfig {
  autoAdvanceFunnelBySentiment: boolean;
  autoMoveToNutritionOnInactivity: boolean;
  inactivityMinutesForNutrition: number;
  inactivityHoursForFollowup: number;
  whatsappDefaultInstance: string;
  whatsappOfficialPhoneId: string;
  whatsappOfficialWabaId: string;
  whatsappWebhookVerifyToken: string;
  enableAudioTranscription: boolean;
  enableAutoCheckoutLinks: boolean;
  operatingHoursMode: '24_7' | 'comercial';
}

export interface ImageAssetConfig {
  key: string;
  label: string;
  category: 'brand' | 'operator' | 'lead' | 'screen_html';
  url: string;
  alt: string;
  linkedTab?: NavigationTab;
  linkedLeadId?: string;
}

export const FUNNEL_STAGES_CONFIG: {
  id: FunnelStage;
  title: string;
  subtitle: string;
  shortLabel: string;
  specialGlow?: boolean;
}[] = [
  {
    id: 'prospeccao',
    title: 'Prospecção / Novo Lead',
    subtitle: 'ENTRADA & ABORDAGEM D+0',
    shortLabel: 'Prospecção',
  },
  {
    id: 'qualificacao',
    title: 'Qualificação',
    subtitle: 'PROCESSAMENTO IA ATIVO',
    shortLabel: 'Qualificação',
    specialGlow: true,
  },
  {
    id: 'nutricao',
    title: 'Nutrição',
    subtitle: 'CONTEÚDO & INATIVIDADE',
    shortLabel: 'Nutrição',
  },
  {
    id: 'followup',
    title: 'Follow-up',
    subtitle: 'RETOMADA DE CADÊNCIA',
    shortLabel: 'Follow-up',
  },
  {
    id: 'proposta',
    title: 'Proposta',
    subtitle: 'APRESENTAÇÃO COMERCIAL',
    shortLabel: 'Proposta',
  },
  {
    id: 'negociacao',
    title: 'Negociação',
    subtitle: 'QUEBRA DE OBJEÇÕES',
    shortLabel: 'Negociação',
  },
  {
    id: 'fechamento',
    title: 'Fechamento',
    subtitle: 'CHECKOUT & CONTRATO',
    shortLabel: 'Fechamento',
  },
  {
    id: 'venda_fechada',
    title: 'Venda Fechada',
    subtitle: 'CONVERSÃO CONCLUÍDA',
    shortLabel: 'Venda Fechada',
  },
];
