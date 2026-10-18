'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Link2,
  ExternalLink,
  Check,
  RotateCcw,
  Plus,
  Compass,
  Image as ImageIcon,
  Layers,
  Sparkles,
} from 'lucide-react';
import { ImageAssetConfig, Lead, NavigationTab } from '@/lib/types';

interface ImageLinkModalProps {
  isOpen: boolean;
  selectedKey: string | null;
  assets: Record<string, ImageAssetConfig>;
  leads: Lead[];
  onClose: () => void;
  onSaveAsset: (key: string, updated: ImageAssetConfig) => void;
  onResetAssets: () => void;
  onNavigate: (tab: NavigationTab, leadId?: string) => void;
}

const TAB_LABELS: { id: NavigationTab; label: string }[] = [
  { id: 'dashboard', label: '01. Dashboard Executivo' },
  { id: 'inbox-omnichannel', label: '02. Conversas (Inbox Omnichannel)' },
  { id: 'conexoes-whatsapp', label: '03. Conexões (WhatsApp & Canais)' },
  { id: 'cerebro-automacao', label: '04. Agente de IA & Fluxo Sentimento' },
  { id: 'crm-funil', label: '05. CRM & Funis (8 Estágios)' },
  { id: 'cadencias-remarketing', label: '06. Cadências & Remarketing' },
  { id: 'base-de-conhecimento', label: '07. Base de Conhecimento (RAG)' },
  { id: 'configuracoes-gerais', label: '08. Configurações Gerais & WhatsApp' },
];

export default function ImageLinkModal({
  isOpen,
  selectedKey,
  assets,
  leads,
  onClose,
  onSaveAsset,
  onResetAssets,
  onNavigate,
}: ImageLinkModalProps) {
  const [activeKey, setActiveKey] = useState<string>(
    selectedKey || 'brand_logo'
  );
  const [filterCat, setFilterCat] = useState<
    'all' | 'brand' | 'operator' | 'lead' | 'screen_html'
  >('all');
  const [formUrl, setFormUrl] = useState('');
  const [formLabel, setFormLabel] = useState('');
  const [formAlt, setFormAlt] = useState('');
  const [formTab, setFormTab] = useState<NavigationTab>('dashboard');
  const [formLeadId, setFormLeadId] = useState<string>('');
  const [savedToast, setSavedToast] = useState(false);

  // For creating a new custom HTML image link slot
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');

  useEffect(() => {
    if (selectedKey && assets[selectedKey]) {
      setActiveKey(selectedKey);
      setIsAddingNew(false);
    }
  }, [selectedKey, assets]);

  useEffect(() => {
    const current = assets[activeKey];
    if (current && !isAddingNew) {
      setFormUrl(current.url);
      setFormLabel(current.label);
      setFormAlt(current.alt);
      setFormTab(current.linkedTab || 'dashboard');
      setFormLeadId(current.linkedLeadId || '');
    }
  }, [activeKey, assets, isAddingNew]);

  if (!isOpen) return null;

  const assetList = Object.values(assets).filter((a) =>
    filterCat === 'all' ? true : a.category === filterCat
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const targetKey = isAddingNew
      ? `custom_html_${Date.now()}`
      : activeKey;

    const updated: ImageAssetConfig = {
      key: targetKey,
      label: formLabel.trim() || newKeyName.trim() || 'Ativo Visual HTML',
      category: isAddingNew
        ? 'screen_html'
        : assets[activeKey]?.category || 'screen_html',
      url: formUrl.trim(),
      alt: formAlt.trim() || formLabel.trim(),
      linkedTab: formTab,
      linkedLeadId: formLeadId || undefined,
    };

    onSaveAsset(targetKey, updated);
    setActiveKey(targetKey);
    setIsAddingNew(false);
    setNewKeyName('');
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2200);
  };

  const startNewSlot = () => {
    setIsAddingNew(true);
    setFormLabel('Nova Tela / Imagem HTML');
    setFormUrl('https://lh3.googleusercontent.com/aida-public/AB6AXuDw7hiXkoT9dmYKBvSvqKDd1wbVFZOdADfopT3ycdwJF_01DhScTSmonv5DcgKUOjXhlOCJppKzvOzsm9nFuNWWBr5Y3c1Ry3jP5ZxPLPVTx0nEUYtpUL8daT9O3GTFIcrhUO520srUHTIRskZqeB3VJt6b8sRyIRP5djvnxmL39pZtDYADj0gYi4i0syTGxdl8bg_sFkSKOSSJ_uYL35thOFWa7-mV6dwAK1EufKezcrs2SozX1u0U');
    setFormAlt('Imagem de Referência HTML');
    setFormTab('inbox-omnichannel');
    setFormLeadId('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="bg-surface-container-low border border-surface-container-highest rounded-xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.85)] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-surface-container flex items-center justify-between border-b border-surface-container-highest">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary-container/20 border border-primary-container/40 flex items-center justify-center text-primary">
              <Link2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-headline-sm text-on-surface font-semibold">
                Editor Visual de Links de Imagens HTML & Navegação Fluida
              </h3>
              <p className="font-body-sm text-on-surface-variant">
                Adicione links diretos (URLs) para imagens, avatares e telas do HTML e configure a navegação direta entre elas.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onResetAssets}
              className="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-variant text-on-surface-variant hover:text-on-surface font-telemetry-tag flex items-center gap-1.5 transition-colors"
              title="Restaurar URLs originais do HTML"
            >
              <RotateCcw className="w-3.5 h-3.5 text-primary" />
              <span className="hidden sm:inline">Restaurar Padrão HTML</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg bg-surface-container-high hover:bg-surface-variant text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 min-h-0 overflow-hidden">
          {/* Left Column: Slot Selector List */}
          <div className="lg:col-span-5 border-b lg:border-b-0 lg:border-r border-surface-container-highest flex flex-col min-h-0 bg-surface-container-lowest/60">
            <div className="p-3 border-b border-surface-container-high flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-telemetry-tag text-outline uppercase">
                  Slots Visuais & Telas ({assetList.length})
                </span>
                <button
                  type="button"
                  onClick={startNewSlot}
                  className="px-2.5 py-1 rounded bg-primary-container text-on-primary font-telemetry-tag font-bold flex items-center gap-1 hover:brightness-110 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Adicionar Imagem HTML</span>
                </button>
              </div>
              <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
                {[
                  { id: 'all', label: 'Todos' },
                  { id: 'screen_html', label: 'Telas HTML' },
                  { id: 'lead', label: 'Leads' },
                  { id: 'operator', label: 'Operadores' },
                  { id: 'brand', label: 'Marca' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() =>
                      setFilterCat(
                        tab.id as
                          | 'all'
                          | 'brand'
                          | 'operator'
                          | 'lead'
                          | 'screen_html'
                      )
                    }
                    className={`px-2.5 py-1 rounded font-telemetry-tag whitespace-nowrap transition-colors ${
                      filterCat === tab.id
                        ? 'bg-surface-container-highest text-primary font-bold'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2 thin-scrollbar max-h-60 lg:max-h-none">
              {assetList.map((item) => {
                const isSelected = !isAddingNew && item.key === activeKey;
                return (
                  <div
                    key={item.key}
                    onClick={() => {
                      setIsAddingNew(false);
                      setActiveKey(item.key);
                    }}
                    className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-surface-container-high border-primary-container shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                        : 'bg-surface-container/60 border-transparent hover:bg-surface-container'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={item.url}
                        alt={item.alt}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display =
                            'none';
                        }}
                        className="w-10 h-10 rounded-lg object-cover bg-surface-container-highest shrink-0 border border-surface-variant"
                      />
                      <div className="min-w-0">
                        <h4 className="font-body-sm text-on-surface font-semibold truncate">
                          {item.label}
                        </h4>
                        <div className="flex items-center gap-1.5 font-telemetry-tag text-[10px] text-outline">
                          <span className="uppercase text-primary">
                            {item.category}
                          </span>
                          <span>•</span>
                          <span className="truncate">
                            Destino: {item.linkedTab || 'dashboard'}
                          </span>
                        </div>
                      </div>
                    </div>
                    {item.linkedTab && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigate(item.linkedTab!, item.linkedLeadId);
                          onClose();
                        }}
                        className="px-2 py-1 rounded bg-surface-container-lowest hover:bg-primary-container hover:text-on-primary text-primary font-telemetry-tag text-[10px] flex items-center gap-1 shrink-0 transition-colors"
                        title="Navegar diretamente para a tela vinculada"
                      >
                        <Compass className="w-3 h-3" />
                        <span>Ir</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Live URL & Navigation Link Editor */}
          <form
            onSubmit={handleSave}
            className="lg:col-span-7 p-5 overflow-y-auto space-y-4 thin-scrollbar flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="font-telemetry-tag text-primary uppercase">
                    {isAddingNew
                      ? 'Criando Novo Link de Imagem & Atalho de Navegação'
                      : `Editando Slot: ${activeKey}`}
                  </span>
                </div>
                {savedToast && (
                  <span className="px-2.5 py-1 rounded-full bg-secondary-container/20 text-secondary font-telemetry-tag flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Link Direto Atualizado!
                  </span>
                )}
              </div>

              {/* Preview Box */}
              <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container-high flex flex-col sm:flex-row items-center gap-4">
                <div className="w-24 h-24 rounded-xl bg-surface-container-high overflow-hidden flex items-center justify-center shrink-0 border border-primary-container/30">
                  {formUrl ? (
                    <img
                      src={formUrl}
                      alt={formAlt}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-outline" />
                  )}
                </div>
                <div className="flex-1 min-w-0 space-y-1.5 text-center sm:text-left">
                  <div className="font-title-md text-on-surface font-semibold truncate">
                    {formLabel || 'Sem título'}
                  </div>
                  <p className="font-label-code text-xs text-outline break-all line-clamp-2">
                    {formUrl || 'Nenhuma URL informada'}
                  </p>
                  <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onNavigate(formTab, formLeadId || undefined);
                        onClose();
                      }}
                      className="px-3 py-1 rounded-lg bg-primary-container/20 hover:bg-primary-container text-primary hover:text-on-primary font-telemetry-tag flex items-center gap-1.5 transition-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Testar Navegação para {formTab}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-telemetry-tag text-on-surface-variant uppercase mb-1">
                    Nome / Identificação da Imagem
                  </label>
                  <input
                    type="text"
                    value={formLabel}
                    onChange={(e) => setFormLabel(e.target.value)}
                    placeholder="Ex: Guilherme Sampaio Avatar"
                    className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-lg px-3 py-2 text-body-sm text-on-surface focus:outline-none focus:border-primary-container"
                    required
                  />
                </div>
                <div>
                  <label className="block font-telemetry-tag text-on-surface-variant uppercase mb-1">
                    Texto Alternativo (Atributo alt do HTML)
                  </label>
                  <input
                    type="text"
                    value={formAlt}
                    onChange={(e) => setFormAlt(e.target.value)}
                    placeholder="Descrição da imagem..."
                    className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-lg px-3 py-2 text-body-sm text-on-surface focus:outline-none focus:border-primary-container"
                  />
                </div>
              </div>

              <div>
                <label className="block font-telemetry-tag text-primary uppercase mb-1">
                  Link Direto da Imagem (URL HTML src=&quot;...&quot;)
                </label>
                <input
                  type="url"
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  placeholder="https://lh3.googleusercontent.com/..."
                  className="w-full bg-surface-container-lowest border border-primary-container/40 rounded-lg px-3 py-2.5 font-label-code text-xs text-on-surface focus:outline-none focus:border-primary-container"
                  required
                />
                <p className="font-body-sm text-[11px] text-outline mt-1">
                  Cole qualquer link direto de imagem (Google, CDN, Imgur ou data URI). A imagem será atualizada em todas as telas em tempo real.
                </p>
              </div>

              {/* Navigation Link Binding */}
              <div className="p-3.5 rounded-xl bg-surface-container/60 border border-surface-container-high space-y-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-secondary" />
                  <span className="font-telemetry-tag text-secondary uppercase">
                    Vínculo de Navegação Fluida entre Telas
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-telemetry-tag text-on-surface-variant uppercase mb-1">
                      Ao clicar na imagem, navegar para:
                    </label>
                    <select
                      value={formTab}
                      onChange={(e) =>
                        setFormTab(e.target.value as NavigationTab)
                      }
                      className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-lg px-3 py-2 text-body-sm text-on-surface focus:outline-none focus:border-primary-container"
                    >
                      {TAB_LABELS.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-telemetry-tag text-on-surface-variant uppercase mb-1">
                      Selecionar Lead Específico (Opcional):
                    </label>
                    <select
                      value={formLeadId}
                      onChange={(e) => setFormLeadId(e.target.value)}
                      className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-lg px-3 py-2 text-body-sm text-on-surface focus:outline-none focus:border-primary-container"
                    >
                      <option value="">Nenhum lead específico</option>
                      {leads.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.name} ({l.company})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="pt-4 border-t border-surface-container-high flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-surface-container-high hover:bg-surface-variant text-on-surface font-body-sm transition-colors"
              >
                Fechar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-primary-container hover:brightness-110 text-on-primary font-headline-sm text-body-sm font-bold shadow-[0_0_15px_rgba(245,158,11,0.35)] transition-all flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Salvar Link Direto & Navegação</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
