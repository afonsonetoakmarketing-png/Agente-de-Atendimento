import type {Metadata} from 'next';
import {Space_Grotesk, Plus_Jakarta_Sans, JetBrains_Mono} from 'next/font/google';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  weight: ['500', '600', '700'],
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  weight: ['400', '500', '600', '700'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Aetheris AI • Agent Core — Ecossistema Omnichannel & CRM Autônomo',
  description:
    'Monitoramento autônomo de agentes virtuais, terminal omnichannel WhatsApp/Instagram/Webchat, CRM Kanban e cérebro neural multi-tenant.',
  openGraph: {
    title: 'Aetheris AI • Agent Core — Ecossistema Omnichannel & CRM Autônomo',
    description:
      'Monitoramento autônomo de agentes virtuais, terminal omnichannel WhatsApp/Instagram/Webchat, CRM Kanban e cérebro neural multi-tenant.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aetheris AI • Agent Core — Ecossistema Omnichannel & CRM Autônomo',
    description:
      'Monitoramento autônomo de agentes virtuais, terminal omnichannel WhatsApp/Instagram/Webchat, CRM Kanban e cérebro neural multi-tenant.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html
      lang="pt-BR"
      className={`dark ${spaceGrotesk.variable} ${plusJakarta.variable} ${jetbrainsMono.variable}`}
    >
      <body
        suppressHydrationWarning
        className="bg-[#0e0e11] text-[#e4e1e6] antialiased selection:bg-[#f59e0b] selection:text-[#472a00] min-h-screen overflow-x-hidden"
      >
        {children}
      </body>
    </html>
  );
}
