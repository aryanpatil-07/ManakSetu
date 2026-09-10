import './globals.css';
import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'ManakSetu | Indian Standards Intelligence Platform',
  description:
    'Institutional procurement intelligence platform cross-referencing public tenders against Bureau of Indian Standards (BIS), statutory Quality Control Orders (QCOs), and CVC anti-tailoring directives.',
  keywords: [
    'ManakSetu',
    'BIS Compliance',
    'Indian Standards',
    'Quality Control Orders',
    'QCO',
    'Tender Scrutiny',
    'IS 1180',
    'IS 4984',
    'CVC Anti-tailoring',
    'GFR Rule 144',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-on-surface font-sans antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
