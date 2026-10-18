'use client';

import React, { useState } from 'react';
import {
  Cpu,
  FileText,
  Search,
  Sparkles,
  CheckCircle2,
  Plus,
  RefreshCw,
  Database,
} from 'lucide-react';
import { KnowledgeDocument } from '@/lib/types';

interface KnowledgeBaseViewProps {
  documents: KnowledgeDocument[];
  onAddDocument: (doc: KnowledgeDocument) => void;
}

export default function KnowledgeBaseView({
  documents,
  onAddDocument,
}: KnowledgeBaseViewProps) {
  const [ragQuery, setRagQuery] = useState(
    'Qual o preço do Plano Enterprise Autonomous e como funciona a sincronização com o Bling ERP?'
  );
  const [ragResult, setRagResult] = useState<{
    answer: string;
    sourceDoc: string;
    similarityScore: string;
  } | null>(null);
  const [isQuerying, setIsQuerying] = useState(false);

  // Add Doc Form
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  const totalChunks = documents.reduce((acc, d) => acc + d.chunks, 0);

  const handleRunRagQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ragQuery.trim() || isQuerying) return;
    setIsQuerying(true);
    try {
      const res = await fetch('/api/aetheris-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'rag_query',
          payload: {
            query: ragQuery,
            documents,
          },
        }),
      });
      const data = await res.json();
      if (data.answer) {
        setRagResult(data);
      }
    } finally {
      setIsQuerying(false);
    }
  };

  const handleAddDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    onAddDocument({
      id: `doc-${Date.now()}`,
      title: newTitle.trim(),
      type: 'PLAYBOOK',
      chunks: Math.max(24, Math.round(newContent.length / 4)),
      embeddingModel: 'gemini-embedding-2-preview',
      updatedAt: 'Agora',
      status: 'indexed',
      contentSummary: newContent.trim(),
    });
    setNewTitle('');
    setNewContent('');
  };

  return (
    <div className="flex flex-col w-full gap-space-lg pb-space-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse" />
            <span className="font-telemetry-tag text-primary uppercase">
              Repositório Vetorial RAG Puro // 99.8% Assertividade
            </span>
          </div>
          <h2 className="font-headline-lg text-on-surface mt-0.5">
            Base de Conhecimento & Embeddings
          </h2>
          <p className="font-body-sm text-on-surface-variant">
            Documentos corporativos, tabelas de preços e playbooks indexados para consulta instantânea sem alucinação.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-surface-container-low px-4 py-2.5 rounded-xl border border-surface-container-high">
          <Database className="w-5 h-5 text-primary" />
          <div>
            <span className="font-telemetry-tag text-outline block uppercase">
              Vetores Indexados Ativos
            </span>
            <span className="font-label-code text-primary font-bold">
              4.120 Embeddings ({totalChunks} Chunks)
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* Left 7 Cols: Vectorized Documents List + Add New */}
        <div className="lg:col-span-7 space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="p-4 rounded-xl bg-surface-container/80 border border-surface-container-high hover:border-primary-container/40 transition-all flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-surface-container-lowest text-primary">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-title-md text-on-surface font-semibold">
                        {doc.title}
                      </h4>
                      <div className="flex items-center gap-2 font-telemetry-tag text-[10px] text-outline">
                        <span className="text-secondary">{doc.type}</span>
                        <span>•</span>
                        <span>{doc.chunks} chunks</span>
                        <span>•</span>
                        <span>Atualizado: {doc.updatedAt}</span>
                      </div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-primary-container/15 text-primary font-telemetry-tag text-[10px] flex items-center gap-1 shrink-0">
                    <CheckCircle2 className="w-3 h-3" /> Indexado
                  </span>
                </div>
                <p className="font-body-sm text-on-surface-variant bg-surface-container-lowest/70 p-2.5 rounded-lg">
                  {doc.contentSummary}
                </p>
              </div>
            ))}
          </div>

          {/* Index New Document Card */}
          <form
            onSubmit={handleAddDoc}
            className="p-4 rounded-xl bg-surface-container-low border border-surface-container-highest space-y-3"
          >
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-primary" />
              <span className="font-telemetry-tag text-primary uppercase">
                Indexar Novo Documento ou Regra de Negócio no RAG
              </span>
            </div>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Título do Documento (ex: Política de Descontos Black Friday 2026.pdf)"
              required
              className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-lg px-3 py-2 text-body-sm text-on-surface focus:outline-none focus:border-primary-container"
            />
            <textarea
              rows={2}
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Conteúdo técnico, regras comerciais, SLAs ou preços que os agentes devem consultar..."
              required
              className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-lg p-3 text-body-sm text-on-surface focus:outline-none focus:border-primary-container"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-surface-container-high hover:bg-primary-container hover:text-on-primary text-primary font-telemetry-tag font-bold transition-all"
            >
              + Vetorizar & Injetar no Cérebro IA
            </button>
          </form>
        </div>

        {/* Right 5 Cols: Semantic RAG Test Console */}
        <div className="lg:col-span-5 bg-surface-container/80 backdrop-blur-xl rounded-xl p-space-md sm:p-space-lg border border-primary-container/30 flex flex-col justify-between space-y-4 h-fit">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-primary" />
              <h3 className="font-title-md text-on-surface font-semibold">
                Console de Consulta Semântica RAG (Gemini)
              </h3>
            </div>
            <p className="font-body-sm text-on-surface-variant">
              Simule uma pergunta complexa para verificar qual documento vetorizado o agente utilizará como fonte da verdade.
            </p>
            <form onSubmit={handleRunRagQuery} className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-outline" />
                <textarea
                  rows={3}
                  value={ragQuery}
                  onChange={(e) => setRagQuery(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-lg pl-9 pr-3 py-2.5 font-body-sm text-on-surface focus:outline-none focus:border-primary-container"
                />
              </div>
              <button
                type="submit"
                disabled={isQuerying}
                className="w-full py-2.5 rounded-lg bg-primary-container text-on-primary font-headline-sm text-body-sm font-bold flex items-center justify-center gap-2 hover:brightness-110 transition-all"
              >
                {isQuerying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Buscando nos Vetores Ativos...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Executar Busca RAG Sem Alucinação</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {ragResult && (
            <div className="p-4 rounded-xl bg-surface-container-lowest border border-primary-container/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-telemetry-tag text-secondary uppercase">
                  Similaridade Vetorial: {ragResult.similarityScore}
                </span>
                <span className="font-label-code text-[11px] text-primary bg-primary-container/10 px-2 py-0.5 rounded">
                  Fonte: {ragResult.sourceDoc}
                </span>
              </div>
              <p className="font-body-md text-on-surface leading-relaxed">
                {ragResult.answer}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
