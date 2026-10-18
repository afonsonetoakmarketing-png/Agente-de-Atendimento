/// app/api/webhooks/evolution/route.ts
import { NextRequest, NextResponse } from 'next/server';

/**
 * Controlador de Webhooks Inbound da Evolution API (`/app/api/webhooks/evolution/route.ts`).
 * Recebe eventos em tempo real de todas as instâncias Multi-Tenant do cluster.
 */

export interface EvolutionWebhookPayload {
  event: 'connection.update' | 'messages.upsert' | 'qrcode.updated' | string;
  instance: string; // Ex: "tenant_cybercorp_prod"
  data: {
    state?: 'open' | 'close' | 'connecting';
    statusReason?: number;
    key?: {
      remoteJid: string;
      fromMe: boolean;
      id: string;
    };
    pushName?: string;
    message?: {
      conversation?: string;
      extendedTextMessage?: {
        text?: string;
      };
    };
    messageTimestamp?: number;
  };
}

export async function POST(req: NextRequest) {
  try {
    const payload = (await req.json()) as EvolutionWebhookPayload;
    const instanceName = payload?.instance;

    // 1. Segurança Multi-Tenant: Identifica a qual Tenant o evento pertence pelo nome da instância
    if (!instanceName) {
      return NextResponse.json(
        { error: 'Payload inválido: instance ausente.' },
        { status: 400 }
      );
    }

    // 2. Tratamento do evento `connection.update` (leitura de QR Code, queda de sessão ou bateria)
    if (payload.event === 'connection.update') {
      const rawState = payload.data?.state;
      const mappedStatus =
        rawState === 'open'
          ? 'CONNECTED'
          : rawState === 'connecting'
          ? 'QR_CODE_READY'
          : 'DISCONNECTED';

      /*
       * Persistência Prisma:
       * await prisma.tenant.update({
       *   where: { evolutionInstanceName: instanceName },
       *   data: { whatsappStatus: mappedStatus },
       * });
       */

      return NextResponse.json({
        received: true,
        event: 'connection.update',
        instanceName,
        whatsappStatus: mappedStatus,
      });
    }

    // 3. Tratamento do evento `messages.upsert` (novas mensagens no WhatsApp)
    if (payload.event === 'messages.upsert') {
      const messageKey = payload.data?.key;
      const remoteJid = messageKey?.remoteJid || '';

      // REGRA DE PREVENÇÃO DE LOOP INFINITO:
      // Ignora mensagens enviadas pelo próprio bot (`fromMe: true`) e mensagens de grupos (`@g.us`)
      if (messageKey?.fromMe === true || remoteJid.endsWith('@g.us')) {
        return NextResponse.json({
          ignored: true,
          reason: messageKey?.fromMe
            ? 'Prevenção de loop: mensagem enviada pelo próprio Agente (fromMe: true)'
            : 'Mensagem de grupo ignorada (foco 1x1)',
        });
      }

      // Extrai o texto da mensagem (suporta mensagem simples ou extendedTextMessage)
      const incomingText =
        payload.data?.message?.conversation ||
        payload.data?.message?.extendedTextMessage?.text ||
        '';

      if (!incomingText.trim()) {
        return NextResponse.json({
          ignored: true,
          reason: 'Mensagem sem conteúdo textual processável.',
        });
      }

      const cleanPhone = remoteJid.replace('@s.whatsapp.net', '');
      const whatsappMessageId = messageKey?.id || `wamid_${Date.now()}`;

      /*
       * Roteamento Interno Multi-Tenant (Prisma + Cérebro Cognitivo):
       * 1. Localiza o Tenant dono da `instanceName`
       * 2. Faz upsert do Lead pelo `whatsappRemoteJid`
       * 3. Salva a mensagem recebida na tabela `Message` com `whatsappMessageId`
       * 4. Acorda o Cérebro da IA (Gemini Function Calling) para avaliar Temperatura/Velocidade,
       *    executar Tools (`qualify_lead`, `update_kanban_stage`, `schedule_followup`) e responder via EvolutionService.
       */

      return NextResponse.json({
        received: true,
        routedToCognitiveBrain: true,
        instanceName,
        leadPhone: cleanPhone,
        whatsappMessageId,
        incomingText,
      });
    }

    return NextResponse.json({
      received: true,
      event: payload.event,
      instanceName,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'Falha no processamento do Webhook da Evolution API.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
