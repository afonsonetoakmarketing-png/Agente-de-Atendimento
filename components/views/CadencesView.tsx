'use client';

import React, { useState } from 'react';
import {
  GitBranch,
  Sparkles,
  Send,
  Clock,
  CheckCircle2,
  Plus,
  MessageSquare,
  Camera,
} from 'lucide-react';
import { CadenceSequence, ChannelType } from '@/lib/types';

interface CadencesViewProps {
  cadences: CadenceSequence[];
  onAddCadenceStep: (
    cadenceId: string,
    step: { day: string; title: string; template: string; delay: string }
  ) => void;
}

export default function CadencesView({
  cadences,
  onAddCadenceStep,
}: CadencesViewProps) {
  const [selectedId, setSelectedId] = useState(cadences[0]?.id);
  const activeCadence =
    cadences.find((c) => c.id === selectedId) || cadences[0];

  const [aiObjective, setAiObjective] = useState(
    'Reativar lead B2B que pediu proposta há 3 dias oferecendo diagnóstico gratuito de integração ERP'
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedHook, setGeneratedHook] = useState<{
    stepTitle: string;
    messageTemplate: string;
    expectedCtr: string;
  } | null>(null);
  const [dispatchedToast, setDispatchedToast] = useState(false);

  const handleGenerateHook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiObjective.trim() || isGenerating) return;
    setIsGenerating(true);
    try {
      const res = await fetch('/api/aetheris-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'cadence_generator',
          payload: {
            objective: aiObjective,
            channel: activeCadence.channel,
            audience: activeCadence.targetAudience,
          },
        }),
      });
      const data = await res.json();
      if (data.messageTemplate) {
        setGeneratedHook(data);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAppendStep = () => {
    if (!generatedHook) return;
    onAddCadenceStep(activeCadence.id, {
      day: `D+${activeCadence.steps.length + 2}`,
      title: generatedHook.stepTitle,
      template: generatedHook.messageTemplate,
      delay: 'Automático IA',
    });
    setGeneratedHook(null);
  };

  return (
    <div className="flex flex-col w-full gap-space-lg pb-space-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse" />
            <span className="font-telemetry-tag text-primary uppercase">
              Motor de Reengajamento Autônomo // Cadence Engine
            </span>
          </div>
          <h2 className="font-headline-lg text-on-surface mt-0.5">
            Cadências & Remarketing Inteligente
          </h2>
          <p className="font-body-sm text-on-surface-variant">
            Sequências multi-etapa (D+0 a D+7) com ganchos hiper-personalizados por IA para recuperação de leads frios.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setDispatchedToast(true);
            setTimeout(() => setDispatchedToast(false), 2500);
          }}
          className="self-start md:self-auto px-5 py-2.5 rounded-lg bg-primary-container text-on-primary font-headline-sm text-body-sm font-bold shadow-[0_0_15px_rgba(245,158,11,0.35)] hover:brightness-110 transition-all flex items-center gap-2"
        >
          {dispatchedToast ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Lote Disparado para {activeCadence.activeLeads} Leads!</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Disparar Lote de Recuperação Agora</span>
            </>
          )}
        </button>
      </div>

      {/* Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
        {cadences.map((cad) => (
          <div
            key={cad.id}
            onClick={() => setSelectedId(cad.id)}
            className={`p-space-md rounded-xl cursor-pointer transition-all border ${
              cad.id === activeCadence.id
                ? 'bg-surface-container-high/90 border-primary-container shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                : 'bg-surface-container/60 border-surface-container-high hover:bg-surface-container'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {cad.channel === 'whatsapp' ? (
                  <MessageSquare className="w-4 h-4 text-[#25D366]" />
                ) : (
                  <Camera className="w-4 h-4 text-[#E1306C]" />
                )}
                <h3 className="font-title-md text-on-surface font-semibold">
                  {cad.name}
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-secondary-container/20 text-secondary font-telemetry-tag font-bold">
                Conversão: {cad.conversionRate}
              </span>
            </div>
            <p className="font-body-sm text-on-surface-variant mb-3">
              Público: {cad.targetAudience}
            </p>
            <div className="flex items-center justify-between font-label-code text-xs text-outline pt-2 border-t border-surface-variant">
              <span>{cad.steps.length} Etapas Configuradas</span>
              <span className="text-primary font-bold">
                {cad.activeLeads} Leads Ativos na Fila
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Split: Steps Timeline + Gemini Hook Generator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        <div className="lg:col-span-7 bg-surface-container/80 backdrop-blur-xl rounded-xl p-space-md sm:p-space-lg border border-surface-container-high space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-primary" />
              <h3 className="font-headline-sm text-on-surface">
                Linha do Tempo da Cadência ({activeCadence.steps.length} Passos)
              </h3>
            </div>
            <span className="font-telemetry-tag text-outline uppercase">
              Pausa automática se o lead responder
            </span>
          </div>

          <div className="space-y-3">
            {activeCadence.steps.map((st, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container-highest flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-primary-container text-on-primary font-telemetry-tag font-bold">
                      {st.day}
                    </span>
                    <span className="font-title-md text-on-surface font-semibold">
                      {st.title}
                    </span>
                  </div>
                  <span className="font-label-code text-xs text-outline flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    {st.delay}
                  </span>
                </div>
                <p className="font-body-md text-on-surface-variant bg-surface-container/60 p-3 rounded-lg border border-surface-container-high">
                  {st.template}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right 5 Cols: Gemini Cadence Generator */}
        <div className="lg:col-span-5 bg-surface-container/80 backdrop-blur-xl rounded-xl p-space-md sm:p-space-lg border border-primary-container/30 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <h3 className="font-title-md text-on-surface font-semibold">
                Gerador Neural de Ganchos (Gemini IA)
              </h3>
            </div>
            <p className="font-body-sm text-on-surface-variant">
              Descreva o objetivo do follow-up e a IA criará um template persuasivo com variáveis dinâmicas para adicionar à sequência.
            </p>
            <form onSubmit={handleGenerateHook} className="space-y-3">
              <textarea
                rows={3}
                value={aiObjective}
                onChange={(e) => setAiObjective(e.target.value)}
                className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-lg p-3 font-body-sm text-on-surface focus:outline-none focus:border-primary-container"
              />
              <button
                type="submit"
                disabled={isGenerating}
                className="w-full py-2.5 rounded-lg bg-primary-container text-on-primary font-headline-sm text-body-sm font-bold flex items-center justify-center gap-2 hover:brightness-110 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {isGenerating
                    ? 'Sintetizando Gancho Comercial...'
                    : 'Gerar Etapa de Cadência com IA'}
                </span>
              </button>
            </form>
          </div>

          {generatedHook && (
            <div className="p-4 rounded-xl bg-surface-container-lowest border border-primary-container/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-title-md text-primary font-semibold">
                  {generatedHook.stepTitle}
                </span>
                <span className="font-telemetry-tag text-secondary">
                  CTR Est.: {generatedHook.expectedCtr}
                </span>
              </div>
              <p className="font-body-sm text-on-surface bg-surface-container p-2.5 rounded">
                {generatedHook.messageTemplate}
              </p>
              <button
                type="button"
                onClick={handleAppendStep}
                className="w-full py-2 rounded-lg bg-secondary-container text-on-secondary font-telemetry-tag font-bold flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Anexar Passo à Cadência Ativa</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
