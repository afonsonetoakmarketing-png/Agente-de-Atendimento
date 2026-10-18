'use client';

import React, { useState } from 'react';
import {
  Download,
  RefreshCw,
  ArrowUp,
  Network,
  CreditCard,
  Brain,
  Cpu,
  Timer,
  Zap,
  Radio,
  MessageSquare,
  CheckCircle2,
  Headphones,
  Megaphone,
  TrendingUp,
  ArrowRight,
  RadioTower,
  Sparkles,
  X,
  ShieldCheck,
  ExternalLink,
  Image as ImageIcon,
} from 'lucide-react';
import {
  AgentSpecialist,
  ImageAssetConfig,
  Lead,
  NavigationTab,
  TelemetryStreamEvent,
} from '@/lib/types';
import EditableImage from '@/components/EditableImage';

interface DashboardViewProps {
  leads: Lead[];
  agents: AgentSpecialist[];
  streamEvents: TelemetryStreamEvent[];
  assets: Record<string, ImageAssetConfig>;
  onNavigate: (tab: NavigationTab, leadId?: string) => void;
  onEditAsset: (key: string) => void;
  onSimulateEvent: () => void;
}

export default function DashboardView({
  leads,
  agents,
  streamEvents,
  assets,
  onNavigate,
  onEditAsset,
  onSimulateEvent,
}: DashboardViewProps) {
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d'>('24h');
  const [channelsVisible, setChannelsVisible] = useState({
    wa: true,
    ig: true,
    wb: true,
  });
  const [exportStatus, setExportStatus] = useState<
    'idle' | 'generating' | 'done'
  >('idle');
  const [auditModalOpen, setAuditModalOpen] = useState(false);

  const toggleChannel = (ch: 'wa' | 'ig' | 'wb') => {
    setChannelsVisible((prev) => ({ ...prev, [ch]: !prev[ch] }));
  };

  // Dynamic metrics based on timeframe
  const timeframeMetrics = {
    '24h': {
      leadsTotal: '14.820',
      leadsPrev: 'vs. 12.518 ciclo anterior',
      leadsGrowth: '+18.4%',
      gmv: 'R$ 842.600',
      aiRatio: 71,
      qualRate: '94.2%',
      avgReply: '1.4s',
      waVol: '10.840 msgs',
      igVol: '2.910 msgs',
      wbVol: '1.070 msgs',
      peakText: 'Pico: 3.420 msgs/min',
      waPathArea:
        'M0,90 C80,60 140,80 230,45 C320,10 400,65 490,30 C580,-5 640,40 700,20 L700,230 L0,230 Z',
      waPathLine:
        'M0,90 C80,60 140,80 230,45 C320,10 400,65 490,30 C580,-5 640,40 700,20',
    },
    '7d': {
      leadsTotal: '92.410',
      leadsPrev: 'vs. 76.120 semana anterior',
      leadsGrowth: '+21.4%',
      gmv: 'R$ 4.920.000',
      aiRatio: 76,
      qualRate: '95.8%',
      avgReply: '1.2s',
      waVol: '68.120 msgs',
      igVol: '17.400 msgs',
      wbVol: '6.890 msgs',
      peakText: 'Pico: 4.180 msgs/min',
      waPathArea:
        'M0,110 C80,75 140,55 230,65 C320,25 400,45 490,22 C580,10 640,28 700,14 L700,230 L0,230 Z',
      waPathLine:
        'M0,110 C80,75 140,55 230,65 C320,25 400,45 490,22 C580,10 640,28 700,14',
    },
    '30d': {
      leadsTotal: '384.900',
      leadsPrev: 'vs. 310.400 mês anterior',
      leadsGrowth: '+24.0%',
      gmv: 'R$ 19.840.000',
      aiRatio: 79,
      qualRate: '96.4%',
      avgReply: '1.1s',
      waVol: '284.500 msgs',
      igVol: '71.200 msgs',
      wbVol: '29.200 msgs',
      peakText: 'Pico: 5.090 msgs/min',
      waPathArea:
        'M0,120 C80,85 140,70 230,50 C320,35 400,30 490,18 C580,12 640,15 700,8 L700,230 L0,230 Z',
      waPathLine:
        'M0,120 C80,85 140,70 230,50 C320,35 400,30 490,18 C580,12 640,15 700,8',
    },
  }[timeframe];

  const handleExport = () => {
    setExportStatus('generating');
    setTimeout(() => {
      const payload = {
        exportedAt: new Date().toISOString(),
        timeframe,
        metrics: timeframeMetrics,
        activeLeadsCount: leads.length,
        agents,
        recentEvents: streamEvents,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `aetheris-telemetria-${timeframe}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setExportStatus('done');
      setTimeout(() => setExportStatus('idle'), 2200);
    }, 800);
  };

  const screenShortcuts = Object.values(assets).filter(
    (a) => a.category === 'screen_html'
  );

  return (
    <div className="flex flex-col w-full gap-space-lg pb-space-xl">
      {/* Top Command & Filter Deck */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
        <div className="flex flex-col">
          <div className="flex items-center gap-space-xs">
            <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse"></span>
            <span className="font-telemetry-tag text-primary uppercase">
              Cockpit Executivo v4.2 // Telemetria Global
            </span>
          </div>
          <h2 className="font-headline-lg text-on-surface tracking-tight mt-0.5">
            Visão Executiva do Ecossistema
          </h2>
          <p className="font-body-sm text-on-surface-variant">
            Monitoramento autônomo de agentes, conversão monetária e pulso neural multi-tenant.
          </p>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-space-sm flex-wrap">
          {/* Period Selector Pill Box */}
          <div className="bg-surface-container-high/80 p-1 rounded-lg flex items-center shadow-inner backdrop-blur-md">
            {(
              [
                { id: '24h', label: 'Últimas 24h' },
                { id: '7d', label: '7 Dias' },
                { id: '30d', label: '30 Dias' },
              ] as const
            ).map((btn) => (
              <button
                key={btn.id}
                type="button"
                onClick={() => setTimeframe(btn.id)}
                className={`px-space-sm py-1 rounded font-telemetry-tag transition-all duration-150 ${
                  timeframe === btn.id
                    ? 'text-on-primary bg-primary-container shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Live Sync Indicator */}
          <button
            type="button"
            onClick={onSimulateEvent}
            title="Clique para injetar um novo pulso de telemetria em tempo real"
            className="hidden sm:flex items-center gap-1.5 px-space-sm py-2 rounded-lg bg-surface-container-low/70 hover:bg-surface-container-high transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-secondary-container animate-spin" style={{ animationDuration: '4s' }} />
            <span className="font-label-code text-on-surface-variant">
              Sync: 1.2s
            </span>
          </button>

          {/* Export Button */}
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-space-xs px-space-md py-2 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-variant transition-all duration-150 shadow-md"
          >
            {exportStatus === 'generating' ? (
              <>
                <RefreshCw className="w-4 h-4 text-primary animate-spin" />
                <span className="font-label-code font-medium">
                  Gerando JSON...
                </span>
              </>
            ) : exportStatus === 'done' ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-secondary" />
                <span className="font-label-code font-medium text-secondary">
                  Exportado!
                </span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-primary" />
                <span className="font-label-code font-medium">
                  Exportar Telemetria
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Row 1: 4 Glassmorphism KPI Shields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        {/* Card 1: Leads Totais */}
        <div
          onClick={() => onNavigate('crm-funil')}
          className="relative bg-surface-container/70 backdrop-blur-xl rounded-xl p-space-md shadow-xl overflow-hidden flex flex-col justify-between group hover:bg-surface-container/90 transition-all duration-200 cursor-pointer border border-transparent hover:border-primary-container/30"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
          <div className="flex items-center justify-between">
            <span className="font-telemetry-tag text-on-surface-variant uppercase tracking-wider">
              Leads Totais Ingeridos
            </span>
            <div className="p-1.5 rounded-lg bg-surface-container-lowest text-primary">
              <Network className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-space-sm">
            <div className="flex items-baseline gap-space-xs">
              <span className="font-headline-xl text-on-surface tracking-tight">
                {timeframeMetrics.leadsTotal}
              </span>
              <span className="font-telemetry-tag text-secondary font-bold flex items-center">
                <ArrowUp className="w-3.5 h-3.5" />
                {timeframeMetrics.leadsGrowth}
              </span>
            </div>
            <p className="font-body-sm text-on-surface-variant">
              {timeframeMetrics.leadsPrev}
            </p>
          </div>
          {/* Mini Sparkline Golden SVG */}
          <div className="mt-space-md pt-space-xs flex items-end justify-between">
            <div className="w-full h-8">
              <svg
                className="w-full h-full overflow-visible"
                preserveAspectRatio="none"
                viewBox="0 0 160 32"
              >
                <defs>
                  <linearGradient id="sparkGrad1" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,26 Q20,18 40,22 T80,14 T120,8 T160,2 L160,32 L0,32 Z"
                  fill="url(#sparkGrad1)"
                />
                <path
                  d="M0,26 Q20,18 40,22 T80,14 T120,8 T160,2"
                  fill="none"
                  stroke="#f59e0b"
                  strokeLinecap="round"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Card 2: Volume Faturado */}
        <div
          onClick={() => onNavigate('crm-funil')}
          className="relative bg-surface-container/70 backdrop-blur-xl rounded-xl p-space-md shadow-xl overflow-hidden flex flex-col justify-between group hover:bg-surface-container/90 transition-all duration-200 cursor-pointer border border-transparent hover:border-primary-container/30"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
          <div className="flex items-center justify-between">
            <span className="font-telemetry-tag text-on-surface-variant uppercase tracking-wider">
              Volume Faturado
            </span>
            <div className="p-1.5 rounded-lg bg-surface-container-lowest text-secondary-container">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-space-sm">
            <div className="flex items-baseline gap-space-xs">
              <span className="font-metric-counter text-on-surface">
                {timeframeMetrics.gmv}
              </span>
            </div>
            <p className="font-body-sm text-on-surface-variant">
              Gross GMV transacionado via funil
            </p>
          </div>
          <div className="mt-space-md flex flex-col gap-1.5">
            <div className="flex justify-between items-center font-telemetry-tag">
              <span className="text-primary font-bold">
                {timeframeMetrics.aiRatio}% Robô (IA)
              </span>
              <span className="text-on-surface-variant">
                {100 - timeframeMetrics.aiRatio}% Humano
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden flex">
              <div
                className="h-full bg-primary-container rounded-l-full shadow-[0_0_10px_rgba(245,158,11,0.5)] transition-all duration-300"
                style={{ width: `${timeframeMetrics.aiRatio}%` }}
              />
              <div
                className="h-full bg-surface-bright rounded-r-full transition-all duration-300"
                style={{ width: `${100 - timeframeMetrics.aiRatio}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 3: Qualificação Neural */}
        <div
          onClick={() => onNavigate('inbox-omnichannel')}
          className="relative bg-surface-container/70 backdrop-blur-xl rounded-xl p-space-md shadow-xl overflow-hidden flex flex-col justify-between group hover:bg-surface-container/90 transition-all duration-200 cursor-pointer border border-transparent hover:border-primary-container/30"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
          <div className="flex items-center justify-between">
            <span className="font-telemetry-tag text-on-surface-variant uppercase tracking-wider">
              Qualificação Neural
            </span>
            <div className="p-1.5 rounded-lg bg-surface-container-lowest text-primary">
              <Brain className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-space-sm">
            <div className="flex items-baseline gap-space-xs">
              <span className="font-headline-xl text-on-surface tracking-tight">
                {timeframeMetrics.qualRate}
              </span>
              <span className="font-telemetry-tag text-secondary flex items-center font-bold gap-0.5">
                <Zap className="w-3.5 h-3.5" />
                SLA Otimizado
              </span>
            </div>
            <p className="font-body-sm text-on-surface-variant">
              Assertividade com filtros B2B/B2C
            </p>
          </div>
          <div className="mt-space-md p-space-xs rounded-lg bg-surface-container-lowest/80 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Timer className="w-4 h-4 text-primary" />
              <span className="font-telemetry-tag text-on-surface-variant">
                Tempo Médio Resposta
              </span>
            </div>
            <span className="font-label-code text-primary font-bold">
              {timeframeMetrics.avgReply}
            </span>
          </div>
        </div>

        {/* Card 4: Saúde do Conhecimento */}
        <div
          onClick={() => onNavigate('base-de-conhecimento')}
          className="relative bg-surface-container/70 backdrop-blur-xl rounded-xl p-space-md shadow-xl overflow-hidden flex flex-col justify-between group hover:bg-surface-container/90 transition-all duration-200 cursor-pointer border border-transparent hover:border-primary-container/30"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
          <div className="flex items-center justify-between">
            <span className="font-telemetry-tag text-on-surface-variant uppercase tracking-wider">
              Saúde do Conhecimento
            </span>
            <div className="p-1.5 rounded-lg bg-surface-container-lowest text-secondary">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-space-sm">
            <div className="flex items-baseline gap-space-xs">
              <span className="font-headline-xl text-on-surface tracking-tight">
                99.8%
              </span>
              <span className="font-telemetry-tag text-primary">RAG Puro</span>
            </div>
            <p className="font-body-sm text-on-surface-variant">
              Zero alucinação detectada nas últimas 24h
            </p>
          </div>
          <div className="mt-space-md p-space-xs rounded-lg bg-surface-container-lowest/80 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary-container" />
              <span className="font-telemetry-tag text-on-surface-variant">
                Vetores Ativos
              </span>
            </div>
            <span className="font-label-code text-on-surface font-semibold">
              4.120 Embeddings
            </span>
          </div>
        </div>
      </div>

      {/* Row 2: Central Grid (Left 8 Cols: Chart + Agent Squad | Right 4 Cols: Real-Time Stream) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* Left 8 Columns */}
        <div className="lg:col-span-8 flex flex-col gap-space-lg min-w-0">
          {/* Primary Traffic & Channel Chart Card */}
          <div className="bg-surface-container/80 backdrop-blur-xl rounded-xl p-space-md sm:p-space-lg shadow-xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm mb-space-md">
              <div className="flex flex-col">
                <div className="flex items-center gap-space-xs">
                  <span className="font-telemetry-tag text-primary uppercase">
                    Omnichannel Realtime Core
                  </span>
                  <span className="text-outline font-telemetry-tag">•</span>
                  <span className="font-telemetry-tag text-secondary">
                    {timeframeMetrics.peakText}
                  </span>
                </div>
                <h3 className="font-headline-sm text-on-surface tracking-tight">
                  Volume de Tráfego Conversacional
                </h3>
              </div>

              {/* Channel Filter Toggles */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => toggleChannel('wa')}
                  className={`flex items-center gap-1.5 px-space-xs py-1 rounded bg-surface-container-highest text-on-surface font-telemetry-tag transition-opacity ${
                    channelsVisible.wa ? 'opacity-100' : 'opacity-40'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-primary-container shadow-[0_0_6px_#f59e0b]" />
                  WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => toggleChannel('ig')}
                  className={`flex items-center gap-1.5 px-space-xs py-1 rounded bg-surface-container-highest text-on-surface font-telemetry-tag transition-opacity ${
                    channelsVisible.ig ? 'opacity-100' : 'opacity-40'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-[#38bdf8] shadow-[0_0_6px_#38bdf8]" />
                  Instagram Direct
                </button>
                <button
                  type="button"
                  onClick={() => toggleChannel('wb')}
                  className={`flex items-center gap-1.5 px-space-xs py-1 rounded bg-surface-container-highest text-on-surface font-telemetry-tag transition-opacity ${
                    channelsVisible.wb ? 'opacity-100' : 'opacity-40'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-[#c084fc] shadow-[0_0_6px_#c084fc]" />
                  Webchat Live
                </button>
              </div>
            </div>

            {/* Rich SVG Dynamic Multi-Channel Curve */}
            <div className="relative w-full h-64 sm:h-80 bg-surface-container-lowest/90 rounded-lg p-space-sm overflow-hidden flex flex-col justify-between">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-container/10 via-transparent to-transparent pointer-events-none" />
              <svg
                className="w-full h-full overflow-visible"
                preserveAspectRatio="none"
                viewBox="0 0 700 240"
              >
                <defs>
                  <linearGradient id="gradAmber" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="gradCyan" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="gradViolet" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#c084fc" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#c084fc" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Grid Lines */}
                <line
                  stroke="#2a2a2d"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                  x1="0"
                  x2="700"
                  y1="40"
                  y2="40"
                />
                <line
                  stroke="#2a2a2d"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                  x1="0"
                  x2="700"
                  y1="100"
                  y2="100"
                />
                <line
                  stroke="#2a2a2d"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                  x1="0"
                  x2="700"
                  y1="160"
                  y2="160"
                />
                <line
                  stroke="#2a2a2d"
                  strokeWidth="1"
                  x1="0"
                  x2="700"
                  y1="220"
                  y2="220"
                />

                {/* Area 3: Webchat (Violet) */}
                <g
                  style={{
                    opacity: channelsVisible.wb ? 1 : 0.12,
                    transition: 'opacity 200ms',
                  }}
                >
                  <path
                    d="M0,190 C90,180 150,165 220,175 C310,188 380,150 460,160 C550,172 630,140 700,150 L700,230 L0,230 Z"
                    fill="url(#gradViolet)"
                  />
                  <path
                    d="M0,190 C90,180 150,165 220,175 C310,188 380,150 460,160 C550,172 630,140 700,150"
                    fill="none"
                    stroke="#c084fc"
                    strokeWidth="2"
                  />
                </g>

                {/* Area 2: Instagram (Cyan) */}
                <g
                  style={{
                    opacity: channelsVisible.ig ? 1 : 0.12,
                    transition: 'opacity 200ms',
                  }}
                >
                  <path
                    d="M0,140 C110,110 180,145 270,120 C360,95 440,135 520,105 C600,75 660,110 700,85 L700,230 L0,230 Z"
                    fill="url(#gradCyan)"
                  />
                  <path
                    d="M0,140 C110,110 180,145 270,120 C360,95 440,135 520,105 C600,75 660,110 700,85"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2"
                  />
                </g>

                {/* Area 1: WhatsApp (Amber/Gold Dominant) */}
                <g
                  style={{
                    opacity: channelsVisible.wa ? 1 : 0.12,
                    transition: 'opacity 200ms',
                  }}
                >
                  <path
                    d={timeframeMetrics.waPathArea}
                    fill="url(#gradAmber)"
                  />
                  <path
                    d={timeframeMetrics.waPathLine}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2.5"
                  />
                  <circle
                    className="animate-ping"
                    cx="490"
                    cy="30"
                    fill="#f59e0b"
                    r="4"
                    style={{
                      transformOrigin: '490px 30px',
                      animationDuration: '2s',
                    }}
                  />
                  <circle cx="490" cy="30" fill="#f59e0b" r="5" />
                </g>
              </svg>

              {/* Timeline Axis Labels */}
              <div className="flex justify-between items-center text-outline font-telemetry-tag pt-1">
                <span>00:00</span>
                <span>04:00</span>
                <span>08:00</span>
                <span className="text-primary font-bold">12:00 (Pico)</span>
                <span>16:00</span>
                <span>20:00</span>
                <span>Agora</span>
              </div>
            </div>

            {/* Metric Footer Ribbon */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm mt-space-md pt-space-xs">
              <div
                onClick={() => onNavigate('inbox-omnichannel')}
                className="p-space-xs rounded bg-surface-container-lowest/60 hover:bg-surface-container-lowest flex flex-col cursor-pointer transition-colors"
              >
                <span className="font-telemetry-tag text-on-surface-variant">
                  WhatsApp API Volume
                </span>
                <span className="font-label-code text-primary font-bold">
                  {timeframeMetrics.waVol}
                </span>
                <span className="font-body-sm text-outline">
                  73.1% dominância
                </span>
              </div>
              <div
                onClick={() => onNavigate('inbox-omnichannel')}
                className="p-space-xs rounded bg-surface-container-lowest/60 hover:bg-surface-container-lowest flex flex-col cursor-pointer transition-colors"
              >
                <span className="font-telemetry-tag text-on-surface-variant">
                  Instagram Direct Ingest
                </span>
                <span className="font-label-code text-[#38bdf8] font-bold">
                  {timeframeMetrics.igVol}
                </span>
                <span className="font-body-sm text-outline">
                  19.6% engajamento
                </span>
              </div>
              <div
                onClick={() => onNavigate('inbox-omnichannel')}
                className="p-space-xs rounded bg-surface-container-lowest/60 hover:bg-surface-container-lowest flex flex-col cursor-pointer transition-colors"
              >
                <span className="font-telemetry-tag text-on-surface-variant">
                  Webchat Transcripts
                </span>
                <span className="font-label-code text-[#c084fc] font-bold">
                  {timeframeMetrics.wbVol}
                </span>
                <span className="font-body-sm text-outline">
                  7.3% alta conversão
                </span>
              </div>
            </div>
          </div>

          {/* Agent Squad Performance Deck */}
          <div className="bg-surface-container/80 backdrop-blur-xl rounded-xl p-space-md sm:p-space-lg shadow-xl flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <div className="flex items-center gap-space-xs">
                  <span className="font-telemetry-tag text-secondary uppercase">
                    Especialistas Neurais Ativos
                  </span>
                </div>
                <h3 className="font-headline-sm text-on-surface tracking-tight">
                  Performance dos Agentes IA
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('cerebro-automacao')}
                className="font-telemetry-tag text-primary bg-primary-container/10 hover:bg-primary-container/20 px-space-sm py-1 rounded-full transition-colors flex items-center gap-1"
              >
                <span>{agents.length} Agentes em Produção</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
              {agents.map((ag, idx) => (
                <div
                  key={ag.id}
                  onClick={() => onNavigate('cerebro-automacao')}
                  className="bg-surface-container-lowest/80 p-space-md rounded-lg flex flex-col justify-between hover:bg-surface-container-low transition-colors duration-150 cursor-pointer border border-transparent hover:border-primary-container/30"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="font-title-md text-on-surface font-semibold">
                        {ag.name}
                      </span>
                      <span
                        className={`w-2 h-2 rounded-full bg-secondary-container ${
                          idx < 2 ? 'animate-pulse' : ''
                        }`}
                      />
                    </div>
                    <span className="font-telemetry-tag text-outline">
                      {ag.role}
                    </span>
                  </div>
                  <div className="my-space-sm flex flex-col gap-1">
                    <div className="flex justify-between items-center font-telemetry-tag">
                      <span className="text-on-surface-variant">
                        {ag.metricLabel}
                      </span>
                      <span
                        className={`${
                          idx === 1 ? 'text-secondary' : 'text-primary'
                        } font-bold`}
                      >
                        {ag.metricValue}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          idx === 1 ? 'bg-secondary' : 'bg-primary-container'
                        }`}
                        style={{ width: `${ag.metricValue}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between font-label-code text-outline pt-space-xs">
                    <span>{ag.volumeLabel}</span>
                    <span
                      className={idx === 1 ? 'text-secondary' : 'text-primary'}
                    >
                      {ag.secondaryLabel}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 4 Columns: Real-Time AI Action Stream */}
        <div className="lg:col-span-4 bg-surface-container/80 backdrop-blur-xl rounded-xl p-space-md sm:p-space-lg shadow-xl flex flex-col h-[680px] lg:h-[740px]">
          <div className="flex items-center justify-between pb-space-md">
            <div className="flex items-center gap-space-xs">
              <div className="p-1.5 rounded bg-primary-container/20 text-primary">
                <Radio className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <h3 className="font-title-md text-on-surface font-semibold">
                  Feed de Ações da IA
                </h3>
                <span className="font-telemetry-tag text-on-surface-variant">
                  Real-time Autonomous Stream
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onSimulateEvent}
              className="flex items-center gap-1 font-telemetry-tag text-secondary bg-surface-container-highest hover:bg-surface-bright px-2.5 py-1 rounded-full transition-colors"
              title="Simular novo evento autônomo"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-secondary-container animate-ping" />
              Live
            </button>
          </div>

          {/* Scrollable Stream Container */}
          <div className="flex flex-col gap-space-sm overflow-y-auto pr-1 flex-1 -mr-1 thin-scrollbar">
            {streamEvents.map((ev) => {
              const dotColor =
                ev.categoryColor === 'gold'
                  ? 'bg-secondary-container'
                  : ev.categoryColor === 'cyan'
                  ? 'bg-[#38bdf8]'
                  : ev.categoryColor === 'slate'
                  ? 'bg-outline'
                  : 'bg-primary-container';

              const textColor =
                ev.categoryColor === 'gold'
                  ? 'text-secondary'
                  : ev.categoryColor === 'cyan'
                  ? 'text-[#38bdf8]'
                  : ev.categoryColor === 'slate'
                  ? 'text-outline'
                  : 'text-primary';

              return (
                <div
                  key={ev.id}
                  onClick={() => {
                    if (ev.targetTab) {
                      onNavigate(ev.targetTab, ev.linkedLeadId);
                    }
                  }}
                  className="p-space-sm rounded-lg bg-surface-container-lowest/90 hover:bg-surface-container-low transition-colors duration-150 flex flex-col gap-1.5 cursor-pointer border border-transparent hover:border-surface-container-highest"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                      <span
                        className={`font-telemetry-tag ${textColor} uppercase font-bold`}
                      >
                        {ev.category}
                      </span>
                    </div>
                    <span className="font-telemetry-tag text-outline">
                      {ev.timeAgo}
                    </span>
                  </div>
                  <p className="font-body-md text-on-surface">
                    {ev.description}
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-label-code text-on-surface-variant bg-surface-container-high px-1.5 py-0.5 rounded">
                      {ev.tag}
                    </span>
                    {ev.category === 'Venda Autônoma' ? (
                      <CheckCircle2 className="w-4 h-4 text-secondary" />
                    ) : ev.category === 'Handover Humano' ? (
                      <Headphones className="w-4 h-4 text-outline" />
                    ) : ev.category === 'Cadência Ativa' ? (
                      <Megaphone className="w-4 h-4 text-outline" />
                    ) : ev.category === 'Lead Scoring' ? (
                      <TrendingUp className="w-4 h-4 text-outline" />
                    ) : (
                      <MessageSquare className="w-4 h-4 text-outline" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Action on Feed Bottom */}
          <div className="pt-space-sm mt-auto">
            <button
              type="button"
              onClick={() => setAuditModalOpen(true)}
              className="w-full py-2.5 px-space-md rounded-lg bg-surface-container-high/80 text-on-surface font-telemetry-tag text-center hover:bg-surface-variant transition-colors flex items-center justify-center gap-space-xs"
            >
              <span>Abrir Trilha de Auditoria Neural Completa</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Row 2.5: Atalhos Visuais de Telas HTML & Links Diretos */}
      <div className="bg-surface-container/60 backdrop-blur-xl rounded-xl p-space-md border border-surface-container-high/60 flex flex-col gap-space-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-primary" />
            <span className="font-telemetry-tag text-primary uppercase">
              Navegação Visual Rápida & Links Diretos de Imagens HTML
            </span>
          </div>
          <button
            type="button"
            onClick={() => onEditAsset('brand_logo')}
            className="font-telemetry-tag text-on-surface-variant hover:text-primary flex items-center gap-1 transition-colors self-start sm:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>Configurar Links de Imagens HTML</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
          {screenShortcuts.map((sc) => (
            <div
              key={sc.key}
              onClick={() => {
                if (sc.linkedTab) onNavigate(sc.linkedTab, sc.linkedLeadId);
              }}
              className="group p-2.5 rounded-lg bg-surface-container-lowest/80 hover:bg-surface-container-high/80 border border-surface-container-high hover:border-primary-container/40 transition-all cursor-pointer flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <EditableImage
                  assetKey={sc.key}
                  assets={assets}
                  fallbackText={sc.label}
                  className="w-11 h-11 rounded-lg object-cover border border-primary-container/20"
                  onEditAsset={onEditAsset}
                />
                <div className="min-w-0">
                  <h4 className="font-body-sm text-on-surface font-semibold truncate group-hover:text-primary transition-colors">
                    {sc.label}
                  </h4>
                  <span className="font-telemetry-tag text-[10px] text-outline flex items-center gap-1">
                    <span>Abrir módulo: {sc.linkedTab}</span>
                  </span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-outline group-hover:text-primary shrink-0 transition-colors" />
            </div>
          ))}
        </div>
      </div>

      {/* Row 3: Rodapé de Status Rápido & Consumo de Infraestrutura */}
      <div className="bg-surface-container/70 backdrop-blur-xl rounded-xl p-space-md shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
        <div
          onClick={() => onNavigate('conexoes-whatsapp')}
          className="flex items-center gap-space-md flex-1 cursor-pointer group"
        >
          <div className="p-2.5 rounded-lg bg-surface-container-lowest flex items-center justify-center text-primary group-hover:bg-primary-container/20 transition-colors">
            <RadioTower className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-space-xs flex-wrap">
              <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse" />
              <span className="font-title-md text-on-surface font-semibold">
                WhatsApp Cloud API (Meta Cloud)
              </span>
              <span className="font-telemetry-tag text-secondary font-bold ml-1">
                ONLINE
              </span>
            </div>
            <div className="flex items-center gap-space-sm flex-wrap font-label-code text-on-surface-variant mt-0.5">
              <span>
                Latência Média:{' '}
                <span className="text-primary font-bold">142ms</span>
              </span>
              <span>•</span>
              <span>
                SLA Webhook: <span className="text-primary">99.99%</span>
              </span>
              <span>•</span>
              <span>
                Throughput: <span className="text-on-surface">48 msg/s</span>
              </span>
            </div>
          </div>
        </div>

        <div className="hidden lg:block w-px h-10 bg-surface-container-highest" />

        <div className="flex flex-col sm:flex-row sm:items-center gap-space-md flex-1 justify-end">
          <div className="flex flex-col gap-1 sm:w-48">
            <div className="flex items-center justify-between font-telemetry-tag">
              <span className="text-on-surface-variant">
                Gemini 3.8 Flash Quota
              </span>
              <span className="text-primary font-bold">68.4%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
              <div
                className="h-full bg-primary-container rounded-full"
                style={{ width: '68.4%' }}
              />
            </div>
            <span className="font-telemetry-tag text-outline">
              820k / 1.2M tokens hoje
            </span>
          </div>

          <div className="flex flex-col gap-1 sm:w-48">
            <div className="flex items-center justify-between font-telemetry-tag">
              <span className="text-on-surface-variant">
                Embeddings RAG Core
              </span>
              <span className="text-secondary font-bold">42.1%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
              <div
                className="h-full bg-secondary rounded-full"
                style={{ width: '42.1%' }}
              />
            </div>
            <span className="font-telemetry-tag text-outline">
              505k / 1.2M tokens hoje
            </span>
          </div>
        </div>
      </div>

      {/* Audit Trail Modal */}
      {auditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-surface-container-low border border-surface-container-highest rounded-xl w-full max-w-3xl max-h-[82vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="px-5 py-4 bg-surface-container flex items-center justify-between border-b border-surface-container-highest">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <div>
                  <h3 className="font-headline-sm text-on-surface font-semibold">
                    Trilha de Auditoria & Segurança Neural Completa
                  </h3>
                  <p className="font-telemetry-tag text-outline">
                    TLS 1.3 • AES-256 • ZERO HALLUCINATION GUARDRAILS
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAuditModalOpen(false)}
                className="p-1.5 rounded-lg bg-surface-container-high text-on-surface-variant hover:text-on-surface"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto space-y-3 thin-scrollbar">
              {streamEvents.map((ev, i) => (
                <div
                  key={ev.id}
                  className="p-3.5 rounded-lg bg-surface-container-lowest border border-surface-container-high flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-label-code text-xs text-primary">
                        #AUDIT-{9940 - i}
                      </span>
                      <span className="font-telemetry-tag text-on-surface-variant uppercase">
                        {ev.category}
                      </span>
                      <span className="font-telemetry-tag text-outline">
                        • {ev.timeAgo}
                      </span>
                    </div>
                    <p className="font-body-sm text-on-surface">
                      {ev.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-label-code text-xs px-2 py-1 rounded bg-surface-container-high text-secondary">
                      {ev.tag}
                    </span>
                    {ev.targetTab && (
                      <button
                        type="button"
                        onClick={() => {
                          setAuditModalOpen(false);
                          onNavigate(ev.targetTab!, ev.linkedLeadId);
                        }}
                        className="px-2.5 py-1 rounded bg-primary-container text-on-primary font-telemetry-tag text-[10px] font-bold"
                      >
                        Inspecionar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
