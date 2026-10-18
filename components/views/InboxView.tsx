'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  SlidersHorizontal,
  RefreshCw,
  Bot,
  Headphones,
  CheckCircle2,
  History,
  MoreVertical,
  Zap,
  CheckCheck,
  Lightbulb,
  Lock,
  Unlock,
  Paperclip,
  Mic,
  Send,
  Brain,
  FileText,
  CreditCard,
  UserPlus,
  RotateCcw,
  ChevronRight,
  Sparkles,
  MessageSquare,
  Users,
  Clock,
  GitCommitHorizontal,
  ArrowRight,
  UserCheck,
} from 'lucide-react';
import {
  AgentSpecialist,
  ChannelType,
  ChatMessage,
  FUNNEL_STAGES_CONFIG,
  FunnelStage,
  ImageAssetConfig,
  KnowledgeDocument,
  Lead,
  LeadSentiment,
  NavigationTab,
  ServiceChainStep,
} from '@/lib/types';
import EditableImage from '@/components/EditableImage';

interface InboxViewProps {
  leads: Lead[];
  selectedLeadId: string;
  agents: AgentSpecialist[];
  knowledgeDocs: KnowledgeDocument[];
  assets: Record<string, ImageAssetConfig>;
  onSelectLead: (id: string) => void;
  onUpdateLead: (updated: Lead) => void;
  onEditAsset: (key: string) => void;
  onNavigate: (tab: NavigationTab, leadId?: string) => void;
}

export default function InboxView({
  leads,
  selectedLeadId,
  agents,
  knowledgeDocs,
  assets,
  onSelectLead,
  onUpdateLead,
  onEditAsset,
  onNavigate,
}: InboxViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [channelFilter, setChannelFilter] = useState<'all' | ChannelType>('all');
  const [controlFilter, setControlFilter] = useState<'all' | 'ai' | 'human'>(
    'all'
  );
  const [manualInput, setManualInput] = useState('');
  // Sender mode: 'lead_sim' lets user type as the customer so AI automatically responds, detects sentiment, and advances the CRM funnel!
  const [inputMode, setInputMode] = useState<'lead_sim' | 'operator'>(
    'lead_sim'
  );
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [isUpdatingDossier, setIsUpdatingDossier] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<'list' | 'chat' | 'dossier'>(
    'chat'
  );

  const chatEndRef = useRef<HTMLDivElement>(null);

  const activeLead =
    leads.find((l) => l.id === selectedLeadId) || leads[0];

  const filteredLeads = leads.filter((l) => {
    const matchesSearch =
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.cnpj.includes(searchQuery) ||
      l.phone.includes(searchQuery);
    const matchesChannel =
      channelFilter === 'all' ? true : l.channel === channelFilter;
    const matchesControl =
      controlFilter === 'all' ? true : l.controlMode === controlFilter;
    return matchesSearch && matchesChannel && matchesControl;
  });

  const waCount = leads.filter((l) => l.channel === 'whatsapp').length;
  const igCount = leads.filter((l) => l.channel === 'instagram').length;
  const wbCount = leads.filter((l) => l.channel === 'webchat').length;
  const aiCount = leads.filter((l) => l.controlMode === 'ai').length;
  const humanCount = leads.filter((l) => l.controlMode === 'human').length;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeLead?.messages?.length, selectedLeadId]);

  const toggleHandover = () => {
    if (!activeLead) return;
    const nextMode = activeLead.controlMode === 'ai' ? 'human' : 'ai';
    setInputMode(nextMode === 'human' ? 'operator' : 'lead_sim');
    const updated: Lead = {
      ...activeLead,
      controlMode: nextMode,
      humanOperator:
        nextMode === 'human' ? 'Dr. Alex Vance (Você)' : undefined,
      cadenceStatus:
        nextMode === 'human'
          ? 'Atendimento Humano Assumido'
          : 'IA Ativa • 99% Conf.',
      timeline: [
        {
          id: `tl-${Date.now()}`,
          time: 'Agora',
          title:
            nextMode === 'human'
              ? 'Operador assumiu o controle manual do atendimento'
              : 'Controle autônomo devolvido para o Agente de IA',
          active: true,
        },
        ...activeLead.timeline,
      ],
    };
    onUpdateLead(updated);
  };

  const triggerAiEvolution = async (
    leadState: Lead,
    customInstruction?: string,
    isInactiveEvent = false
  ) => {
    if (isGeneratingAi) return;
    setIsGeneratingAi(true);
    try {
      const assignedAgentObj =
        agents.find((a) =>
          leadState.assignedAgent
            .toLowerCase()
            .includes(a.name.split(' ')[1]?.toLowerCase() || '')
        ) || agents[0];

      const knowledgeSummary = knowledgeDocs
        .map((d) => `${d.title}: ${d.contentSummary}`)
        .join(' | ');

      const res = await fetch('/api/aetheris-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat_reply',
          payload: {
            lead: leadState,
            messages: leadState.messages,
            agentName: assignedAgentObj?.name,
            agentRole: assignedAgentObj?.role,
            agentPrompt: assignedAgentObj?.systemPrompt,
            agentLinks: assignedAgentObj?.links,
            personaConfig: assignedAgentObj?.personaConfig,
            knowledgeSummary,
            customInstruction,
            isInactiveEvent,
          },
        }),
      });
      const data = await res.json();

      const nextStage: FunnelStage =
        (data.nextStage as FunnelStage) || leadState.stage;
      const nextSentiment: LeadSentiment =
        (data.detectedSentiment as LeadSentiment) || leadState.sentiment;
      const stageChanged = nextStage !== leadState.stage;
      const nextStageObj = FUNNEL_STAGES_CONFIG.find(
        (s) => s.id === nextStage
      );

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        senderName: leadState.assignedAgent || 'Agente Aetheris IA',
        text:
          data.replyText ||
          'Perfeito! Avancei seu atendimento e já separei nossa proposta personalizada.',
        confidence: data.confidence || 'Confiança 99%',
        strategyTag: data.strategyTag,
        sentimentDetected: nextSentiment,
        stageTransition: stageChanged
          ? { from: leadState.stage, to: nextStage }
          : undefined,
        timestamp: `Agora • Execução ${data.latencyMs || 320}ms`,
        latencyMs: data.latencyMs || 320,
      };

      const updatedChain: ServiceChainStep[] = leadState.serviceChain.map(
        (st) => ({
          ...st,
          status: 'concluido' as const,
        })
      );

      updatedChain.push({
        id: `sc-ai-${Date.now()}`,
        order: updatedChain.length + 1,
        title: `${updatedChain.length + 1}. ${
          data.chainStepTitle ||
          `Avançou p/ ${nextStageObj?.shortLabel || nextStage}`
        }`,
        stage: nextStage,
        status: nextStage === 'venda_fechada' ? 'concluido' : 'em_andamento',
        timestamp: 'Agora',
      });

      const toolTimelineEntries = Array.isArray(data.executedTools)
        ? data.executedTools.map(
            (
              t: {
                timelineEvent?: { title?: string; description?: string };
              },
              idx: number
            ) => ({
              id: `tl-tool-${Date.now()}-${idx}`,
              time: 'Agora • Function Calling',
              title: `${t.timelineEvent?.title || 'Tool Executada'} — ${
                t.timelineEvent?.description || ''
              }`,
              active: idx === 0,
            })
          )
        : [];

      onUpdateLead({
        ...leadState,
        stage: nextStage,
        sentiment: nextSentiment,
        score:
          typeof data.updatedScore === 'number'
            ? data.updatedScore
            : leadState.score,
        serviceChain: updatedChain,
        statusBadge:
          nextStage === 'venda_fechada'
            ? 'VENDA FECHADA'
            : nextStageObj?.shortLabel || leadState.statusBadge,
        cadenceStatus: `${data.strategyTag || 'IA Ativa'} • ${
          nextStageObj?.shortLabel || ''
        }`,
        lastMessagePreview: aiMsg.text,
        lastActive: 'Agora',
        messages: [...leadState.messages, aiMsg],
        timeline:
          toolTimelineEntries.length > 0
            ? [...toolTimelineEntries, ...leadState.timeline]
            : stageChanged
            ? [
                {
                  id: `tl-${Date.now()}`,
                  time: 'Agora',
                  title: `IA detectou sentimento "${nextSentiment}" e moveu automaticamente para ${nextStageObj?.title}`,
                  active: true,
                },
                ...leadState.timeline,
              ]
            : leadState.timeline,
      });
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim() || !activeLead) return;
    const text = manualInput.trim();
    setManualInput('');

    if (inputMode === 'lead_sim') {
      // Simulate lead sending a message -> AI automatically analyzes sentiment, replies, and advances the funnel!
      const leadMsg: ChatMessage = {
        id: `lead-${Date.now()}`,
        sender: 'lead',
        text,
        timestamp: 'Agora • WhatsApp (Resposta do Lead)',
      };
      const updatedWithLeadMsg: Lead = {
        ...activeLead,
        lastMessagePreview: text,
        lastActive: 'Agora',
        messages: [...activeLead.messages, leadMsg],
      };
      onUpdateLead(updatedWithLeadMsg);
      await triggerAiEvolution(updatedWithLeadMsg);
    } else {
      // Operator manual message
      const humanMsg: ChatMessage = {
        id: `hum-${Date.now()}`,
        sender: 'human',
        senderName: 'Dr. Alex Vance (Operador)',
        text,
        timestamp: 'Agora • Operador Manual',
      };
      onUpdateLead({
        ...activeLead,
        lastMessagePreview: text,
        lastActive: 'Agora',
        messages: [...activeLead.messages, humanMsg],
      });
    }
  };

  const handleRegenerateDossier = async () => {
    if (!activeLead || isUpdatingDossier) return;
    setIsUpdatingDossier(true);
    try {
      const res = await fetch('/api/aetheris-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'lead_dossier',
          payload: {
            lead: activeLead,
            messages: activeLead.messages,
          },
        }),
      });
      const data = await res.json();
      if (data && data.dorPrincipal) {
        onUpdateLead({
          ...activeLead,
          score: data.score || activeLead.score,
          closingProb: data.closingProb || activeLead.closingProb,
          dossier: {
            dorPrincipal: data.dorPrincipal,
            preRequisito: data.preRequisito,
            estagioAtual: data.estagioAtual,
            recomendacao: data.recomendacao,
          },
        });
      }
    } finally {
      setIsUpdatingDossier(false);
    }
  };

  const currentStageConfig = FUNNEL_STAGES_CONFIG.find(
    (s) => s.id === activeLead?.stage
  );

  return (
    <div className="flex flex-col w-full lg:h-[calc(100vh-5.5rem)] lg:overflow-hidden">
      {/* Top Command Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-space-sm mb-space-xs border-b border-surface-container-high/40 shrink-0">
        <div className="flex items-center gap-space-md flex-wrap">
          <div className="flex items-center gap-space-xs">
            <span className="font-headline-sm text-on-surface tracking-tight">
              Conversas & Evolução Automática de Funil
            </span>
            <span className="px-2 py-0.5 rounded-full bg-primary-container/10 border border-primary-container/30 font-telemetry-tag text-primary flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              MOTOR DE SENTIMENTO IA ATIVO
            </span>
          </div>
          <div className="hidden xl:flex items-center gap-space-xs text-outline font-telemetry-tag">
            <span>TOTAL: {leads.length} CONVERSAS</span>
            <span>•</span>
            <span className="text-primary">{aiCount} IA NO COMANDO</span>
            <span>•</span>
            <span className="text-on-surface-variant">{humanCount} HUMANO</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => triggerAiEvolution(activeLead, undefined, true)}
            disabled={isGeneratingAi}
            title="Faz a IA detectar que o lead parou de responder e movê-lo automaticamente para Nutrição / Follow-up"
            className="px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-telemetry-tag flex items-center gap-1.5 transition-all"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Simular que o Lead Parou de Responder</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('crm-funil', activeLead?.id)}
            className="px-3 py-1.5 bg-surface-container-high hover:bg-surface-variant text-on-surface rounded-lg font-telemetry-tag flex items-center gap-1.5 transition-all"
          >
            <span>Ver Card no Funil ({currentStageConfig?.shortLabel})</span>
            <ArrowRight className="w-3.5 h-3.5 text-primary" />
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Switcher (<1024px) */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-surface-container-low rounded-xl mb-3 lg:hidden shrink-0 border border-surface-container-high">
        <button
          type="button"
          onClick={() => setMobilePanel('list')}
          className={`py-2 px-2 rounded-lg font-telemetry-tag flex items-center justify-center gap-1.5 transition-all ${
            mobilePanel === 'list'
              ? 'bg-primary-container text-on-primary font-bold shadow-sm'
              : 'text-on-surface-variant'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Leads ({filteredLeads.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setMobilePanel('chat')}
          className={`py-2 px-2 rounded-lg font-telemetry-tag flex items-center justify-center gap-1.5 transition-all ${
            mobilePanel === 'chat'
              ? 'bg-primary-container text-on-primary font-bold shadow-sm'
              : 'text-on-surface-variant'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Conversa</span>
        </button>
        <button
          type="button"
          onClick={() => setMobilePanel('dossier')}
          className={`py-2 px-2 rounded-lg font-telemetry-tag flex items-center justify-center gap-1.5 transition-all ${
            mobilePanel === 'dossier'
              ? 'bg-primary-container text-on-primary font-bold shadow-sm'
              : 'text-on-surface-variant'
          }`}
        >
          <Brain className="w-3.5 h-3.5" />
          <span>Cadeia & Dossiê</span>
        </button>
      </div>

      {/* 3-Column Cockpit Workspace */}
      <div className="grid grid-cols-12 gap-space-sm flex-1 min-h-0 lg:overflow-hidden">
        {/* COLUNA 1: Lista de Contatos & Conversas */}
        <div
          className={`col-span-12 lg:col-span-3 flex-col bg-surface-container-low/70 backdrop-blur-xl rounded-xl p-space-sm overflow-hidden h-[580px] lg:h-full ${
            mobilePanel === 'list' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          <div className="relative mb-space-sm">
            <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-outline" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar lead, empresa, telefone..."
              className="w-full bg-surface-container-lowest/90 text-on-surface placeholder:text-outline font-body-sm rounded-lg pl-9 pr-3 py-2 outline-none focus:ring-1 focus:ring-primary-container transition-all"
            />
          </div>

          {/* Channel Filters */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 mb-space-xs no-scrollbar">
            <button
              type="button"
              onClick={() => setChannelFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-telemetry-tag whitespace-nowrap transition-all ${
                channelFilter === 'all'
                  ? 'bg-primary-container text-on-primary-container font-bold'
                  : 'bg-surface-container text-on-surface-variant'
              }`}
            >
              Todos ({leads.length})
            </button>
            <button
              type="button"
              onClick={() => setChannelFilter('whatsapp')}
              className={`px-2.5 py-1 rounded-lg font-telemetry-tag whitespace-nowrap transition-all flex items-center gap-1 ${
                channelFilter === 'whatsapp'
                  ? 'bg-primary-container text-on-primary-container font-bold'
                  : 'bg-surface-container text-on-surface-variant'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> WA (
              {waCount})
            </button>
            <button
              type="button"
              onClick={() => setChannelFilter('instagram')}
              className={`px-2.5 py-1 rounded-lg font-telemetry-tag whitespace-nowrap transition-all flex items-center gap-1 ${
                channelFilter === 'instagram'
                  ? 'bg-primary-container text-on-primary-container font-bold'
                  : 'bg-surface-container text-on-surface-variant'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-pink-500" /> IG (
              {igCount})
            </button>
            <button
              type="button"
              onClick={() => setChannelFilter('webchat')}
              className={`px-2.5 py-1 rounded-lg font-telemetry-tag whitespace-nowrap transition-all flex items-center gap-1 ${
                channelFilter === 'webchat'
                  ? 'bg-primary-container text-on-primary-container font-bold'
                  : 'bg-surface-container text-on-surface-variant'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Web (
              {wbCount})
            </button>
          </div>

          {/* State Pills */}
          <div className="grid grid-cols-2 gap-1 mb-space-sm bg-surface-container-lowest/50 p-0.5 rounded-lg">
            <button
              type="button"
              onClick={() =>
                setControlFilter(controlFilter === 'ai' ? 'all' : 'ai')
              }
              className={`py-1 px-2 rounded-lg font-telemetry-tag text-center flex items-center justify-center gap-1 transition-colors ${
                controlFilter === 'ai' || controlFilter === 'all'
                  ? 'bg-primary-container/20 text-primary font-bold'
                  : 'text-on-surface-variant'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              IA Ativa ({aiCount})
            </button>
            <button
              type="button"
              onClick={() =>
                setControlFilter(controlFilter === 'human' ? 'all' : 'human')
              }
              className={`py-1 px-2 rounded-lg font-telemetry-tag text-center flex items-center justify-center gap-1 transition-colors ${
                controlFilter === 'human'
                  ? 'bg-primary-container/20 text-primary font-bold'
                  : 'text-on-surface-variant'
              }`}
            >
              <Headphones className="w-3.5 h-3.5" />
              Humano ({humanCount})
            </button>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto space-y-space-xs pr-1 thin-scrollbar">
            {filteredLeads.map((item) => {
              const isSelected = item.id === activeLead?.id;
              const stObj = FUNNEL_STAGES_CONFIG.find(
                (s) => s.id === item.stage
              );
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectLead(item.id);
                    setMobilePanel('chat');
                  }}
                  className={`relative p-space-sm rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-surface-container-high/90 ring-1 ring-primary-container shadow-[0_0_18px_rgba(245,158,11,0.12)]'
                      : 'bg-surface-container/60 hover:bg-surface-container'
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <EditableImage
                        assetKey={item.avatarKey}
                        assets={assets}
                        fallbackText={item.name}
                        className="w-8 h-8 rounded-full object-cover"
                        onEditAsset={onEditAsset}
                      />
                      <div className="min-w-0">
                        <h4 className="font-title-md text-body-md text-on-surface font-semibold truncate">
                          {item.name}
                        </h4>
                        <div className="flex items-center gap-1 text-outline font-telemetry-tag text-[10px]">
                          <span>{item.trafficCategory}</span>
                          <span>•</span>
                          <span className="text-primary font-bold">
                            {stObj?.shortLabel}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="font-body-sm text-on-surface font-medium truncate mb-1.5">
                    {item.lastMessagePreview}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-surface-container-highest/60">
                    <span className="font-telemetry-tag text-[10px] text-secondary truncate">
                      {item.sentiment}
                    </span>
                    <span className="font-label-code text-[10px] text-outline">
                      {item.lastActive}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* COLUNA 2: Chat Omnichannel & Evolução de Estágios */}
        <div
          className={`col-span-12 lg:col-span-6 flex-col bg-surface-container-low/90 backdrop-blur-2xl rounded-xl overflow-hidden h-[640px] lg:h-full ${
            mobilePanel === 'chat' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {/* Header do Chat */}
          <div className="p-space-sm bg-surface-container/90 flex items-center justify-between border-b border-surface-container-high/60 shrink-0">
            <div className="flex items-center gap-space-sm min-w-0">
              <EditableImage
                assetKey={
                  activeLead?.id === 'lead-guilherme'
                    ? 'lead_guilherme_header'
                    : activeLead?.avatarKey || 'lead_guilherme_header'
                }
                assets={assets}
                fallbackText={activeLead?.name}
                className="w-10 h-10 rounded-full object-cover"
                onEditAsset={onEditAsset}
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-headline-sm text-title-md text-on-surface font-semibold truncate">
                    {activeLead?.name}
                  </h3>
                  <span className="px-2 py-0.5 rounded bg-primary-container/20 text-primary font-telemetry-tag text-[10px] font-bold">
                    Etapa CRM: {currentStageConfig?.title}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-outline font-label-code text-body-sm flex-wrap">
                  <span>{activeLead?.phone}</span>
                  <span>•</span>
                  <span className="text-secondary font-telemetry-tag text-[10px]">
                    Sentimento: {activeLead?.sentiment}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={toggleHandover}
                className={`px-3 py-1.5 rounded-lg font-telemetry-tag text-[11px] font-bold flex items-center gap-1 transition-all ${
                  activeLead?.controlMode === 'ai'
                    ? 'bg-primary-container text-on-primary shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                    : 'bg-surface-container-high text-primary border border-primary-container/40'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>
                  {activeLead?.controlMode === 'ai'
                    ? 'Assumir Manual'
                    : 'Devolver p/ IA'}
                </span>
              </button>
            </div>
          </div>

          {/* Régua Visual dos 8 Estágios do Funil no Topo do Chat */}
          <div className="bg-surface-container-lowest/90 px-3 py-2 border-b border-surface-container-high flex items-center gap-1 overflow-x-auto no-scrollbar shrink-0">
            {FUNNEL_STAGES_CONFIG.map((st, idx) => {
              const isCurrent = activeLead?.stage === st.id;
              const currentIdx = FUNNEL_STAGES_CONFIG.findIndex(
                (s) => s.id === activeLead?.stage
              );
              const isPast = idx < currentIdx;
              return (
                <React.Fragment key={st.id}>
                  <button
                    type="button"
                    onClick={() => {
                      const updatedChain: ServiceChainStep[] = [
                        ...activeLead.serviceChain,
                        {
                          id: `sc-click-${Date.now()}`,
                          order: activeLead.serviceChain.length + 1,
                          title: `${activeLead.serviceChain.length + 1}. Movido p/ ${st.shortLabel}`,
                          stage: st.id,
                          status: 'em_andamento',
                          timestamp: 'Agora',
                        },
                      ];
                      onUpdateLead({
                        ...activeLead,
                        stage: st.id,
                        serviceChain: updatedChain,
                      });
                    }}
                    className={`px-2 py-1 rounded font-telemetry-tag text-[10px] whitespace-nowrap transition-all flex items-center gap-1 ${
                      isCurrent
                        ? 'bg-primary-container text-on-primary font-bold shadow-[0_0_10px_rgba(245,158,11,0.35)]'
                        : isPast
                        ? 'bg-secondary-container/20 text-secondary'
                        : 'bg-surface-container text-outline hover:text-on-surface'
                    }`}
                  >
                    <span>
                      {idx + 1}. {st.shortLabel}
                    </span>
                  </button>
                  {idx < FUNNEL_STAGES_CONFIG.length - 1 && (
                    <ChevronRight className="w-3 h-3 text-outline shrink-0" />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Histórico de Mensagens */}
          <div className="flex-1 overflow-y-auto p-space-md space-y-space-md thin-scrollbar">
            {activeLead?.messages.map((msg) => {
              if (msg.sender === 'lead') {
                return (
                  <div
                    key={msg.id}
                    className="flex flex-col items-start max-w-[85%]"
                  >
                    <div className="bg-surface-container-high text-on-surface p-space-sm rounded-2xl rounded-tl-sm shadow-md">
                      <p className="font-body-md text-on-surface">{msg.text}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-1 pl-1">
                      <span className="font-label-code text-[10px] text-outline">
                        {msg.timestamp}
                      </span>
                      {msg.sentimentDetected && (
                        <span className="font-telemetry-tag text-[9px] text-primary">
                          • Sentimento: {msg.sentimentDetected}
                        </span>
                      )}
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={msg.id}
                  className="flex flex-col items-end max-w-[88%] ml-auto space-y-1"
                >
                  {msg.stageTransition && (
                    <div className="px-3 py-1 rounded-full bg-primary-container/20 border border-primary-container/40 text-primary font-telemetry-tag text-[10px] flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3" />
                      <span>
                        IA avançou o lead no funil:{' '}
                        {msg.stageTransition.from.toUpperCase()} ➔{' '}
                        {msg.stageTransition.to.toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="bg-surface-container-highest/90 text-on-surface p-space-sm rounded-2xl rounded-tr-sm border border-primary-container/20 shadow-[0_4px_16px_rgba(0,0,0,0.25)]">
                    <div className="flex items-center justify-between gap-3 mb-1.5 pb-1 border-b border-surface-variant">
                      <div className="flex items-center gap-1.5">
                        <Bot className="w-3.5 h-3.5 text-primary" />
                        <span className="font-telemetry-tag text-[10px] text-primary uppercase font-bold">
                          {msg.senderName || 'Agente Aetheris IA'}
                        </span>
                      </div>
                      <span className="font-label-code text-[10px] text-secondary bg-primary-container/10 px-1.5 py-0.5 rounded">
                        {msg.strategyTag || msg.confidence || 'Confiança 99%'}
                      </span>
                    </div>
                    <p className="font-body-md text-on-surface">{msg.text}</p>
                  </div>
                  <div className="flex items-center gap-1 pr-1 font-label-code text-[10px] text-outline">
                    <span>{msg.timestamp}</span>
                    <CheckCheck className="w-3.5 h-3.5 text-primary" />
                  </div>
                </div>
              );
            })}

            {isGeneratingAi && (
              <div className="flex items-center gap-2 text-primary font-telemetry-tag text-xs bg-primary-container/10 py-2 px-3 rounded-lg border border-primary-container/30 w-fit">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>
                  IA analisando sentimento da resposta e avançando estágio no funil...
                </span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Barra Interativa de Teste de Evolução & Digitação */}
          <div className="p-space-sm bg-surface-container-low border-t border-surface-container-high/60 shrink-0 space-y-2">
            {/* Respostas Rápidas de Simulação do Lead para testar avanço automático no Funil */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              <span className="text-outline font-telemetry-tag text-[10px] uppercase shrink-0">
                Testar Resposta do Lead:
              </span>
              <button
                type="button"
                onClick={() => {
                  setInputMode('lead_sim');
                  setManualInput(
                    'Olá! Temos interesse sim, hoje fazemos cerca de 500 atendimentos por dia no WhatsApp.'
                  );
                }}
                className="px-2 py-0.5 rounded bg-surface-container-high hover:bg-surface-variant text-on-surface-variant hover:text-primary font-label-code text-[11px] whitespace-nowrap"
              >
                💬 &quot;Fazemos 500 atendimentos/dia&quot; (➔ Qualificação)
              </button>
              <button
                type="button"
                onClick={() => {
                  setInputMode('lead_sim');
                  setManualInput(
                    'Pode me enviar uma proposta comercial com os valores?'
                  );
                }}
                className="px-2 py-0.5 rounded bg-surface-container-high hover:bg-surface-variant text-on-surface-variant hover:text-primary font-label-code text-[11px] whitespace-nowrap"
              >
                📄 &quot;Me envie uma proposta&quot; (➔ Proposta)
              </button>
              <button
                type="button"
                onClick={() => {
                  setInputMode('lead_sim');
                  setManualInput(
                    'Consegue manter os 15% de desconto se fecharmos hoje?'
                  );
                }}
                className="px-2 py-0.5 rounded bg-surface-container-high hover:bg-surface-variant text-on-surface-variant hover:text-primary font-label-code text-[11px] whitespace-nowrap"
              >
                🤝 &quot;Consegue 15% de desconto?&quot; (➔ Negociação)
              </button>
              <button
                type="button"
                onClick={() => {
                  setInputMode('lead_sim');
                  setManualInput(
                    'Fechado! Pode me mandar o link de pagamento Pix agora.'
                  );
                }}
                className="px-2 py-0.5 rounded bg-surface-container-high hover:bg-surface-variant text-on-surface-variant hover:text-primary font-label-code text-[11px] whitespace-nowrap"
              >
                💳 &quot;Mande o link Pix&quot; (➔ Fechamento)
              </button>
            </div>

            {/* Mode Switcher + Input */}
            <form
              onSubmit={handleFormSubmit}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-surface-container-lowest p-2 rounded-xl border border-surface-container-highest"
            >
              <div className="flex items-center bg-surface-container p-0.5 rounded-lg shrink-0">
                <button
                  type="button"
                  onClick={() => setInputMode('lead_sim')}
                  className={`px-2.5 py-1 rounded font-telemetry-tag text-[10px] transition-all ${
                    inputMode === 'lead_sim'
                      ? 'bg-primary-container text-on-primary font-bold'
                      : 'text-on-surface-variant'
                  }`}
                >
                  Enviar como Lead (IA Responde)
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('operator')}
                  className={`px-2.5 py-1 rounded font-telemetry-tag text-[10px] transition-all ${
                    inputMode === 'operator'
                      ? 'bg-secondary-container text-on-secondary font-bold'
                      : 'text-on-surface-variant'
                  }`}
                >
                  Enviar como Operador
                </button>
              </div>

              <div className="flex items-center gap-2 flex-1">
                <input
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder={
                    inputMode === 'lead_sim'
                      ? `Digite como ${activeLead?.name} para ver a IA responder e avançar o funil...`
                      : 'Digite sua mensagem manual como operador...'
                  }
                  className="w-full bg-transparent text-on-surface placeholder:text-outline font-body-sm outline-none px-2"
                />
                <button
                  type="submit"
                  disabled={!manualInput.trim() || isGeneratingAi}
                  className="px-3 py-1.5 rounded-lg bg-primary-container text-on-primary font-telemetry-tag font-bold flex items-center gap-1 disabled:opacity-40 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* COLUNA 3: Cadeia de Atendimentos & Dossiê de Conversão */}
        <div
          className={`col-span-12 lg:col-span-3 flex-col bg-surface-container-low/70 backdrop-blur-xl rounded-xl p-space-sm overflow-y-auto h-[580px] lg:h-full space-y-space-md thin-scrollbar ${
            mobilePanel === 'dossier' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          <div className="flex items-center justify-between border-b border-surface-container-high/40 pb-space-xs">
            <div className="flex items-center gap-1.5">
              <GitCommitHorizontal className="w-4 h-4 text-primary" />
              <span className="font-headline-sm text-body-md text-on-surface font-semibold">
                Cadeia & Dossiê do Lead
              </span>
            </div>
            <button
              type="button"
              onClick={handleRegenerateDossier}
              disabled={isUpdatingDossier}
              className="font-telemetry-tag text-[10px] text-primary hover:underline flex items-center gap-1"
            >
              <RefreshCw
                className={`w-3 h-3 ${isUpdatingDossier ? 'animate-spin' : ''}`}
              />
              <span>ATUALIZAR IA</span>
            </button>
          </div>

          {/* Cadeia de Atendimentos Card */}
          <div className="p-3 rounded-xl bg-surface-container/80 border border-primary-container/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-telemetry-tag text-primary uppercase">
                Cadeia de Atendimentos Realizados
              </span>
              <span className="font-label-code text-xs text-secondary font-bold">
                {activeLead?.serviceChain.length} Etapas
              </span>
            </div>
            <div className="space-y-1.5">
              {activeLead?.serviceChain.map((step) => (
                <div
                  key={step.id}
                  className="p-2 rounded-lg bg-surface-container-lowest flex items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        step.status === 'concluido'
                          ? 'bg-secondary-container'
                          : 'bg-primary-container animate-pulse'
                      }`}
                    />
                    <span className="font-body-sm text-on-surface truncate">
                      {step.title}
                    </span>
                  </div>
                  <span className="font-label-code text-[10px] text-outline shrink-0">
                    {step.timestamp || step.stage}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Resumo Executivo (IA) */}
          <div className="p-space-sm rounded-xl bg-surface-container/70 border border-surface-container-high">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-primary" />
                <span className="font-headline-sm text-body-sm text-on-surface font-bold uppercase">
                  Resumo Executivo (IA)
                </span>
              </div>
              <Sparkles className="w-3.5 h-3.5 text-primary" />
            </div>
            <ul className="space-y-1.5 text-on-surface-variant font-body-sm">
              <li>
                <strong className="text-on-surface">Dor Principal:</strong>{' '}
                {activeLead?.dossier.dorPrincipal}
              </li>
              <li>
                <strong className="text-on-surface">Pré-requisito:</strong>{' '}
                {activeLead?.dossier.preRequisito}
              </li>
              <li>
                <strong className="text-on-surface">Estágio Atual:</strong>{' '}
                {activeLead?.dossier.estagioAtual}
              </li>
              <li>
                <strong className="text-on-surface">Recomendação:</strong>{' '}
                {activeLead?.dossier.recomendacao}
              </li>
            </ul>
          </div>

          {/* Linha do Tempo */}
          <div className="space-y-space-xs">
            <span className="font-telemetry-tag text-outline uppercase tracking-wider block px-1">
              Histórico de Avanços no Funil
            </span>
            <div className="space-y-2 pl-2 border-l-2 border-surface-container-highest">
              {(activeLead?.timeline || []).map((tl, idx) => (
                <div key={tl.id} className="relative pl-3">
                  <span
                    className={`absolute -left-[13px] top-1.5 w-2 h-2 rounded-full ${
                      idx === 0 ? 'bg-primary' : 'bg-outline'
                    }`}
                  />
                  <span className="font-label-code text-[10px] text-outline">
                    {tl.time}
                  </span>
                  <p className="font-body-sm text-on-surface font-medium">
                    {tl.title}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
