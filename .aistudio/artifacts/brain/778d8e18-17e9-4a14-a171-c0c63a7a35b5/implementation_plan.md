# Arquitetura AUREUS OS / Aetheris AI — Painel de Persona, Máquina de Estados, Function Calling, Evolution API & Motor de Prospecção

Expansão do ecossistema para incorporar o **Painel Avançado de Persona, Tom de Voz e Regras de Atendimento no WhatsApp** dentro do módulo **Agente de IA**, aliado à implementação real dos **5 Pilares Estruturais** (Evolution API Multi-Tenant, Cérebro Cognitivo com Máquina de Estados e Function Calling, Prisma Schema, Filas BullMQ/Redis e Motor de Prospecção Ativa com injeção direta no topo do funil).

---

## User Review & Critical Decisions

> [!IMPORTANT]
> As decisões abaixo refletem suas escolhas confirmadas:

- **Decisão Confirmada 1 — Implementação Completa no App + Central de Blueprint e Códigos Reais**: Além de criar os arquivos reais de engenharia no projeto (`/lib/evolution.ts`, `/app/api/whatsapp/route.ts`, `/app/api/webhooks/evolution/route.ts`, `/lib/ai/tools-schema.ts`, `/lib/ai/tool-executor.ts`, `/lib/queues/followup-worker.ts` e `/prisma/schema.prisma`), o módulo **Agente de IA** e uma nova seção de **Arquitetura & Engenharia (5 Pilares)** permitirão inspecionar, copiar e testar cada código e prompt mestre diretamente na interface.
- **Decisão Confirmada 2 — Function Calling Real no Gemini (`@google/genai`) com Logs de Execução**: Quando o Agente de IA interagir no WhatsApp/Chat ou no Simulador, o Gemini avaliará e invocará em tempo real as ferramentas `qualify_lead`, `update_kanban_stage`, `schedule_followup` e `request_human_handover`, atualizando o Lead Score, Temperatura (`FRIO`, `MORNO`, `QUENTE`), movendo o card no CRM, agendando jobs na fila e exibindo o log imutável da chamada da ferramenta.
- **Decisão Confirmada 3 — Extrator Interativo de Prospecção (Google Maps & Redes ➔ Topo do Funil 1)**: Inclusão de uma ferramenta prática onde você digita o nicho e a cidade (ex.: *"Clínicas Odontológicas em São Paulo"* ou *"Escritórios de Advocacia em Curitiba"*), extrai e valida os telefones/WhatsApp e injeta os leads com 1 clique diretamente na coluna **Prospecção / Novo Lead** do **Funil 1: Prospecção Ativa (Outbound)**.

---

## 1. Painel de Persona, Tom de Voz e Regras de Atendimento (`Agente de IA`)

Dentro do módulo **Agente de IA**, adicionaremos um painel dedicado e estruturado para governar o comportamento cognitivo do Gemini no WhatsApp:

1. **Seletor de Persona & Arquétipo de Vendas**:
   - *Closer Consultivo High-Ticket (SPIN Selling)*
   - *SDR Ágil de Qualificação (BANT)*
   - *Especialista Técnico Empático (RAG First)*
   - *Vendedor Direto de Conversão Rápida (Fast-Track)*
2. **Calibragem de Tom de Voz no WhatsApp**:
   - Nível de Formalidade (*Corporativo Executivo* vs. *Conversacional Humanizado de WhatsApp*).
   - Ritmo e Tamanho das Mensagens (*Mensagens curtas estilo WhatsApp, quebradas em parágrafos leves*).
   - Uso moderado de Emojis e Gatilhos de Escassez/Autoridade.
3. **Regras Específicas de Atendimento & Máquina de Estados Não-Linear**:
   - **Regra 1 — Fast-Track (Venda Rápida)**: Quando o lead demonstra alta intenção imediata (pede preço, link de pagamento ou proposta), pular etapas intermediárias de nutrição e avançar direto para `Proposta` / `Fechamento` enviando o link.
   - **Regra 2 — Pacing (Cadência Adaptativa)**: Se o lead responde devagar ou pede um prazo (*"fale comigo na quinta-feira"* ou *"vou analisar com meu sócio"*), acionar a tool `schedule_followup(delay_in_hours, followup_intent)` na fila BullMQ.
   - **Regra 3 — Desqualificação, Geladeira & Remarketing Passivo**: Se o lead esfriar após as tentativas ou não tiver perfil imediato, acionar `qualify_lead` (Temperatura `FRIO`) e mover para cadência de Geladeira/Nutrição passiva (1 toque estratégico de atualização).
   - **Regra 4 — Guardrails do WhatsApp (O que Nunca Fazer)**: Proibir alucinação de preços fora da Base RAG, nunca enviar blocos gigantes de texto e acionar `request_human_handover` se o cliente pedir atendente humano ou demonstrar irritação.

---

## 2. Os 5 Pilares Estruturais e Arquivos Fundamentais

### Pilar 1: Infraestrutura de Mensageria (`Evolution API Cluster`)
- **`/lib/evolution.ts`**: Serviço completo tipado em TypeScript com `createInstance(tenantId)`, `getQRCode(instanceName)`, `getConnectionState(instanceName)` e `sendMessage(instanceName, phone, message)` usando `fetch` nativo e configurando automaticamente o Webhook para `/api/webhooks/evolution`.
- **`/app/api/whatsapp/route.ts`**: Endpoint para o painel do Tenant criar/verificar sua instância Evolution API e retornar o QR Code Base64 e o estado de conexão.
- **`/app/api/webhooks/evolution/route.ts`**: Receptor Inbound de Webhooks com prevenção de loop (`fromMe: true` e grupos `@g.us`), tratamento de `connection.update` e `messages.upsert`, persistência de mensagens e acionamento do Cérebro Cognitivo da IA.

### Pilar 2: Cérebro Cognitivo, Máquina de Estados & Function Calling
- **`/lib/ai/system-prompt-builder.ts`**: Gerador dinâmico do `system_prompt` mestre que injeta a Persona do Tenant, Tom de Voz, Regras Específicas, Base RAG, Links do Agente e as instruções estritas de quando invocar cada Tool da Máquina de Estados.
- **`/lib/ai/tools-schema.ts`**: Declarações JSON Schema estritas para `qualify_lead`, `update_kanban_stage`, `schedule_followup` e `request_human_handover`.
- **`/lib/ai/tool-executor.ts`**: Dispatcher `executeTool(toolName, args, context)` que executa as mudanças de estado do lead, agenda follow-ups e grava logs auditáveis na `Timeline`.

### Pilar 3: Modelagem de Banco de Dados Multi-Tenant (`/prisma/schema.prisma`)
- Schema completo para PostgreSQL com:
  - `Tenant` (`evolutionInstanceName`, `evolutionInstanceToken`, `whatsappStatus`, configurações de Persona/IA e documentos RAG).
  - `Lead` (`leadScore`, `temperature`, `dynamicStage`, `pipeline`, `lastInteraction`, `whatsappRemoteJid`).
  - `Message` (`whatsappMessageId`, `fromMe`, `content`, `sentimentDetected`).
  - `TimelineEvent` (Log imutável de auditoria das ações da IA, execuções de tools e transições de estágio).

### Pilar 4: Motor de Agendamento e Follow-ups (`/lib/queues/followup-worker.ts`)
- Arquitetura de filas com Redis & BullMQ (`FollowupQueue` e `FollowupWorker`) demonstrando como o job agendado pela tool `schedule_followup` desperta no horário exato, recupera as últimas mensagens do lead, gera a mensagem contextualizada no Gemini e envia via `EvolutionService.sendMessage()`, além de exibir a fila de agendamentos ativos na interface.

### Pilar 5: Motor de Prospecção Ativa (Scraping Google Maps/Redes) & Replicação SaaS
- Interface interativa de **Extração & Prospecção Outbound** (busca simulada por nicho + localização no Google Maps/Redes, validação de número WhatsApp e botão **"Injetar Leads no Topo do Funil de Prospecção"**) e documentação da arquitetura de empacotamento Multi-Tenant por nicho.

---

## 3. Diagrama de Fluxo Cognitivo (Evolution API + Gemini Function Calling + BullMQ)

```
[WhatsApp do Lead]
       │ (Webhook: messages.upsert | fromMe: false)
       ▼
[/app/api/webhooks/evolution/route.ts]
       │ 1. Identifica Tenant pela instanceName
       │ 2. Salva Message e carrega Persona + Regras + Histórico
       ▼
[Cérebro Cognitivo Gemini + Máquina de Estados]
       ├──► Tool: qualify_lead(score, temperature, buying_intent, reasoning)
       ├──► Tool: update_kanban_stage(target_stage, stage_reason)
       ├──► Tool: schedule_followup(delay_in_hours, followup_intent) ──► [Fila BullMQ / Redis]
       └──► Tool: request_human_handover(urgency, summary)
       │
       ▼
[/lib/ai/tool-executor.ts]
       │ • Atualiza Lead & Funil + Registra TimelineEvent imutável
       │ • Dispara resposta adaptada via EvolutionService.sendMessage()
       ▼
[UI Atualizada em Tempo Real: Conversas, CRM & Logs de Tools]
```
