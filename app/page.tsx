'use client';

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  BarChart3,
  MessageSquare,
  Kanban,
  Workflow,
  GitBranch,
  Cpu,
  Network,
  Terminal,
  ShieldCheck,
  Settings,
  Building2,
  ChevronsUpDown,
  Bell,
  Menu,
  X,
  Link2,
  PanelLeftClose,
  PanelLeftOpen,
  CheckCircle2,
  Clock,
  Bot,
  Smartphone,
} from 'lucide-react';
import {
  AgentSpecialist,
  CadenceSequence,
  ChatbotFlowNode,
  FUNNEL_STAGES_CONFIG,
  GeneralSystemConfig,
  ImageAssetConfig,
  IntegrationConnector,
  KnowledgeDocument,
  Lead,
  NavigationTab,
  TelemetryStreamEvent,
} from '@/lib/types';
import {
  INITIAL_AGENTS,
  INITIAL_CADENCES,
  INITIAL_CHATBOT_FLOW_NODES,
  INITIAL_GENERAL_CONFIG,
  INITIAL_IMAGE_ASSETS,
  INITIAL_INTEGRATIONS,
  INITIAL_KNOWLEDGE_DOCS,
  INITIAL_LEADS,
  INITIAL_STREAM_EVENTS,
} from '@/lib/initial-data';
import EditableImage from '@/components/EditableImage';
import ImageLinkModal from '@/components/ImageLinkModal';
import DashboardView from '@/components/views/DashboardView';
import InboxView from '@/components/views/InboxView';
import CrmKanbanView from '@/components/views/CrmKanbanView';
import BrainAutomationView from '@/components/views/BrainAutomationView';
import CadencesView from '@/components/views/CadencesView';
import KnowledgeBaseView from '@/components/views/KnowledgeBaseView';
import IntegrationsView from '@/components/views/IntegrationsView';

const STORAGE_KEY_ASSETS = 'aetheris_image_assets_v5';
const STORAGE_KEY_LEADS = 'aetheris_leads_v5';
const STORAGE_KEY_AGENTS = 'aetheris_agents_v5';
const STORAGE_KEY_NODES = 'aetheris_flow_nodes_v5';
const STORAGE_KEY_CONFIG = 'aetheris_general_config_v5';

export default function AetherisEcosystemApp() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [selectedLeadId, setSelectedLeadId] = useState<string>('lead-guilherme');
  const [sidebarOpenMobile, setSidebarOpenMobile] = useState(false);
  const [sidebarCollapsedDesktop, setSidebarCollapsedDesktop] = useState(false);

  // Core State
  const [assets, setAssets] =
    useState<Record<string, ImageAssetConfig>>(INITIAL_IMAGE_ASSETS);
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [agents, setAgents] = useState<AgentSpecialist[]>(INITIAL_AGENTS);
  const [chatbotNodes, setChatbotNodes] = useState<ChatbotFlowNode[]>(
    INITIAL_CHATBOT_FLOW_NODES
  );
  const [generalConfig, setGeneralConfig] = useState<GeneralSystemConfig>(
    INITIAL_GENERAL_CONFIG
  );
  const [streamEvents, setStreamEvents] = useState<TelemetryStreamEvent[]>(
    INITIAL_STREAM_EVENTS
  );
  const [knowledgeDocs, setKnowledgeDocs] = useState<KnowledgeDocument[]>(
    INITIAL_KNOWLEDGE_DOCS
  );
  const [cadences, setCadences] =
    useState<CadenceSequence[]>(INITIAL_CADENCES);
  const [integrations] = useState<IntegrationConnector[]>(INITIAL_INTEGRATIONS);

  // Image & Link Editor Modal State
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [editingAssetKey, setEditingAssetKey] = useState<string | null>(
    'brand_logo'
  );
  const [configSavedToast, setConfigSavedToast] = useState(false);

  // Tenant Switcher state
  const [tenantName, setTenantName] = useState('Aetheris WhatsApp IA / Prod');

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const savedAssets = localStorage.getItem(STORAGE_KEY_ASSETS);
      if (savedAssets) {
        setAssets({ ...INITIAL_IMAGE_ASSETS, ...JSON.parse(savedAssets) });
      }
      const savedLeads = localStorage.getItem(STORAGE_KEY_LEADS);
      if (savedLeads) {
        setLeads(JSON.parse(savedLeads));
      }
      const savedAgents = localStorage.getItem(STORAGE_KEY_AGENTS);
      if (savedAgents) {
        setAgents(JSON.parse(savedAgents));
      }
      const savedNodes = localStorage.getItem(STORAGE_KEY_NODES);
      if (savedNodes) {
        setChatbotNodes(JSON.parse(savedNodes));
      }
      const savedConfig = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (savedConfig) {
        setGeneralConfig(JSON.parse(savedConfig));
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const persistAssets = (updated: Record<string, ImageAssetConfig>) => {
    setAssets(updated);
    try {
      localStorage.setItem(STORAGE_KEY_ASSETS, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const persistLeads = (updated: Lead[]) => {
    setLeads(updated);
    try {
      localStorage.setItem(STORAGE_KEY_LEADS, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const persistAgents = (updated: AgentSpecialist[]) => {
    setAgents(updated);
    try {
      localStorage.setItem(STORAGE_KEY_AGENTS, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const persistNodes = (updated: ChatbotFlowNode[]) => {
    setChatbotNodes(updated);
    try {
      localStorage.setItem(STORAGE_KEY_NODES, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const persistGeneralConfig = (updated: GeneralSystemConfig) => {
    setGeneralConfig(updated);
    setConfigSavedToast(true);
    setTimeout(() => setConfigSavedToast(false), 2200);
    try {
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleSaveAsset = (key: string, updatedAsset: ImageAssetConfig) => {
    const next = { ...assets, [key]: updatedAsset };
    persistAssets(next);
  };

  const handleResetAssets = () => {
    persistAssets(INITIAL_IMAGE_ASSETS);
    persistLeads(INITIAL_LEADS);
    persistAgents(INITIAL_AGENTS);
    persistNodes(INITIAL_CHATBOT_FLOW_NODES);
    persistGeneralConfig(INITIAL_GENERAL_CONFIG);
  };

  const handleEditAsset = (key: string) => {
    setEditingAssetKey(key);
    setImageModalOpen(true);
  };

  const handleNavigate = (tab: NavigationTab, leadId?: string) => {
    if (leadId) {
      setSelectedLeadId(leadId);
    }
    setActiveTab(tab);
    setSidebarOpenMobile(false);
  };

  const handleUpdateLead = (updated: Lead) => {
    const prevLead = leads.find((l) => l.id === updated.id);
    const next = leads.map((l) => (l.id === updated.id ? updated : l));
    persistLeads(next);

    // If stage changed, log a live event in the AI Telemetry Feed
    if (prevLead && prevLead.stage !== updated.stage) {
      const fromLabel =
        FUNNEL_STAGES_CONFIG.find((s) => s.id === prevLead.stage)?.shortLabel ||
        prevLead.stage;
      const toLabel =
        FUNNEL_STAGES_CONFIG.find((s) => s.id === updated.stage)?.shortLabel ||
        updated.stage;

      const stageEvent: TelemetryStreamEvent = {
        id: `ev-stage-${Date.now()}`,
        category:
          updated.stage === 'venda_fechada'
            ? 'Venda Fechada'
            : updated.stage === 'nutricao'
            ? 'Inatividade ➔ Nutrição'
            : 'Avanço de Funil',
        categoryColor:
          updated.stage === 'venda_fechada'
            ? 'gold'
            : updated.stage === 'nutricao'
            ? 'cyan'
            : 'amber',
        timeAgo: 'Agora mesmo',
        description: `${updated.name} (${updated.company}) avançou de ${fromLabel} ➔ ${toLabel} (${updated.sentiment}).`,
        highlightName: updated.name,
        tag:
          updated.pipeline === 'prospeccao_outbound'
            ? 'Funil: Prospecção'
            : 'Funil: Tráfego Pago/Org',
        channel: updated.channel,
        linkedLeadId: updated.id,
        targetTab: 'crm-funil',
      };
      setStreamEvents((prev) => [stageEvent, ...prev]);
    }
  };

  const handleAddLead = (newLead: Lead, customAvatarUrl?: string) => {
    if (customAvatarUrl) {
      const nextAssets = {
        ...assets,
        [newLead.avatarKey]: {
          key: newLead.avatarKey,
          label: `${newLead.name} (${newLead.company})`,
          category: 'lead' as const,
          url: customAvatarUrl,
          alt: newLead.name,
          linkedTab: 'inbox-omnichannel' as const,
          linkedLeadId: newLead.id,
        },
      };
      persistAssets(nextAssets);
    }
    const nextLeads = [newLead, ...leads];
    persistLeads(nextLeads);
    setSelectedLeadId(newLead.id);

    const newEv: TelemetryStreamEvent = {
      id: `ev-${Date.now()}`,
      category: 'Novo Lead no Funil',
      categoryColor: 'amber',
      timeAgo: 'Agora mesmo',
      description: `${newLead.name} (${newLead.company}) entrou em Prospecção / Novo Lead com ticket de ${newLead.valueFormatted}.`,
      highlightName: newLead.name,
      tag: `${newLead.trafficCategory}`,
      channel: newLead.channel,
      linkedLeadId: newLead.id,
      targetTab: 'crm-funil',
    };
    setStreamEvents([newEv, ...streamEvents]);
  };

  const handleUpdateAgent = (updated: AgentSpecialist) => {
    const next = agents.map((a) => (a.id === updated.id ? updated : a));
    persistAgents(next);
  };

  const handleAddAgent = (newAgent: AgentSpecialist) => {
    persistAgents([...agents, newAgent]);
  };

  const handleSimulateStreamEvent = () => {
    const sampleEvents: TelemetryStreamEvent[] = [
      {
        id: `ev-${Date.now()}`,
        category: 'Avanço Automático IA',
        categoryColor: 'amber',
        timeAgo: 'Agora mesmo',
        description:
          'Roberto Dias respondeu no WhatsApp: IA detectou sentimento Qualificado e moveu de Prospecção ➔ Qualificação.',
        highlightName: 'Roberto Dias',
        tag: 'Funil: Prospecção Ativa',
        channel: 'whatsapp',
        linkedLeadId: 'lead-roberto',
        targetTab: 'crm-funil',
      },
      {
        id: `ev-${Date.now()}`,
        category: 'Inatividade Detectada',
        categoryColor: 'cyan',
        timeAgo: 'Agora mesmo',
        description:
          'Carla Mendes parou de responder: IA moveu de Qualificação ➔ Nutrição e enviou link de Estudo de Caso.',
        highlightName: 'Carla Mendes',
        tag: 'Funil: Tráfego Pago',
        channel: 'whatsapp',
        linkedLeadId: 'lead-carla',
        targetTab: 'crm-funil',
      },
      {
        id: `ev-${Date.now()}`,
        category: 'Fechamento WhatsApp',
        categoryColor: 'gold',
        timeAgo: 'Agora mesmo',
        description:
          'Guilherme Sampaio solicitou link de pagamento: IA enviou Checkout e moveu para Fechamento.',
        highlightName: 'Guilherme Sampaio',
        tag: 'Sentimento: Alta Intenção',
        channel: 'whatsapp',
        linkedLeadId: 'lead-guilherme',
        targetTab: 'inbox-omnichannel',
      },
    ];
    const picked =
      sampleEvents[Math.floor(Math.random() * sampleEvents.length)];
    setStreamEvents([picked, ...streamEvents]);
  };

  // Primary Sidebar Navigation Items (100% in Portuguese as requested)
  const navItems: {
    id: NavigationTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    badgeType?: 'primary' | 'secondary';
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: BarChart3,
    },
    {
      id: 'inbox-omnichannel',
      label: 'Conversas',
      icon: MessageSquare,
      badge: `${leads.length}`,
      badgeType: 'primary',
    },
    {
      id: 'conexoes-whatsapp',
      label: 'Conexões',
      icon: Network,
      badge: 'WhatsApp',
      badgeType: 'secondary',
    },
    {
      id: 'cerebro-automacao',
      label: 'Agente de IA',
      icon: Workflow,
      badge: 'Fluxo',
      badgeType: 'primary',
    },
    {
      id: 'crm-funil',
      label: 'CRM & Funil',
      icon: Kanban,
      badge: '2 Funis',
      badgeType: 'secondary',
    },
    {
      id: 'base-de-conhecimento',
      label: 'Base de Conhecimento',
      icon: Cpu,
    },
    {
      id: 'cadencias-remarketing',
      label: 'Cadências',
      icon: GitBranch,
    },
    {
      id: 'configuracoes-gerais',
      label: 'Configurações Gerais',
      icon: Settings,
    },
  ];

  // Fullbleed views (Inbox & CRM Kanban occupy 100% height without outer padding)
  const isFullHeightWorkspace =
    activeTab === 'inbox-omnichannel' || activeTab === 'crm-funil';

  return (
    <div className="bg-surface text-on-surface font-body antialiased selection:bg-primary-container selection:text-on-primary-container overflow-hidden h-screen w-screen flex select-none">
      {/* =====================================================================
          MOBILE DRAWER BACKDROP
      ===================================================================== */}
      {sidebarOpenMobile && (
        <div
          onClick={() => setSidebarOpenMobile(false)}
          className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* =====================================================================
          LEFT NAVIGATION RAIL (FIXED DESKTOP, COLLAPSIBLE NOTEBOOK, DRAWER MOBILE)
      ===================================================================== */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 bg-surface-container-lowest flex flex-col justify-between shrink-0 border-r border-surface-container-low transition-all duration-200 ${
          sidebarOpenMobile
            ? 'translate-x-0 w-[264px]'
            : '-translate-x-full lg:translate-x-0'
        } ${sidebarCollapsedDesktop ? 'lg:w-[78px]' : 'lg:w-[260px]'}`}
      >
        {/* Top Brand & Cluster Status */}
        <div className="p-space-md flex flex-col gap-space-sm">
          <div className="flex items-center justify-between gap-space-sm">
            <div className="flex items-center gap-space-sm min-w-0">
              <div className="relative w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center overflow-hidden shadow-lg shrink-0">
                <EditableImage
                  assetKey="brand_logo"
                  assets={assets}
                  fallbackText="AE"
                  className="w-full h-full object-cover opacity-90"
                  onEditAsset={handleEditAsset}
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-primary-container/40 to-transparent pointer-events-none" />
              </div>
              {!sidebarCollapsedDesktop && (
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h1 className="font-headline-sm font-bold tracking-tight text-on-surface leading-none truncate">
                      AETHERIS AI
                    </h1>
                    <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse shrink-0" />
                  </div>
                  <span className="font-telemetry-tag text-on-surface-variant mt-1 truncate">
                    AGENTE VIRTUAL & CRM
                  </span>
                </div>
              )}
            </div>

            {/* Mobile Close or Desktop Collapse */}
            <button
              type="button"
              onClick={() => setSidebarOpenMobile(false)}
              className="lg:hidden p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface"
            >
              <X className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() =>
                setSidebarCollapsedDesktop(!sidebarCollapsedDesktop)
              }
              title={
                sidebarCollapsedDesktop
                  ? 'Expandir menu lateral'
                  : 'Recolher menu (Modo Notebook)'
              }
              className="hidden lg:flex p-1.5 rounded-lg text-outline hover:text-primary hover:bg-surface-container transition-colors"
            >
              {sidebarCollapsedDesktop ? (
                <PanelLeftOpen className="w-4 h-4" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Cluster Pill */}
          {!sidebarCollapsedDesktop && (
            <div
              onClick={() => handleNavigate('conexoes-whatsapp')}
              className="bg-surface-container-low px-space-sm py-2 rounded-lg flex items-center justify-between cursor-pointer hover:bg-surface-container transition-colors"
            >
              <div className="flex items-center gap-space-xs">
                <Terminal className="w-3.5 h-3.5 text-primary" />
                <span className="font-label-code text-on-surface-variant text-xs">
                  WHATSAPP IA ATIVO
                </span>
              </div>
              <span className="font-label-code text-secondary text-xs font-semibold">
                ONLINE
              </span>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-space-xs space-y-1 overflow-y-auto thin-scrollbar">
          {!sidebarCollapsedDesktop && (
            <div className="px-space-sm py-1.5">
              <span className="font-telemetry-tag text-outline">
                MENU PRINCIPAL DO SISTEMA
              </span>
            </div>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavigate(item.id)}
                title={item.label}
                className={`w-full flex items-center ${
                  sidebarCollapsedDesktop
                    ? 'justify-center px-2'
                    : 'justify-between px-space-sm'
                } py-2.5 rounded-r-lg transition-all duration-150 group ${
                  isActive
                    ? 'bg-surface-container-high/60 text-primary border-l-[3px] border-primary-container'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low/50'
                }`}
              >
                <div className="flex items-center gap-space-sm min-w-0">
                  <Icon
                    className={`w-5 h-5 shrink-0 ${
                      isActive
                        ? 'text-primary'
                        : 'text-outline group-hover:text-primary'
                    } transition-colors`}
                  />
                  {!sidebarCollapsedDesktop && (
                    <span
                      className={`font-body-md truncate ${
                        isActive ? 'font-semibold' : 'font-medium'
                      }`}
                    >
                      {item.label}
                    </span>
                  )}
                </div>

                {!sidebarCollapsedDesktop && item.badge && (
                  <span
                    className={`px-1.5 py-0.5 rounded font-label-code text-[11px] font-bold shrink-0 ${
                      item.badgeType === 'secondary'
                        ? 'bg-secondary-container/20 text-secondary'
                        : 'bg-primary-container text-on-primary'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Operator Card & Quick HTML Image Link Button */}
        <div className="p-space-md bg-surface-container-low/40 flex flex-col gap-space-sm border-t border-surface-container-low">
          {!sidebarCollapsedDesktop && (
            <button
              type="button"
              onClick={() => {
                setEditingAssetKey('brand_logo');
                setImageModalOpen(true);
              }}
              className="w-full py-2 px-3 rounded-lg bg-primary-container/15 hover:bg-primary-container/25 border border-primary-container/30 text-primary font-telemetry-tag text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all"
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>Editar Links de Imagens HTML</span>
            </button>
          )}

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-space-xs min-w-0">
              <EditableImage
                assetKey="operator_alex_vance"
                assets={assets}
                fallbackText="AV"
                className="w-8 h-8 rounded-full object-cover ring-1 ring-primary-container/40 shrink-0"
                onEditAsset={handleEditAsset}
              />
              {!sidebarCollapsedDesktop && (
                <div className="flex flex-col min-w-0">
                  <span className="font-body-sm text-on-surface font-medium leading-tight truncate">
                    Dr. Alex Vance
                  </span>
                  <span className="font-telemetry-tag text-primary text-[10px] truncate">
                    Gestor do Agente IA
                  </span>
                </div>
              )}
            </div>
            {!sidebarCollapsedDesktop && (
              <button
                type="button"
                onClick={() => handleNavigate('configuracoes-gerais')}
                className="text-outline hover:text-on-surface transition-colors p-1"
                title="Configurações Gerais"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* =====================================================================
          MAIN VIEWPORT AREA (TOP TELEMETRY BAR + ACTIVE MODULE CANVAS)
      ===================================================================== */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-surface relative">
        {/* Ambient Subtle Radial Glow */}
        <div className="pointer-events-none absolute -top-36 left-1/3 w-[560px] h-[280px] bg-primary-container/5 rounded-full blur-[120px]" />

        {/* TOP TELEMETRY & QUICK NAVIGATION BAR */}
        <header className="h-16 px-space-md sm:px-space-lg bg-surface-container-low/90 backdrop-blur-md flex items-center justify-between shrink-0 z-20 border-b border-surface-container">
          {/* Left: Mobile Hamburger + Tenant Selector + Quick 3 Tabs (Dashboard | Conversas | Conexões) */}
          <div className="flex items-center gap-space-sm sm:gap-space-md">
            <button
              type="button"
              onClick={() => setSidebarOpenMobile(true)}
              className="lg:hidden p-2 rounded-lg bg-surface-container-high text-on-surface hover:text-primary transition-colors"
              aria-label="Abrir Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() =>
                setTenantName((prev) =>
                  prev.includes('Prod')
                    ? 'Aetheris WhatsApp / Cluster 02'
                    : 'Aetheris WhatsApp IA / Prod'
                )
              }
              className="hidden sm:flex items-center gap-space-xs bg-surface-container-lowest px-space-sm py-1.5 rounded-lg cursor-pointer hover:bg-surface-container transition-colors border border-surface-container-high/50"
            >
              <Building2 className="w-4 h-4 text-primary shrink-0" />
              <span className="font-body-sm font-medium text-on-surface truncate max-w-[180px]">
                {tenantName}
              </span>
              <ChevronsUpDown className="w-3.5 h-3.5 text-outline shrink-0" />
            </button>

            {/* Quick Pill Bar for Core Sequence: Dashboard | Conversas | Conexões | Agente IA | CRM */}
            <div className="hidden xl:flex items-center gap-1 bg-surface-container-lowest p-1 rounded-lg border border-surface-container-high">
              {(
                [
                  { id: 'dashboard', label: 'Dashboard' },
                  { id: 'inbox-omnichannel', label: 'Conversas' },
                  { id: 'conexoes-whatsapp', label: 'Conexões' },
                  { id: 'cerebro-automacao', label: 'Agente de IA' },
                  { id: 'crm-funil', label: 'CRM & Funil' },
                ] as { id: NavigationTab; label: string }[]
              ).map((q) => (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => handleNavigate(q.id)}
                  className={`px-2.5 py-1 rounded font-telemetry-tag text-[11px] transition-all ${
                    activeTab === q.id
                      ? 'bg-primary-container text-on-primary font-bold'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Quick Direct Image Link Editor Trigger & System Pulse */}
          <div className="flex items-center gap-space-sm">
            <button
              type="button"
              onClick={() => {
                setEditingAssetKey('brand_logo');
                setImageModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-bright border border-primary-container/30 text-on-surface font-label-code text-xs flex items-center gap-2 transition-all"
              title="Gerenciar links diretos para as imagens do HTML e navegação"
            >
              <Link2 className="w-3.5 h-3.5 text-primary" />
              <span className="hidden sm:inline">Links & Imagens HTML</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavigate('inbox-omnichannel')}
              className="relative p-2 rounded-lg bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
              title="Abrir Conversas"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary-container" />
            </button>
          </div>
        </header>

        {/* ===================================================================
            MAIN VIEWPORT CONTENT AREA
        =================================================================== */}
        <main
          className={`flex-1 relative z-10 ${
            isFullHeightWorkspace
              ? 'overflow-hidden flex flex-col'
              : 'overflow-y-auto p-space-md sm:p-space-lg thin-scrollbar'
          } pb-16 lg:pb-0`}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.16 }}
              className={
                isFullHeightWorkspace ? 'h-full w-full flex flex-col' : 'w-full'
              }
            >
              {activeTab === 'dashboard' && (
                <DashboardView
                  leads={leads}
                  agents={agents}
                  streamEvents={streamEvents}
                  assets={assets}
                  onNavigate={handleNavigate}
                  onEditAsset={handleEditAsset}
                  onSimulateEvent={handleSimulateStreamEvent}
                />
              )}

              {activeTab === 'inbox-omnichannel' && (
                <InboxView
                  leads={leads}
                  selectedLeadId={selectedLeadId}
                  agents={agents}
                  knowledgeDocs={knowledgeDocs}
                  assets={assets}
                  onSelectLead={setSelectedLeadId}
                  onUpdateLead={handleUpdateLead}
                  onEditAsset={handleEditAsset}
                  onNavigate={handleNavigate}
                />
              )}

              {activeTab === 'conexoes-whatsapp' && (
                <IntegrationsView
                  integrations={integrations}
                  agents={agents}
                  generalConfig={generalConfig}
                  onUpdateGeneralConfig={persistGeneralConfig}
                  onOpenImageManager={() => {
                    setEditingAssetKey('brand_logo');
                    setImageModalOpen(true);
                  }}
                />
              )}

              {activeTab === 'cerebro-automacao' && (
                <BrainAutomationView
                  agents={agents}
                  chatbotNodes={chatbotNodes}
                  onUpdateAgent={handleUpdateAgent}
                  onAddAgent={handleAddAgent}
                  onUpdateChatbotNodes={persistNodes}
                  onAddLead={handleAddLead}
                  onNavigate={handleNavigate}
                />
              )}

              {activeTab === 'crm-funil' && (
                <CrmKanbanView
                  leads={leads}
                  assets={assets}
                  onUpdateLead={handleUpdateLead}
                  onAddLead={handleAddLead}
                  onNavigate={handleNavigate}
                  onEditAsset={handleEditAsset}
                />
              )}

              {activeTab === 'cadencias-remarketing' && (
                <CadencesView
                  cadences={cadences}
                  onAddCadenceStep={(cadenceId, step) => {
                    setCadences((prev) =>
                      prev.map((c) =>
                        c.id === cadenceId
                          ? { ...c, steps: [...c.steps, step] }
                          : c
                      )
                    );
                  }}
                />
              )}

              {activeTab === 'base-de-conhecimento' && (
                <KnowledgeBaseView
                  documents={knowledgeDocs}
                  onAddDocument={(doc) =>
                    setKnowledgeDocs([doc, ...knowledgeDocs])
                  }
                />
              )}

              {activeTab === 'configuracoes-gerais' && (
                <div className="flex flex-col w-full gap-space-lg pb-space-xl">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
                        <span className="font-telemetry-tag text-primary uppercase">
                          Parâmetros Globais // Inteligência WhatsApp, Regras de Inatividade & Links HTML
                        </span>
                      </div>
                      <h2 className="font-headline-lg text-on-surface mt-0.5">
                        Configurações Gerais do Agente & Integralização WhatsApp
                      </h2>
                      <p className="font-body-sm text-on-surface-variant">
                        Configure as regras automáticas de transição de funil por sentimento, detecção de leads que param de responder (Nutrição / Follow-up) e links diretos de imagens.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {configSavedToast && (
                        <span className="px-3 py-2 rounded-lg bg-secondary-container/20 text-secondary font-telemetry-tag text-xs flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Configurações Atualizadas!</span>
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => setImageModalOpen(true)}
                        className="px-4 py-2.5 rounded-lg bg-primary-container text-on-primary font-headline-sm text-xs font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)] flex items-center gap-2"
                      >
                        <Link2 className="w-4 h-4" />
                        <span>Abrir Editor Visual de Imagens HTML</span>
                      </button>
                    </div>
                  </div>

                  {/* Automation & WhatsApp Intelligence Settings */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
                    {/* Left 7 Cols: Funnel & Inactivity Automation Rules */}
                    <div className="lg:col-span-7 bg-surface-container/80 backdrop-blur-xl rounded-xl p-space-md sm:p-space-lg border border-surface-container-high flex flex-col gap-4 shadow-xl">
                      <div className="flex items-center gap-2 border-b border-surface-container-highest pb-3">
                        <Bot className="w-5 h-5 text-primary" />
                        <h3 className="font-headline-sm text-on-surface">
                          Regras de Automação do Agente de IA no Funil & WhatsApp
                        </h3>
                      </div>

                      {/* Toggle 1 */}
                      <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-surface-container-high flex items-center justify-between gap-4">
                        <div>
                          <h4 className="font-title-md text-on-surface font-semibold">
                            Avanço Automático de Estágio por Sentimento da Conversa
                          </h4>
                          <p className="font-body-sm text-xs text-on-surface-variant">
                            Quando ativo, à medida que o lead responde no WhatsApp, a IA analisa o sentimento e move o card sozinha de Prospecção ➔ Qualificação ➔ Proposta ➔ Negociação ➔ Fechamento ➔ Venda Fechada.
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={generalConfig.autoAdvanceFunnelBySentiment}
                          onChange={(e) =>
                            persistGeneralConfig({
                              ...generalConfig,
                              autoAdvanceFunnelBySentiment: e.target.checked,
                            })
                          }
                          className="w-5 h-5 accent-amber-500 cursor-pointer shrink-0"
                        />
                      </div>

                      {/* Toggle 2 */}
                      <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-surface-container-high flex items-center justify-between gap-4">
                        <div>
                          <h4 className="font-title-md text-on-surface font-semibold">
                            Detectar Quando o Lead Para de Responder (Mover p/ Nutrição & Follow-up)
                          </h4>
                          <p className="font-body-sm text-xs text-on-surface-variant">
                            Se um lead qualificado parar de responder, a IA entende a inatividade, move o card automaticamente para Nutrição e inicia o envio de conteúdo e retomada de Follow-up.
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={generalConfig.autoMoveToNutritionOnInactivity}
                          onChange={(e) =>
                            persistGeneralConfig({
                              ...generalConfig,
                              autoMoveToNutritionOnInactivity: e.target.checked,
                            })
                          }
                          className="w-5 h-5 accent-amber-500 cursor-pointer shrink-0"
                        />
                      </div>

                      {/* Inactivity Timers */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-surface-container-high space-y-1.5">
                          <label className="font-telemetry-tag text-[10px] text-on-surface-variant uppercase flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-primary" />
                            <span>Tempo s/ Resposta p/ Entrar em Nutrição (Minutos)</span>
                          </label>
                          <input
                            type="number"
                            min={5}
                            max={1440}
                            value={generalConfig.inactivityMinutesForNutrition}
                            onChange={(e) =>
                              persistGeneralConfig({
                                ...generalConfig,
                                inactivityMinutesForNutrition:
                                  Number(e.target.value) || 30,
                              })
                            }
                            className="w-full bg-surface-container-low border border-surface-container-highest rounded-lg px-3 py-1.5 font-label-code text-sm text-primary font-bold focus:outline-none focus:border-primary-container"
                          />
                        </div>

                        <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-surface-container-high space-y-1.5">
                          <label className="font-telemetry-tag text-[10px] text-on-surface-variant uppercase flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-secondary" />
                            <span>Tempo p/ Avançar Nutrição ➔ Follow-up (Horas)</span>
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={168}
                            value={generalConfig.inactivityHoursForFollowup}
                            onChange={(e) =>
                              persistGeneralConfig({
                                ...generalConfig,
                                inactivityHoursForFollowup:
                                  Number(e.target.value) || 24,
                              })
                            }
                            className="w-full bg-surface-container-low border border-surface-container-highest rounded-lg px-3 py-1.5 font-label-code text-sm text-secondary font-bold focus:outline-none focus:border-primary-container"
                          />
                        </div>
                      </div>

                      {/* Toggle 3 & 4 */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-surface-container-high flex items-center justify-between gap-3">
                          <div>
                            <h4 className="font-body-sm text-on-surface font-semibold">
                              Transcrição de Áudios no WhatsApp
                            </h4>
                            <p className="font-telemetry-tag text-[10px] text-outline">
                              Ouvir e responder áudios enviados pelos leads
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            checked={generalConfig.enableAudioTranscription}
                            onChange={(e) =>
                              persistGeneralConfig({
                                ...generalConfig,
                                enableAudioTranscription: e.target.checked,
                              })
                            }
                            className="w-4 h-4 accent-amber-500 cursor-pointer shrink-0"
                          />
                        </div>

                        <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-surface-container-high flex items-center justify-between gap-3">
                          <div>
                            <h4 className="font-body-sm text-on-surface font-semibold">
                              Envio Automático de Link de Checkout
                            </h4>
                            <p className="font-telemetry-tag text-[10px] text-outline">
                              Disparar link de pagamento na etapa Fechamento
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            checked={generalConfig.enableAutoCheckoutLinks}
                            onChange={(e) =>
                              persistGeneralConfig({
                                ...generalConfig,
                                enableAutoCheckoutLinks: e.target.checked,
                              })
                            }
                            className="w-4 h-4 accent-amber-500 cursor-pointer shrink-0"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Right 5 Cols: Quick WhatsApp Integration Status & Shortcuts */}
                    <div className="lg:col-span-5 bg-surface-container/80 backdrop-blur-xl rounded-xl p-space-md sm:p-space-lg border border-surface-container-high flex flex-col justify-between gap-4 shadow-xl">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-surface-container-highest pb-3">
                          <Smartphone className="w-5 h-5 text-secondary" />
                          <h3 className="font-headline-sm text-on-surface">
                            Status da Integralização no WhatsApp
                          </h3>
                        </div>

                        <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-surface-container-high space-y-2">
                          <span className="font-telemetry-tag text-[10px] text-outline uppercase block">
                            Instância Padrão de Atendimento
                          </span>
                          <input
                            type="text"
                            value={generalConfig.whatsappDefaultInstance}
                            onChange={(e) =>
                              persistGeneralConfig({
                                ...generalConfig,
                                whatsappDefaultInstance: e.target.value,
                              })
                            }
                            className="w-full bg-surface-container-low border border-surface-container-highest rounded-lg px-3 py-2 font-label-code text-xs text-primary focus:outline-none focus:border-primary-container"
                          />
                        </div>

                        <div className="grid grid-cols-1 gap-2.5">
                          <button
                            type="button"
                            onClick={() => handleNavigate('conexoes-whatsapp')}
                            className="p-3 rounded-xl bg-surface-container-lowest hover:bg-surface-container-high border border-surface-container-high flex items-center justify-between transition-colors text-left"
                          >
                            <div>
                              <span className="font-body-sm text-on-surface font-semibold block">
                                Gerenciar QR Code e API Oficial do WhatsApp
                              </span>
                              <span className="font-telemetry-tag text-[10px] text-outline">
                                Abrir módulo de Conexões
                              </span>
                            </div>
                            <span className="font-telemetry-tag text-xs text-primary font-bold">
                              Abrir ➔
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleNavigate('cerebro-automacao')}
                            className="p-3 rounded-xl bg-surface-container-lowest hover:bg-surface-container-high border border-surface-container-high flex items-center justify-between transition-colors text-left"
                          >
                            <div>
                              <span className="font-body-sm text-on-surface font-semibold block">
                                Configurar Links Principais & Fluxo Chatbot da IA
                              </span>
                              <span className="font-telemetry-tag text-[10px] text-outline">
                                Abrir módulo Agente de IA
                              </span>
                            </div>
                            <span className="font-telemetry-tag text-xs text-primary font-bold">
                              Abrir ➔
                            </span>
                          </button>
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-secondary-container/10 border border-secondary-container/30 flex items-center justify-between">
                        <span className="font-telemetry-tag text-xs text-secondary">
                          Deseja restaurar os dados de demonstração?
                        </span>
                        <button
                          type="button"
                          onClick={handleResetAssets}
                          className="px-3 py-1 rounded bg-surface-container-highest text-on-surface font-telemetry-tag text-[10px] hover:text-primary"
                        >
                          Restaurar Padrão
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Direct HTML Image Links Gallery */}
                  <div className="space-y-3">
                    <h3 className="font-headline-sm text-on-surface">
                      Galeria de Imagens HTML & Atalhos Diretos de Navegação
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
                      {Object.values(assets).map((asset) => (
                        <div
                          key={asset.key}
                          className="p-space-md rounded-xl bg-surface-container/80 border border-surface-container-high flex flex-col justify-between gap-3"
                        >
                          <div className="flex items-center gap-3">
                            <EditableImage
                              assetKey={asset.key}
                              assets={assets}
                              fallbackText={asset.label}
                              className="w-14 h-14 rounded-lg object-cover border border-primary-container/30"
                              onEditAsset={handleEditAsset}
                            />
                            <div className="min-w-0 flex-1">
                              <span className="font-telemetry-tag text-[10px] text-primary uppercase">
                                {asset.category}
                              </span>
                              <h4 className="font-title-md text-on-surface font-semibold truncate">
                                {asset.label}
                              </h4>
                              <p className="font-label-code text-[11px] text-outline truncate">
                                {asset.url}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-surface-container-highest">
                            <button
                              type="button"
                              onClick={() => handleEditAsset(asset.key)}
                              className="font-telemetry-tag text-xs text-primary hover:underline"
                            >
                              Editar URL / Link
                            </button>
                            {asset.linkedTab && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleNavigate(
                                    asset.linkedTab!,
                                    asset.linkedLeadId
                                  )
                                }
                                className="px-2.5 py-1 rounded bg-surface-container-high hover:bg-surface-bright text-secondary font-telemetry-tag text-[10px]"
                              >
                                Ir para {asset.linkedTab} ➔
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* ===================================================================
            MOBILE BOTTOM NAVIGATION BAR (THUMB-FRIENDLY)
        =================================================================== */}
        <nav className="lg:hidden fixed bottom-0 inset-x-0 h-14 bg-surface-container-lowest/95 backdrop-blur-xl border-t border-surface-container-high z-30 flex items-center justify-around px-1">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'inbox-omnichannel', label: 'Conversas', icon: MessageSquare },
            { id: 'conexoes-whatsapp', label: 'Conexões', icon: Network },
            { id: 'cerebro-automacao', label: 'Agente IA', icon: Workflow },
            { id: 'crm-funil', label: 'Funis CRM', icon: Kanban },
          ].map((m) => {
            const Icon = m.icon;
            const isActive = activeTab === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => handleNavigate(m.id as NavigationTab)}
                className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors ${
                  isActive ? 'text-primary' : 'text-outline hover:text-on-surface'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-telemetry-tag text-[9px] mt-0.5">
                  {m.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* =====================================================================
          VISUAL IMAGE & DIRECT HTML LINK EDITOR MODAL
      ===================================================================== */}
      <ImageLinkModal
        isOpen={imageModalOpen}
        selectedKey={editingAssetKey}
        assets={assets}
        leads={leads}
        onClose={() => setImageModalOpen(false)}
        onSaveAsset={handleSaveAsset}
        onResetAssets={handleResetAssets}
        onNavigate={handleNavigate}
      />
    </div>
  );
}
