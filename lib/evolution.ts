/// lib/evolution.ts
/**
 * Core Service da Evolution API (Multi-Tenant Cluster)
 * Utiliza fetch nativo do Node.js / Next.js App Router com tipagem estrita.
 */

export type EvolutionConnectionState =
  | 'CONNECTED'
  | 'DISCONNECTED'
  | 'QR_CODE_READY';

export interface EvolutionCreateInstanceResponse {
  instance: {
    instanceName: string;
    instanceId: string;
    status: string;
  };
  hash: {
    apikey: string;
  };
  qrcode?: {
    base64: string;
    code: string;
  };
}

export interface EvolutionQRCodeResponse {
  pairingCode?: string | null;
  code: string;
  base64: string;
  count?: number;
}

export interface EvolutionStateResponse {
  instance: {
    instanceName: string;
    state: 'open' | 'close' | 'connecting';
  };
}

const EVOLUTION_API_URL =
  process.env.EVOLUTION_API_URL || 'https://evolution-cluster.aureus-os.com';
const EVOLUTION_GLOBAL_API_KEY =
  process.env.EVOLUTION_GLOBAL_API_KEY || 'aureus-global-master-key';
const APP_BASE_URL = process.env.APP_URL || 'http://localhost:3000';

export class EvolutionService {
  private static getHeaders(instanceToken?: string): HeadersInit {
    return {
      'Content-Type': 'application/json',
      apikey: instanceToken || EVOLUTION_GLOBAL_API_KEY,
    };
  }

  /**
   * 1. Cria dinamicamente uma instância de WhatsApp para o Tenant
   * e configura automaticamente o Webhook Inbound apontando para o Next.js.
   */
  static async createInstance(
    tenantId: string
  ): Promise<{
    instanceName: string;
    instanceToken: string;
    qrCodeBase64?: string;
  }> {
    const sanitizedTenant = tenantId.replace(/[^a-zA-Z0-9_-]/g, '');
    const instanceName = `tenant_${sanitizedTenant}`;
    const webhookUrl = `${APP_BASE_URL.replace(/\/$/, '')}/api/webhooks/evolution`;

    const payload = {
      instanceName,
      qrcode: true,
      integration: 'WHATSAPP-BAILEYS',
      rejectCall: true,
      msgCall:
        'Olá! Este canal atende exclusivamente por mensagens ou áudio via WhatsApp.',
      groupsIgnore: true,
      alwaysOnline: true,
      readMessages: true,
      readStatus: false,
      webhook: {
        url: webhookUrl,
        byEvents: false,
        base64: false,
        events: ['CONNECTION_UPDATE', 'MESSAGES_UPSERT', 'QRCODE_UPDATED'],
      },
    };

    const response = await fetch(`${EVOLUTION_API_URL}/instance/create`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `[EvolutionService.createInstance] Falha (${response.status}): ${errorBody}`
      );
    }

    const data = (await response.json()) as EvolutionCreateInstanceResponse;
    return {
      instanceName: data.instance.instanceName,
      instanceToken: data.hash.apikey,
      qrCodeBase64: data.qrcode?.base64,
    };
  }

  /**
   * 2. Resgata o QR Code atualizado em Base64 para pareamento no front-end do Tenant.
   */
  static async getQRCode(
    instanceName: string,
    instanceToken?: string
  ): Promise<EvolutionQRCodeResponse> {
    const response = await fetch(
      `${EVOLUTION_API_URL}/instance/connect/${encodeURIComponent(instanceName)}`,
      {
        method: 'GET',
        headers: this.getHeaders(instanceToken),
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `[EvolutionService.getQRCode] Erro ao obter QR Code (${response.status}): ${errorBody}`
      );
    }

    return (await response.json()) as EvolutionQRCodeResponse;
  }

  /**
   * 3. Verifica o estado atual da sessão do WhatsApp na Evolution API.
   */
  static async getConnectionState(
    instanceName: string,
    instanceToken?: string
  ): Promise<EvolutionConnectionState> {
    const response = await fetch(
      `${EVOLUTION_API_URL}/instance/connectionState/${encodeURIComponent(instanceName)}`,
      {
        method: 'GET',
        headers: this.getHeaders(instanceToken),
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      return 'DISCONNECTED';
    }

    const data = (await response.json()) as EvolutionStateResponse;
    const rawState = data.instance?.state;

    if (rawState === 'open') return 'CONNECTED';
    if (rawState === 'connecting') return 'QR_CODE_READY';
    return 'DISCONNECTED';
  }

  /**
   * 4. Dispara mensagem de texto 1x1 via Evolution API usando o token da instância.
   */
  static async sendMessage(
    instanceName: string,
    phone: string,
    message: string,
    instanceToken?: string
  ): Promise<{ messageId: string; status: string }> {
    const cleanPhone = phone.replace(/\D/g, '');

    const payload = {
      number: cleanPhone,
      options: {
        delay: 1200,
        presence: 'composing',
        linkPreview: true,
      },
      textMessage: {
        text: message,
      },
    };

    const response = await fetch(
      `${EVOLUTION_API_URL}/message/sendText/${encodeURIComponent(instanceName)}`,
      {
        method: 'POST',
        headers: this.getHeaders(instanceToken),
        body: JSON.stringify(payload),
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `[EvolutionService.sendMessage] Falha no envio (${response.status}): ${errorBody}`
      );
    }

    const result = await response.json();
    return {
      messageId: result?.key?.id || `evo_${Date.now()}`,
      status: result?.status || 'SENT',
    };
  }
}
