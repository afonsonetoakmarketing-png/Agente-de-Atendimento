'use client';

import React, { useState } from 'react';
import {
  Search,
  Workflow,
  SlidersHorizontal,
  UserPlus,
  MessageSquare,
  Camera,
  MonitorSmartphone,
  MoreVertical,
  Clock,
  Bot,
  Cpu,
  CheckCircle2,
  CreditCard,
  Zap,
  Gauge,
  Brain,
  Headphones,
  ArrowRightLeft,
  X,
  Link2,
  GripVertical,
  GitCommitHorizontal,
  Plus,
  Sparkles,
  Megaphone,
  Globe,
  Target,
  ChevronRight,
} from 'lucide-react';
import {
  ChannelType,
  FUNNEL_STAGES_CONFIG,
  FunnelPipelineType,
  FunnelStage,
  ImageAssetConfig,
  Lead,
  LeadSentiment,
  NavigationTab,
  ServiceChainStep,
} from '@/lib/types';
import EditableImage from '@/components/EditableImage';

interface CrmKanbanViewProps {
  leads: Lead[];
  assets: Record<string, ImageAssetConfig>;
  onUpdateLead: (updated: Lead) => void;
  onAddLead: (newLead: Lead, customAvatarUrl?: string) => void;
  onNavigate: (tab: NavigationTab, leadId?: string) => void;
  onEditAsset: (key: string) => void;
}

const STAGE_DEFAULT_SENTIMENT: Record<FunnelStage, LeadSentiment> = {
  prospeccao: 'Novo Contato',
  qualificacao: 'Qualificado / Engajado',
  nutricao: 'Inativo / Parou de Responder',
  followup: 'Curioso / Respondendo',
  proposta: 'Interesse em Proposta',
  negociacao: 'Negociando Condições',
  fechamento: 'Alta Intenção / Fechamento',
  venda_fechada: 'Venda Confirmada',
};

export default function CrmKanbanView({
  leads,
  assets,
  onUpdateLead,
  onAddLead,
  onNavigate,
  onEditAsset,
}: CrmKanbanViewProps) {
  const [activePipeline, setActivePipeline] = useState<
    FunnelPipelineType | 'todos'
  >('prospeccao_outbound');
  const [searchQuery, setSearchQuery] = useState('');
  const [channelFilter, setChannelFilter] = useState<'all' | ChannelType>('all');
  const [trafficFilter, setTrafficFilter] = useState<
    'all' | 'Prospecção Ativa' | 'Tráfego Pago' | 'Orgânico'
  >('all');
  const [openMenuLeadId, setOpenMenuLeadId] = useState<string | null>(null);
  const [isNewLeadOpen, setIsNewLeadOpen] = useState(false);

  // Drag and Drop State
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<FunnelStage | null>(null);

  // Inline Add Chain Step Modal / Input per Card
  const [addingStepLeadId, setAddingStepLeadId] = useState<string | null>(null);
  const [newStepText, setNewStepText] = useState('');

  // New Lead Form State
  const [newName, setNewName] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newValue, setNewValue] = useState('45000');
  const [newChannel, setNewChannel] = useState<ChannelType>('whatsapp');
  const [newPipeline, setNewPipeline] =
    useState<FunnelPipelineType>('prospeccao_outbound');
  const [newTrafficCat, setNewTrafficCat] = useState<
    'Prospecção Ativa' | 'Tráfego Pago' | 'Orgânico'
  >('Prospecção Ativa');
  const [newStage, setNewStage] = useState<FunnelStage>('prospeccao');
  const [newAvatarUrl, setNewAvatarUrl] = useState('');

  const filteredLeads = leads.filter((l) => {
    const matchesPipeline =
      activePipeline === 'todos' ? true : l.pipeline === activePipeline;
    const matchesSearch =
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.cnpj.includes(searchQuery);
    const matchesChannel =
      channelFilter === 'all' ? true : l.channel === channelFilter;
    const matchesTraffic =
      trafficFilter === 'all' ? true : l.trafficCategory === trafficFilter;
    return (
      matchesPipeline && matchesSearch && matchesChannel && matchesTraffic
    );
  });

  const totalPipelineValue = filteredLeads.reduce(
    (acc, l) => acc + l.valueNum,
    0
  );

  const moveLeadToStage = (
    lead: Lead,
    nextStage: FunnelStage,
    reasonLabel = 'Movido no Funil'
  ) => {
    if (lead.stage === nextStage) return;
    const stageConfig = FUNNEL_STAGES_CONFIG.find((s) => s.id === nextStage);
    const nextSentiment = STAGE_DEFAULT_SENTIMENT[nextStage];

    const updatedChain: ServiceChainStep[] = lead.serviceChain.map((step) => ({
      ...step,
      status: 'concluido' as const,
    }));

    updatedChain.push({
      id: `sc-${Date.now()}`,
      order: updatedChain.length + 1,
      title: `${updatedChain.length + 1}. ${
        stageConfig?.shortLabel || nextStage
      } (${reasonLabel})`,
      stage: nextStage,
      status: nextStage === 'venda_fechada' ? 'concluido' : 'em_andamento',
      timestamp: 'Agora',
    });

    onUpdateLead({
      ...lead,
      stage: nextStage,
      sentiment: nextSentiment,
      serviceChain: updatedChain,
      statusBadge:
        nextStage === 'venda_fechada'
          ? 'VENDA FECHADA'
          : stageConfig?.shortLabel || lead.statusBadge,
      cadenceStatus: `${reasonLabel} • ${stageConfig?.shortLabel}`,
      lastActive: 'Agora',
      timeline: [
        {
          id: `tl-${Date.now()}`,
          time: 'Agora',
          title: `${reasonLabel}: avançou para ${stageConfig?.title} (Sentimento: ${nextSentiment})`,
          active: true,
        },
        ...lead.timeline,
      ],
    });
    setOpenMenuLeadId(null);
  };

  const handleAdvanceNextStage = (lead: Lead, isInactivity = false) => {
    const currentIndex = FUNNEL_STAGES_CONFIG.findIndex(
      (s) => s.id === lead.stage
    );
    if (isInactivity) {
      if (lead.stage === 'prospeccao' || lead.stage === 'qualificacao') {
        moveLeadToStage(lead, 'nutricao', 'Inatividade Detectada pela IA');
        return;
      }
      if (lead.stage === 'nutricao') {
        moveLeadToStage(lead, 'followup', 'Follow-up Automático IA');
        return;
      }
    }
    const nextIdx = Math.min(
      FUNNEL_STAGES_CONFIG.length - 1,
      currentIndex + 1
    );
    const nextStage = FUNNEL_STAGES_CONFIG[nextIdx].id;
    moveLeadToStage(lead, nextStage, 'Avanço de Cadência IA');
  };

  const handleAddChainStep = (lead: Lead) => {
    if (!newStepText.trim()) return;
    const nextOrder = lead.serviceChain.length + 1;
    const updatedChain: ServiceChainStep[] = [
      ...lead.serviceChain,
      {
        id: `sc-manual-${Date.now()}`,
        order: nextOrder,
        title: `${nextOrder}. ${newStepText.trim()}`,
        stage: lead.stage,
        status: 'em_andamento',
        timestamp: 'Agora',
      },
    ];
    onUpdateLead({
      ...lead,
      serviceChain: updatedChain,
    });
    setNewStepText('');
    setAddingStepLeadId(null);
  };

  // Drag & Drop Handlers
  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    setDraggedLeadId(leadId);
    e.dataTransfer.setData('text/plain', leadId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, stageId: FunnelStage) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverStage !== stageId) {
      setDragOverStage(stageId);
    }
  };

  const handleDrop = (e: React.DragEvent, targetStage: FunnelStage) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('text/plain') || draggedLeadId;
    setDraggedLeadId(null);
    setDragOverStage(null);

    if (!leadId) return;
    const found = leads.find((l) => l.id === leadId);
    if (found && found.stage !== targetStage) {
      moveLeadToStage(found, targetStage, 'Arrastado Manualmente');
    }
  };

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newCompany.trim()) return;
    const valNum = Number(newValue) || 45000;
    const customKey = `lead_custom_${Date.now()}`;

    const created: Lead = {
      id: `lead-${Date.now()}`,
      code: `#LD-${Math.floor(9100 + Math.random() * 800)}`,
      name: newName.trim(),
      company: newCompany.trim(),
      cnpj: '49.210.884/0001-10',
      email: `contato@${newCompany
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')}.com.br`,
      phone: '+55 (11) 99402-1190',
      channel: newChannel,
      pipeline: newPipeline,
      trafficCategory: newTrafficCat,
      stage: newStage,
      sentiment: STAGE_DEFAULT_SENTIMENT[newStage],
      serviceChain: [
        {
          id: `sc-init-1-${Date.now()}`,
          order: 1,
          title: `1. Entrada via ${newTrafficCat} (${newStage})`,
          stage: newStage,
          status: 'em_andamento',
          timestamp: 'Agora',
        },
        {
          id: `sc-init-2-${Date.now()}`,
          order: 2,
          title: '2. Qualificação & Leitura de Sentimento IA',
          stage: 'qualificacao',
          status: 'pendente',
        },
        {
          id: `sc-init-3-${Date.now()}`,
          order: 3,
          title: '3. Nutrição / Follow-up se Inativo',
          stage: 'nutricao',
          status: 'pendente',
        },
        {
          id: `sc-init-4-${Date.now()}`,
          order: 4,
          title: '4. Proposta ➔ Negociação ➔ Fechamento',
          stage: 'proposta',
          status: 'pendente',
        },
      ],
      productTier: valNum >= 40000 ? 'ENTERPRISE' : 'PRO',
      score: 85,
      valueNum: valNum,
      valueFormatted: `R$ ${valNum.toLocaleString('pt-BR')}`,
      monthlyTicket: `R$ ${Math.round(valNum / 12).toLocaleString('pt-BR')}/mês`,
      closingProb: '85.0%',
      controlMode: 'ai',
      assignedAgent: 'Agente Qualificador & SDR',
      avatarKey: newAvatarUrl.trim() ? customKey : 'lead_guilherme_sampaio',
      statusBadge: 'Novo Lead',
      cadenceStatus: 'IA Monitorando Resposta',
      lastMessagePreview:
        'Novo lead adicionado ao funil com cadeia de atendimento ativa.',
      lastActive: 'Agora',
      slaText: 'SLA Imediato',
      trafficOrigin: `${newTrafficCat} • WhatsApp`,
      deviceInfo: 'WhatsApp Mobile',
      dossier: {
        dorPrincipal: 'Automatizar atendimento e vendas com IA no WhatsApp.',
        preRequisito: 'Qualificação automática e avanço no funil.',
        estagioAtual: `Estágio inicial (${newStage}).`,
        recomendacao:
          'Aguardar resposta da abordagem ou simular conversa na aba Conversas.',
      },
      timeline: [
        {
          id: `tl-${Date.now()}`,
          time: 'Agora',
          title: `Criado no ${
            newPipeline === 'prospeccao_outbound'
              ? 'Funil de Prospecção'
              : 'Funil de Tráfego Pago & Orgânico'
          }`,
          active: true,
        },
      ],
      messages: [
        {
          id: `m-${Date.now()}`,
          sender: 'ai',
          senderName: 'Agente Qualificador & SDR',
          text: `Olá ${newName.trim()}! Sou o agente inteligente da Aetheris. Vi seu contato pela ${newCompany.trim()} — como está o volume de atendimentos de vocês no WhatsApp hoje?`,
          timestamp: 'Agora • WhatsApp',
        },
      ],
    };

    onAddLead(created, newAvatarUrl.trim() || undefined);
    setActivePipeline(newPipeline);
    setNewName('');
    setNewCompany('');
    setNewAvatarUrl('');
    setIsNewLeadOpen(false);
  };

  const renderChannelIcon = (ch: ChannelType) => {
    if (ch === 'whatsapp') {
      return (
        <MessageSquare
          className="w-3.5 h-3.5 text-[#25D366]"
          aria-label="WhatsApp"
        />
      );
    }
    if (ch === 'instagram') {
      return (
        <Camera className="w-3.5 h-3.5 text-[#E1306C]" aria-label="Instagram" />
      );
    }
    return (
      <MonitorSmartphone
        className="w-3.5 h-3.5 text-[#38BDF8]"
        aria-label="Webchat"
      />
    );
  };

  const getSentimentBadgeStyle = (sentiment: LeadSentiment) => {
    if (
      sentiment === 'Venda Confirmada' ||
      sentiment === 'Alta Intenção / Fechamento'
    ) {
      return 'bg-secondary-container/20 text-secondary border-secondary/40';
    }
    if (sentiment === 'Inativo / Parou de Responder') {
      return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
    }
    if (
      sentiment === 'Interesse em Proposta' ||
      sentiment === 'Negociando Condições'
    ) {
      return 'bg-primary-container/20 text-primary border-primary-container/40';
    }
    return 'bg-surface-container-highest text-on-surface-variant border-surface-variant';
  };

  return (
    <div className="flex flex-col w-full gap-space-md pb-space-xl">
      {/* Top Pipeline Selector & Command Bar */}
      <div className="relative z-10 flex flex-col gap-space-md bg-surface-container-low/80 backdrop-blur-2xl p-space-md rounded-xl shadow-xl border border-surface-container-high">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-space-md">
          {/* Funnel Switcher Tabs (Funil 1: Prospecção vs Funil 2: Tráfego Pago & Orgânico) */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex items-center bg-surface-container-lowest p-1 rounded-xl border border-surface-container-highest flex-wrap gap-1">
              <button
                type="button"
                onClick={() => setActivePipeline('prospeccao_outbound')}
                className={`px-3.5 py-2 rounded-lg font-telemetry-tag uppercase transition-all flex items-center gap-2 ${
                  activePipeline === 'prospeccao_outbound'
                    ? 'bg-primary-container text-on-primary font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <Target className="w-4 h-4" />
                <span>Funil 1: Somente Prospecção (Outbound)</span>
              </button>

              <button
                type="button"
                onClick={() => setActivePipeline('trafego_inbound')}
                className={`px-3.5 py-2 rounded-lg font-telemetry-tag uppercase transition-all flex items-center gap-2 ${
                  activePipeline === 'trafego_inbound'
                    ? 'bg-primary-container text-on-primary font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <Megaphone className="w-4 h-4" />
                <span>Funil 2: Tráfego Pago & Orgânico (Inbound)</span>
              </button>

              <button
                type="button"
                onClick={() => setActivePipeline('todos')}
                className={`px-3 py-2 rounded-lg font-telemetry-tag uppercase transition-all ${
                  activePipeline === 'todos'
                    ? 'bg-surface-container-highest text-primary font-bold'
                    : 'text-outline hover:text-on-surface'
                }`}
              >
                Todos ({leads.length})
              </button>
            </div>
          </div>

          {/* Right Controls & Totals */}
          <div className="flex flex-wrap items-center justify-between xl:justify-end gap-space-sm">
            <div className="flex items-center gap-3 bg-surface-container-lowest/90 px-3.5 py-2 rounded-lg border border-surface-container-high">
              <div>
                <span className="font-telemetry-tag text-outline uppercase block text-[9px]">
                  Volume no Funil Selecionado
                </span>
                <span className="font-metric-counter text-lg text-primary">
                  R$ {totalPipelineValue.toLocaleString('pt-BR')}
                </span>
              </div>
              <div className="h-6 w-px bg-surface-variant" />
              <div>
                <span className="font-telemetry-tag text-outline uppercase block text-[9px]">
                  Leads Ativos
                </span>
                <span className="font-metric-counter text-lg text-secondary">
                  {filteredLeads.length}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('cerebro-automacao')}
              className="flex items-center gap-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface px-3.5 py-2 rounded-lg transition-all border border-surface-container-highest"
            >
              <Workflow className="w-4 h-4 text-primary" />
              <span className="font-body-sm font-medium">
                Fluxo de Sentimento IA
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setNewPipeline(
                  activePipeline === 'trafego_inbound'
                    ? 'trafego_inbound'
                    : 'prospeccao_outbound'
                );
                setNewTrafficCat(
                  activePipeline === 'trafego_inbound'
                    ? 'Tráfego Pago'
                    : 'Prospecção Ativa'
                );
                setIsNewLeadOpen(true);
              }}
              className="flex items-center gap-1.5 bg-primary-container text-on-primary-container hover:brightness-110 px-4 py-2 rounded-lg shadow-[0_0_15px_rgba(245,158,11,0.35)] transition-all font-semibold"
            >
              <UserPlus className="w-4 h-4" />
              <span className="font-body-sm">+ Novo Lead</span>
            </button>
          </div>
        </div>

        {/* Instruction Banner for Drag & Drop + AI Progression */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-2 pt-2 border-t border-surface-container-high/60">
          <div className="flex items-center gap-2 text-body-sm text-on-surface-variant">
            <GripVertical className="w-4 h-4 text-primary shrink-0" />
            <span>
              <strong className="text-primary">Dica Operacional:</strong> Clique, segure e arraste qualquer card para movê-lo manualmente entre as 8 etapas, ou deixe a{' '}
              <strong className="text-secondary">IA avançar automaticamente</strong> conforme o sentimento da conversa e inatividade.
            </span>
          </div>

          {/* Search & Source Filters */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar lead, empresa, código..."
                className="w-full bg-surface-container-lowest text-on-surface placeholder:text-outline font-body-sm pl-8 pr-3 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-container"
              />
            </div>

            <div className="flex items-center bg-surface-container-lowest p-0.5 rounded-lg border border-surface-container-high">
              {(
                [
                  { id: 'all', label: 'Todas Fontes' },
                  { id: 'Prospecção Ativa', label: 'Prospecção' },
                  { id: 'Tráfego Pago', label: 'Tráfego Pago' },
                  { id: 'Orgânico', label: 'Orgânico' },
                ] as const
              ).map((tf) => (
                <button
                  key={tf.id}
                  type="button"
                  onClick={() => setTrafficFilter(tf.id)}
                  className={`px-2.5 py-1 rounded font-telemetry-tag text-[10px] uppercase transition-colors ${
                    trafficFilter === tf.id
                      ? 'bg-surface-container-high text-primary font-bold'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 8-Stage Kanban Viewport Canvas with Native Drag-and-Drop */}
      <div className="relative z-10 w-full overflow-x-auto pb-space-md thin-scrollbar">
        <div className="inline-flex gap-3.5 min-w-full items-start">
          {FUNNEL_STAGES_CONFIG.map((stage, stageIdx) => {
            const stageLeads = filteredLeads.filter(
              (l) => l.stage === stage.id
            );
            const stageSum = stageLeads.reduce((s, l) => s + l.valueNum, 0);
            const stageSumFormatted =
              stageSum >= 1000
                ? `R$ ${Math.round(stageSum / 1000)}k`
                : `R$ ${stageSum}`;
            const isDragTarget = dragOverStage === stage.id;

            return (
              <div
                key={stage.id}
                onDragOver={(e) => handleDragOver(e, stage.id)}
                onDragLeave={() => setDragOverStage(null)}
                onDrop={(e) => handleDrop(e, stage.id)}
                className={`relative w-80 flex-shrink-0 flex flex-col gap-space-sm p-space-sm rounded-xl backdrop-blur-xl transition-all border ${
                  isDragTarget
                    ? 'bg-primary-container/15 border-primary-container ring-2 ring-primary-container/40 shadow-[0_0_30px_rgba(245,158,11,0.25)]'
                    : stage.specialGlow
                    ? 'bg-surface-container-low/90 border-primary-container/30 shadow-[0_0_25px_rgba(245,158,11,0.1)]'
                    : 'bg-surface-container-low/60 border-surface-container-high/60'
                }`}
              >
                {/* Stage Header */}
                <div className="flex items-center justify-between pb-1 px-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-surface-container-highest text-primary font-label-code text-[11px] font-bold flex items-center justify-center shrink-0">
                      {stageIdx + 1}
                    </span>
                    <div className="flex flex-col min-w-0">
                      <h3
                        className={`font-headline-sm text-base tracking-tight leading-none truncate ${
                          stage.specialGlow ? 'text-primary' : 'text-on-surface'
                        }`}
                      >
                        {stage.title}
                      </h3>
                      <span className="font-telemetry-tag text-[9px] text-outline leading-tight mt-0.5 truncate">
                        {stage.subtitle}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="px-1.5 py-0.5 bg-surface-container rounded-full font-telemetry-tag text-on-surface-variant font-bold">
                      {stageLeads.length}
                    </span>
                    <span className="font-label-code text-xs text-primary font-semibold">
                      {stageSumFormatted}
                    </span>
                  </div>
                </div>

                {/* Progress Wire */}
                <div className="h-0.5 w-full bg-surface-container-high rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-container transition-all"
                    style={{
                      width: `${Math.round(
                        ((stageIdx + 1) / FUNNEL_STAGES_CONFIG.length) * 100
                      )}%`,
                    }}
                  />
                </div>

                {/* Drop Hint when Empty */}
                {stageLeads.length === 0 && (
                  <div className="py-8 px-3 rounded-lg border border-dashed border-surface-container-highest text-center text-outline font-body-sm">
                    Arraste um card para <strong className="text-on-surface-variant">{stage.shortLabel}</strong> ou aguarde o avanço automático da IA.
                  </div>
                )}

                {/* Cards Cluster */}
                <div className="flex flex-col gap-2.5">
                  {stageLeads.map((card) => (
                    <div
                      key={card.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, card.id)}
                      onDragEnd={() => {
                        setDraggedLeadId(null);
                        setDragOverStage(null);
                      }}
                      className={`group relative bg-surface-container/95 hover:bg-surface-container-high/95 p-3 rounded-xl shadow-md hover:shadow-xl transition-all cursor-grab active:cursor-grabbing border border-surface-container-highest/80 hover:border-primary-container/40 ${
                        draggedLeadId === card.id ? 'opacity-40 scale-95' : ''
                      }`}
                    >
                      {/* Top Row: Channel, Code, Traffic Source Badge & Menu */}
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <GripVertical className="w-3.5 h-3.5 text-outline group-hover:text-primary shrink-0" />
                          {renderChannelIcon(card.channel)}
                          <span className="font-telemetry-tag text-[10px] text-outline">
                            {card.code}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded font-telemetry-tag text-[9px] uppercase ${
                              card.trafficCategory === 'Tráfego Pago'
                                ? 'bg-blue-500/15 text-blue-300'
                                : card.trafficCategory === 'Orgânico'
                                ? 'bg-emerald-500/15 text-emerald-300'
                                : 'bg-purple-500/15 text-purple-300'
                            }`}
                          >
                            {card.trafficCategory}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <span className="px-1.5 py-0.5 rounded bg-primary/15 text-primary font-telemetry-tag text-[10px] font-bold">
                            {card.score}%
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuLeadId(
                                openMenuLeadId === card.id ? null : card.id
                              );
                            }}
                            className="p-1 text-outline hover:text-primary transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Context Flyout Menu */}
                      {openMenuLeadId === card.id && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute right-2 top-8 z-30 w-60 bg-surface-container-high/95 backdrop-blur-2xl border border-surface-container-highest rounded-xl shadow-2xl p-1.5 flex flex-col gap-1"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setOpenMenuLeadId(null);
                              onNavigate('inbox-omnichannel', card.id);
                            }}
                            className="flex items-center gap-2 px-2.5 py-1.5 rounded text-on-surface hover:bg-surface-container hover:text-primary transition-all text-left font-body-sm"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-primary" />
                            <span>Abrir Conversa no WhatsApp</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              handleAdvanceNextStage(card, true);
                            }}
                            className="flex items-center gap-2 px-2.5 py-1.5 rounded text-on-surface hover:bg-surface-container hover:text-amber-300 transition-all text-left font-body-sm"
                          >
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                            <span>Simular Parou de Responder</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setOpenMenuLeadId(null);
                              onEditAsset(card.avatarKey);
                            }}
                            className="flex items-center gap-2 px-2.5 py-1.5 rounded text-on-surface hover:bg-surface-container hover:text-primary transition-all text-left font-body-sm"
                          >
                            <Link2 className="w-3.5 h-3.5 text-primary" />
                            <span>Editar Link da Foto (HTML)</span>
                          </button>
                          <div className="border-t border-surface-variant my-0.5 pt-1 max-h-48 overflow-y-auto thin-scrollbar">
                            <span className="font-telemetry-tag text-[9px] text-outline px-2 uppercase block mb-1">
                              Mover para Etapa do Funil:
                            </span>
                            {FUNNEL_STAGES_CONFIG.filter(
                              (s) => s.id !== card.stage
                            ).map((st) => (
                              <button
                                key={st.id}
                                type="button"
                                onClick={() =>
                                  moveLeadToStage(
                                    card,
                                    st.id,
                                    'Movido pelo Menu'
                                  )
                                }
                                className="w-full flex items-center gap-1.5 px-2.5 py-1 rounded text-on-surface-variant hover:bg-surface-container hover:text-primary font-telemetry-tag text-[10px] text-left"
                              >
                                <ArrowRightLeft className="w-3 h-3" />
                                <span>{st.title}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Lead Identity */}
                      <div
                        onClick={() =>
                          onNavigate('inbox-omnichannel', card.id)
                        }
                        className="flex items-center gap-2.5 mb-2 cursor-pointer"
                      >
                        <EditableImage
                          assetKey={card.avatarKey}
                          assets={assets}
                          fallbackText={card.name}
                          className="w-8 h-8 rounded-full object-cover shrink-0"
                          onEditAsset={onEditAsset}
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="font-title-md text-sm text-on-surface font-semibold group-hover:text-primary transition-colors truncate">
                            {card.name}
                          </h4>
                          <p className="font-body-sm text-xs text-on-surface-variant truncate">
                            {card.company}
                          </p>
                        </div>
                        <span className="font-label-code text-xs text-primary font-bold shrink-0">
                          {card.valueFormatted}
                        </span>
                      </div>

                      {/* Sentimento da Conversa Badge */}
                      <div className="mb-2 flex items-center justify-between gap-1">
                        <span className="font-telemetry-tag text-[9px] text-outline uppercase">
                          Sentimento IA:
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full border font-telemetry-tag text-[10px] ${getSentimentBadgeStyle(
                            card.sentiment
                          )}`}
                        >
                          {card.sentiment}
                        </span>
                      </div>

                      {/* CADEIA DE ATENDIMENTOS (Service Chain inside every Card) */}
                      <div className="bg-surface-container-lowest/90 p-2.5 rounded-lg border border-surface-container-high space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-telemetry-tag text-[10px] text-primary uppercase flex items-center gap-1">
                            <GitCommitHorizontal className="w-3.5 h-3.5" />
                            Cadeia de Atendimentos ({card.serviceChain.length})
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setAddingStepLeadId(
                                addingStepLeadId === card.id ? null : card.id
                              );
                            }}
                            className="text-[10px] font-telemetry-tag text-secondary hover:underline flex items-center gap-0.5"
                          >
                            <Plus className="w-3 h-3" /> Etapa
                          </button>
                        </div>

                        <div className="space-y-1 max-h-28 overflow-y-auto pr-1 thin-scrollbar">
                          {card.serviceChain.map((step) => (
                            <div
                              key={step.id}
                              className="flex items-center justify-between gap-1.5 text-[11px] font-body-sm"
                            >
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span
                                  className={`w-2 h-2 rounded-full shrink-0 ${
                                    step.status === 'concluido'
                                      ? 'bg-secondary-container'
                                      : step.status === 'em_andamento'
                                      ? 'bg-primary-container animate-pulse'
                                      : 'bg-outline/40'
                                  }`}
                                />
                                <span
                                  className={`truncate ${
                                    step.status === 'concluido'
                                      ? 'text-on-surface-variant line-through opacity-80'
                                      : step.status === 'em_andamento'
                                      ? 'text-on-surface font-semibold'
                                      : 'text-outline'
                                  }`}
                                >
                                  {step.title}
                                </span>
                              </div>
                              {step.timestamp && (
                                <span className="font-label-code text-[9px] text-outline shrink-0">
                                  {step.timestamp}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Inline Add Step Input */}
                        {addingStepLeadId === card.id && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="pt-1 flex items-center gap-1"
                          >
                            <input
                              type="text"
                              value={newStepText}
                              onChange={(e) => setNewStepText(e.target.value)}
                              placeholder="Nova ação na cadeia..."
                              className="flex-1 bg-surface-container text-on-surface text-xs px-2 py-1 rounded border border-primary-container/40 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleAddChainStep(card)}
                              className="px-2 py-1 rounded bg-primary-container text-on-primary font-telemetry-tag text-[10px] font-bold"
                            >
                              OK
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Quick Action Footer on Card: Advance by AI or Open Chat */}
                      <div className="mt-2.5 pt-2 border-t border-surface-container-high/60 flex items-center justify-between gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigate('inbox-omnichannel', card.id);
                          }}
                          className="text-outline hover:text-on-surface font-telemetry-tag text-[10px] flex items-center gap-1"
                        >
                          <Bot className="w-3 h-3 text-primary" />
                          <span className="truncate max-w-[115px]">
                            {card.assignedAgent}
                          </span>
                        </button>

                        {card.stage !== 'venda_fechada' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAdvanceNextStage(card, false);
                            }}
                            title="Avançar para a próxima etapa da cadeia no funil"
                            className="px-2 py-0.5 rounded bg-primary-container/15 hover:bg-primary-container text-primary hover:text-on-primary font-telemetry-tag text-[10px] font-bold flex items-center gap-0.5 transition-colors"
                          >
                            <span>Avançar Etapa</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal: + Novo Lead */}
      {isNewLeadOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-surface-container-low border border-surface-container-highest rounded-xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="px-5 py-4 bg-surface-container flex items-center justify-between border-b border-surface-container-highest">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-primary" />
                <h3 className="font-headline-sm text-on-surface font-semibold">
                  Adicionar Novo Lead & Iniciar Cadeia de Atendimento
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewLeadOpen(false)}
                className="p-1.5 rounded-lg bg-surface-container-high text-on-surface-variant hover:text-on-surface"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateLead} className="p-5 space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-telemetry-tag text-on-surface-variant uppercase mb-1">
                    Nome do Lead
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Ex: Henrique Vasconcelos"
                    required
                    className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-lg px-3 py-2 text-body-sm text-on-surface focus:outline-none focus:border-primary-container"
                  />
                </div>
                <div>
                  <label className="block font-telemetry-tag text-on-surface-variant uppercase mb-1">
                    Empresa
                  </label>
                  <input
                    type="text"
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    placeholder="Ex: Vasconcelos Tech"
                    required
                    className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-lg px-3 py-2 text-body-sm text-on-surface focus:outline-none focus:border-primary-container"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-telemetry-tag text-primary uppercase mb-1">
                    Funil de Destino
                  </label>
                  <select
                    value={newPipeline}
                    onChange={(e) => {
                      const val = e.target.value as FunnelPipelineType;
                      setNewPipeline(val);
                      setNewTrafficCat(
                        val === 'prospeccao_outbound'
                          ? 'Prospecção Ativa'
                          : 'Tráfego Pago'
                      );
                    }}
                    className="w-full bg-surface-container-lowest border border-primary-container/40 rounded-lg px-3 py-2 text-body-sm text-on-surface"
                  >
                    <option value="prospeccao_outbound">
                      Funil 1: Somente Prospecção (Outbound)
                    </option>
                    <option value="trafego_inbound">
                      Funil 2: Tráfego Pago & Orgânico (Inbound)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block font-telemetry-tag text-on-surface-variant uppercase mb-1">
                    Origem do Lead
                  </label>
                  <select
                    value={newTrafficCat}
                    onChange={(e) =>
                      setNewTrafficCat(
                        e.target.value as
                          | 'Prospecção Ativa'
                          | 'Tráfego Pago'
                          | 'Orgânico'
                      )
                    }
                    className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-lg px-3 py-2 text-body-sm text-on-surface"
                  >
                    <option value="Prospecção Ativa">Prospecção Ativa</option>
                    <option value="Tráfego Pago">
                      Tráfego Pago (Meta / Google Ads)
                    </option>
                    <option value="Orgânico">Orgânico (Busca / Redes)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-telemetry-tag text-on-surface-variant uppercase mb-1">
                    Valor (R$)
                  </label>
                  <input
                    type="number"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-lg px-3 py-2 font-label-code text-on-surface"
                  />
                </div>
                <div>
                  <label className="block font-telemetry-tag text-on-surface-variant uppercase mb-1">
                    Canal
                  </label>
                  <select
                    value={newChannel}
                    onChange={(e) =>
                      setNewChannel(e.target.value as ChannelType)
                    }
                    className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-lg px-2.5 py-2 text-body-sm text-on-surface"
                  >
                    <option value="whatsapp">WhatsApp</option>
                    <option value="instagram">Instagram</option>
                    <option value="webchat">Webchat</option>
                  </select>
                </div>
                <div>
                  <label className="block font-telemetry-tag text-on-surface-variant uppercase mb-1">
                    Etapa Inicial
                  </label>
                  <select
                    value={newStage}
                    onChange={(e) => setNewStage(e.target.value as FunnelStage)}
                    className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-lg px-2.5 py-2 text-body-sm text-on-surface"
                  >
                    {FUNNEL_STAGES_CONFIG.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.shortLabel}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-telemetry-tag text-on-surface-variant uppercase mb-1">
                  Link Direto da Foto / Imagem HTML (Opcional)
                </label>
                <input
                  type="url"
                  value={newAvatarUrl}
                  onChange={(e) => setNewAvatarUrl(e.target.value)}
                  placeholder="https://lh3.googleusercontent.com/..."
                  className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-lg px-3 py-2 font-label-code text-xs text-on-surface"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewLeadOpen(false)}
                  className="px-4 py-2 rounded-lg bg-surface-container-high text-on-surface font-body-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-primary-container text-on-primary font-headline-sm text-body-sm font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                >
                  Criar Lead no Funil
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
