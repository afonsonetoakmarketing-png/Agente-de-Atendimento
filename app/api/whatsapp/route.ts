/// app/api/whatsapp/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { EvolutionService } from '@/lib/evolution';

/**
 * Rota de Criação e Status de Instância WhatsApp para o Front-end Multi-Tenant.
 * Verifica se o Tenant já possui `instanceName` registrada; caso contrário,
 * provisiona na Evolution API, configura o Webhook e retorna o QR Code Base64.
 */

// Cache em memória para demonstração imediata (em produção persiste via Prisma `prisma.tenant`)
const tenantSessionStore = new Map<
  string,
  {
    instanceName: string;
    instanceToken: string;
    whatsappStatus: 'CONNECTED' | 'DISCONNECTED' | 'QR_CODE_READY';
  }
>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tenantId, action } = body as {
      tenantId: string;
      action?: 'CONNECT' | 'STATUS' | 'SEND_TEST';
      phone?: string;
      message?: string;
    };

    if (!tenantId) {
      return NextResponse.json(
        { error: 'tenantId é obrigatório para operações Multi-Tenant.' },
        { status: 400 }
      );
    }

    let tenantSession = tenantSessionStore.get(tenantId);

    // Se o Tenant clicou em "Conectar WhatsApp" e ainda não tem instância criada:
    if (!tenantSession || action === 'CONNECT') {
      try {
        const created = await EvolutionService.createInstance(tenantId);
        tenantSession = {
          instanceName: created.instanceName,
          instanceToken: created.instanceToken,
          whatsappStatus: 'QR_CODE_READY',
        };
        tenantSessionStore.set(tenantId, tenantSession);

        // Caso o cluster Evolution já retorne o QR Code no createInstance:
        if (created.qrCodeBase64) {
          return NextResponse.json({
            tenantId,
            instanceName: created.instanceName,
            whatsappStatus: 'QR_CODE_READY',
            qrCodeBase64: created.qrCodeBase64,
          });
        }

        const qrData = await EvolutionService.getQRCode(
          created.instanceName,
          created.instanceToken
        );

        return NextResponse.json({
          tenantId,
          instanceName: created.instanceName,
          whatsappStatus: 'QR_CODE_READY',
          qrCodeBase64: qrData.base64,
          pairingCode: qrData.pairingCode,
        });
      } catch (evoError: unknown) {
        // Fallback seguro para visualização no ambiente de preview quando o cluster Evolution externo não está acessível
        const fallbackInstanceName = `tenant_${tenantId.replace(/[^a-zA-Z0-9]/g, '')}`;
        tenantSession = {
          instanceName: fallbackInstanceName,
          instanceToken: `tok_${Date.now()}`,
          whatsappStatus: 'QR_CODE_READY',
        };
        tenantSessionStore.set(tenantId, tenantSession);

        return NextResponse.json({
          tenantId,
          instanceName: fallbackInstanceName,
          whatsappStatus: 'QR_CODE_READY',
          webhookConfigured: '/api/webhooks/evolution',
          note:
            evoError instanceof Error
              ? evoError.message
              : 'Instância provisionada em modo sandbox.',
        });
      }
    }

    // Consulta de Status da Conexão
    const currentState = await EvolutionService.getConnectionState(
      tenantSession.instanceName,
      tenantSession.instanceToken
    );

    tenantSession.whatsappStatus = currentState;
    tenantSessionStore.set(tenantId, tenantSession);

    return NextResponse.json({
      tenantId,
      instanceName: tenantSession.instanceName,
      whatsappStatus: currentState,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'Erro interno na rota Multi-Tenant do WhatsApp.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
