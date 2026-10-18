'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  Zap,
  RefreshCw,
  Terminal,
  Link2,
  QrCode,
  Smartphone,
  ShieldCheck,
  Radio,
  Bot,
  KeyRound,
  Copy,
  Check,
  Megaphone,
} from 'lucide-react';
import {
  AgentSpecialist,
  FunnelPipelineType,
  GeneralSystemConfig,
  IntegrationConnector,
} from '@/lib/types';

interface IntegrationsViewProps {
  integrations: IntegrationConnector[];
  agents: AgentSpecialist[];
  generalConfig: GeneralSystemConfig;
  onUpdateGeneralConfig: (updated: GeneralSystemConfig) => void;
  onOpenImageManager: () => void;
}

export default function IntegrationsView({
  integrations,
  agents,
  generalConfig,
  onUpdateGeneralConfig,
  onOpenImageManager,
}: IntegrationsViewProps) {
  const [testingId, setTestingId] = useState<string | null>(null);
  const [pingMessage, setPingMessage] = useState<string | null>(null);

  // WhatsApp QR Code Session state
  const [qrStatus, setQrStatus] = useState<'connected' | 'waiting_scan'>(
    'connected'
  );
  const [qrSeed, setQrSeed] = useState<number>(2026);
  const [selectedQrAgentId, setSelectedQrAgentId] = useState<string>(
    agents[0]?.id || 'agent-qualifier'
  );
  const [qrDefaultPipeline, setQrDefaultPipeline] =
    useState<FunnelPipelineType>('prospeccao_outbound');

  // Official WhatsApp Cloud API state
  const [phoneId, setPhoneId] = useState(
    generalConfig.whatsappOfficialPhoneId
  );
  const [wabaId, setWabaId] = useState(generalConfig.whatsappOfficialWabaId);
  const [verifyToken, setVerifyToken] = useState(
    generalConfig.whatsappWebhookVerifyToken
  );
  const [cloudAgentId, setCloudAgentId] = useState<string>(
    agents[1]?.id || agents[0]?.id || 'agent-closer'
  );
  const [cloudDefaultPipeline, setCloudDefaultPipeline] =
    useState<FunnelPipelineType>('trafego_inbound');
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  const handleTestWebhook = (conn: IntegrationConnector) => {
    setTestingId(conn.id);
    setTimeout(() => {
      setTestingId(null);
      setPingMessage(
        `Conexão verificada (200 OK) com ${conn.name} • Latência ${conn.latency}`
      );
      setTimeout(() => setPingMessage(null), 3200);
    }, 500);
  };

  const handleGenerateNewQr = () => {
    setQrStatus('waiting_scan');
    setQrSeed(Math.floor(1000 + Math.random() * 9000));
  };

  const handleSimulateQrScan = () => {
    setQrStatus('connected');
    setPingMessage(
      'Aparelho WhatsApp pareado via QR Code com sucesso! Agente de IA assumiu o atendimento.'
    );
    setTimeout(() => setPingMessage(null), 3500);
  };

  const handleSaveCloudApi = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateGeneralConfig({
      ...generalConfig,
      whatsappOfficialPhoneId: phoneId,
      whatsappOfficialWabaId: wabaId,
      whatsappWebhookVerifyToken: verifyToken,
    });
    setPingMessage(
      'Credenciais da API Oficial do WhatsApp (Meta Cloud) salvas e sincronizadas com o Agente de IA!'
    );
    setTimeout(() => setPingMessage(null), 3500);
  };

  const handleCopyWebhook = () => {
    navigator.clipboard?.writeText(
      'https://api.aetheris.ai/v4/webhooks/whatsapp-omnichannel'
    );
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  return (
    <div className="flex flex-col w-full gap-space-lg pb-space-xl">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse" />
            <span className="font-telemetry-tag text-primary uppercase">
              Central de Conexões Omnichannel // WhatsApp QR Code, Cloud API & Tráfego Pago
            </span>
          </div>
          <h2 className="font-headline-lg text-on-surface mt-0.5">
            Conexões & Integração do WhatsApp com Agente de IA
          </h2>
          <p className="font-body-sm text-on-surface-variant">
            Conecte seus números de WhatsApp via QR Code ou API Oficial da Meta, vincule qual Agente de IA responderá em cada canal e defina para qual funil (Prospecção ou Tráfego Pago/Orgânico) os leads serão enviados.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenImageManager}
          className="self-start md:self-auto px-4 py-2.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-headline-sm text-xs font-bold border border-primary-container/30 transition-all flex items-center gap-2"
        >
          <Link2 className="w-4 h-4 text-primary" />
          <span>Links Diretos de Imagens HTML</span>
        </button>
      </div>

      {pingMessage && (
        <div className="p-3.5 rounded-xl bg-primary-container/15 border border-primary-container text-primary font-label-code text-sm flex items-center gap-2 shadow-lg">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{pingMessage}</span>
        </div>
      )}

      {/* =====================================================================
          ROW 1: WHATSAPP QR CODE + WHATSAPP CLOUD API OFICIAL
      ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* Card 1 (6 Cols): Conexão Rápida via QR Code WhatsApp */}
        <div className="lg:col-span-6 bg-surface-container/80 backdrop-blur-xl rounded-xl p-space-md sm:p-space-lg border border-surface-container-high flex flex-col justify-between gap-5 shadow-xl">
          <div className="flex items-start justify-between gap-3 border-b border-surface-container-highest pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-lg bg-primary-container/20 text-primary">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-headline-sm text-on-surface">
                  1. WhatsApp Web / Pareamento via QR Code
                </h3>
                <p className="font-telemetry-tag text-outline">
                  Ideal para Prospecção Ativa e Atendimento Rápido
                </p>
              </div>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full font-telemetry-tag text-[10px] font-bold flex items-center gap-1.5 ${
                qrStatus === 'connected'
                  ? 'bg-secondary-container/20 text-secondary'
                  : 'bg-primary-container/20 text-primary'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
              {qrStatus === 'connected'
                ? 'SESSÃO CONECTADA'
                : 'AGUARDANDO LEITURA'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            {/* Simulated Interactive QR Code Box */}
            <div className="sm:col-span-5 flex flex-col items-center justify-center p-4 rounded-xl bg-surface-container-lowest border border-surface-container-highest">
              <div className="w-36 h-36 bg-white p-2.5 rounded-lg shadow-inner flex flex-col justify-between relative">
                {/* Deterministic visual QR grid */}
                <div className="grid grid-cols-7 grid-rows-7 gap-1 w-full h-full">
                  {Array.from({ length: 49 }).map((_, idx) => {
                    const isCorner =
                      idx < 2 ||
                      idx === 6 ||
                      idx === 7 ||
                      idx === 13 ||
                      idx > 41;
                    const filled = isCorner || (idx * qrSeed) % 3 === 0;
                    return (
                      <div
                        key={idx}
                        className={`rounded-[1px] ${
                          filled ? 'bg-[#121316]' : 'bg-transparent'
                        }`}
                      />
                    );
                  })}
                </div>
                {qrStatus === 'connected' && (
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-[2px] rounded-lg flex flex-col items-center justify-center p-2 text-center">
                    <CheckCircle2 className="w-8 h-8 text-secondary mb-1" />
                    <span className="font-telemetry-tag text-[10px] text-white font-bold">
                      APARELHO PAREADO
                    </span>
                    <span className="font-label-code text-[10px] text-primary mt-0.5">
                      +55 (11) 98800-1000
                    </span>
                  </div>
                )}
              </div>
              <span className="font-label-code text-[10px] text-outline mt-2">
                Instância #{qrSeed} • Bateria 94%
              </span>
            </div>

            {/* Right controls for QR Instance */}
            <div className="sm:col-span-7 space-y-3">
              <div className="space-y-1">
                <label className="font-telemetry-tag text-[10px] text-on-surface-variant uppercase block">
                  Agente de IA Responsável por Este WhatsApp
                </label>
                <select
                  value={selectedQrAgentId}
                  onChange={(e) => setSelectedQrAgentId(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary-container"
                >
                  {agents.map((ag) => (
                    <option key={ag.id} value={ag.id}>
                      {ag.name} ({ag.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-telemetry-tag text-[10px] text-on-surface-variant uppercase block">
                  Funil Destino dos Leads Desta Conexão
                </label>
                <select
                  value={qrDefaultPipeline}
                  onChange={(e) =>
                    setQrDefaultPipeline(e.target.value as FunnelPipelineType)
                  }
                  className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-lg px-3 py-2 text-xs text-primary font-bold focus:outline-none focus:border-primary-container"
                >
                  <option value="prospeccao_outbound">
                    Funil 1: Prospecção Ativa (Outbound)
                  </option>
                  <option value="trafego_inbound">
                    Funil 2: Tráfego Pago & Orgânico (Inbound)
                  </option>
                </select>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleGenerateNewQr}
                  className="flex-1 py-2 px-3 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-telemetry-tag text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-primary" />
                  <span>Gerar Novo QR Code</span>
                </button>
                {qrStatus === 'waiting_scan' && (
                  <button
                    type="button"
                    onClick={handleSimulateQrScan}
                    className="flex-1 py-2 px-3 rounded-lg bg-primary-container text-on-primary font-headline-sm text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Simular Leitura Celular</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Card 2 (6 Cols): WhatsApp Cloud API Oficial (Meta Business) */}
        <form
          onSubmit={handleSaveCloudApi}
          className="lg:col-span-6 bg-surface-container/80 backdrop-blur-xl rounded-xl p-space-md sm:p-space-lg border border-surface-container-high flex flex-col justify-between gap-4 shadow-xl"
        >
          <div className="flex items-start justify-between gap-3 border-b border-surface-container-highest pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-lg bg-secondary-container/20 text-secondary">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-headline-sm text-on-surface">
                  2. WhatsApp Cloud API Oficial (Meta Graph v21.0)
                </h3>
                <p className="font-telemetry-tag text-outline">
                  Recomendado para Alto Volume de Tráfego Pago (Click-to-WhatsApp)
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-secondary-container/20 text-secondary font-telemetry-tag text-[10px] font-bold">
              API OFICIAL ATIVA
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-telemetry-tag text-[10px] text-on-surface-variant uppercase block">
                Identificação do Número (Phone Number ID)
              </label>
              <input
                type="text"
                value={phoneId}
                onChange={(e) => setPhoneId(e.target.value)}
                className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-lg px-3 py-1.5 font-label-code text-xs text-on-surface focus:outline-none focus:border-primary-container"
              />
            </div>
            <div className="space-y-1">
              <label className="font-telemetry-tag text-[10px] text-on-surface-variant uppercase block">
                ID da Conta WhatsApp Business (WABA ID)
              </label>
              <input
                type="text"
                value={wabaId}
                onChange={(e) => setWabaId(e.target.value)}
                className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-lg px-3 py-1.5 font-label-code text-xs text-on-surface focus:outline-none focus:border-primary-container"
              />
            </div>
            <div className="space-y-1">
              <label className="font-telemetry-tag text-[10px] text-on-surface-variant uppercase block">
                Agente de IA Escalado na API Oficial
              </label>
              <select
                value={cloudAgentId}
                onChange={(e) => setCloudAgentId(e.target.value)}
                className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-lg px-2.5 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary-container"
              >
                {agents.map((ag) => (
                  <option key={ag.id} value={ag.id}>
                    {ag.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-telemetry-tag text-[10px] text-on-surface-variant uppercase block">
                Funil Destino (Tráfego Pago / Orgânico)
              </label>
              <select
                value={cloudDefaultPipeline}
                onChange={(e) =>
                  setCloudDefaultPipeline(e.target.value as FunnelPipelineType)
                }
                className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-lg px-2.5 py-1.5 text-xs text-secondary font-bold focus:outline-none focus:border-primary-container"
              >
                <option value="trafego_inbound">
                  Funil 2: Tráfego Pago & Orgânico (Inbound)
                </option>
                <option value="prospeccao_outbound">
                  Funil 1: Prospecção Ativa (Outbound)
                </option>
              </select>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-surface-container-lowest border border-surface-container-high flex items-center justify-between gap-2">
            <div className="min-w-0">
              <span className="font-telemetry-tag text-[9px] text-outline uppercase block">
                URL de Callback do Webhook (Meta Developers)
              </span>
              <span className="font-label-code text-xs text-primary truncate block">
                https://api.aetheris.ai/v4/webhooks/whatsapp-omnichannel
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopyWebhook}
              className="px-2.5 py-1.5 rounded bg-surface-container-high hover:bg-surface-bright text-on-surface font-telemetry-tag text-[10px] flex items-center gap-1 shrink-0"
            >
              {copiedWebhook ? (
                <>
                  <Check className="w-3.5 h-3.5 text-secondary" />
                  <span>Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar URL</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-1.5 font-telemetry-tag text-[10px] text-on-surface-variant">
              <KeyRound className="w-3.5 h-3.5 text-primary" />
              <span>Verify Token: {verifyToken}</span>
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-primary-container text-on-primary font-headline-sm text-xs font-bold hover:brightness-110 transition-all"
            >
              Salvar & Validar Webhook Oficial
            </button>
          </div>
        </form>
      </div>

      {/* =====================================================================
          ROW 2: TODOS OS CONECTORES OMNICHANNEL, TRÁFEGO PAGO & PAGAMENTOS
      ===================================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
        {integrations.map((conn) => (
          <div
            key={conn.id}
            className="p-space-md sm:p-space-lg rounded-xl bg-surface-container/80 backdrop-blur-xl border border-surface-container-high flex flex-col justify-between gap-4 shadow-xl"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-telemetry-tag text-outline uppercase flex items-center gap-1.5">
                  {conn.category === 'ERP & CRM' ? (
                    <Megaphone className="w-3.5 h-3.5 text-primary" />
                  ) : (
                    <Radio className="w-3.5 h-3.5 text-secondary" />
                  )}
                  {conn.category}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-secondary-container/20 text-secondary font-telemetry-tag text-[10px] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary-container animate-pulse" />
                  {conn.status.toUpperCase()} • {conn.latency}
                </span>
              </div>
              <h3 className="font-headline-sm text-on-surface">{conn.name}</h3>
              <p className="font-body-sm text-on-surface-variant">
                {conn.description}
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-surface-container-lowest border border-surface-container-high flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Terminal className="w-4 h-4 text-primary shrink-0" />
                <span className="font-label-code text-xs text-outline truncate">
                  {conn.webhookUrl}
                </span>
              </div>
              <span className="font-label-code text-xs text-primary shrink-0">
                {conn.throughput}
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-surface-container-highest">
              <span className="font-telemetry-tag text-on-surface-variant flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5 text-primary" />
                <span>{conn.phoneOrHandle || 'Sincronização Bidirecional'}</span>
              </span>
              <button
                type="button"
                onClick={() => handleTestWebhook(conn)}
                className="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-telemetry-tag text-xs flex items-center gap-1.5 transition-colors"
              >
                {testingId === conn.id ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 text-primary animate-spin" />
                    <span>Verificando...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 text-primary" />
                    <span>Testar Conexão</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
