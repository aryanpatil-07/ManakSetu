import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Shield,
  ExternalLink,
  Globe,
  Radio,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'ManakSetu (मानकसेतु) | AI-Powered BIS Compliance, Tender Scrutiny & BoQ Auditing Workbench',
  description:
    'Industrial-grade procurement intelligence platform cross-referencing public tenders against Bureau of Indian Standards (BIS), statutory Quality Control Orders (QCOs), and CVC anti-tailoring directives.',
  keywords: [
    'ManakSetu',
    'BIS Compliance',
    'Tender Scrutiny',
    'BoQ Auditor',
    'Quality Control Orders',
    'QCO',
    'CVC Anti-tailoring',
    'Indian Standards',
    'GFR 144',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-canvas-950 text-slate-100 flex flex-col min-h-screen selection:bg-accent-blue selection:text-white font-sans antialiased">
        
        {/* ========================================================= */}
        {/* 1. TOP UTILITY BAR & ANNOUNCEMENT STRIP                   */}
        {/* ========================================================= */}
        <div className="bg-canvas-900 border-b border-slate-800/80 text-[11px] text-slate-400 py-1.5 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            
            {/* Live Regulatory Notice */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent-blue/20 text-accent-sky border border-accent-blue/40 font-semibold tracking-wide uppercase text-[10px]">
                <Radio className="w-2.5 h-2.5 animate-pulse text-accent-cyan" />
                Live Gazette
              </span>
              <span className="text-slate-300 font-medium truncate max-w-xs md:max-w-md">
                S.O. 458(E) — Mandatory ISI Mark QCO Enforcement Active for 2026 Procurement
              </span>
            </div>

            {/* Statutory Badges & Utilities */}
            <div className="hidden sm:flex items-center gap-4">
              <div className="flex items-center gap-2 font-mono text-[10px] text-slate-400">
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">GFR 144(vii)</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">BIS Act 2016</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300/90 border border-amber-500/30">CVC Anti-Tailoring</span>
              </div>

              <div className="h-3 w-[1px] bg-slate-800" />

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-slate-400 hover:text-white cursor-pointer transition">
                  <Globe className="w-3 h-3 text-accent-sky" />
                  <span className="text-[10px] font-medium">EN | हिन्दी</span>
                </div>
                <a
                  href="https://www.services.bis.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-slate-400 hover:text-accent-sky transition text-[10px]"
                >
                  BIS Portal <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>

          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. ELEVATED STICKY MEGA-NAVIGATION HEADER                 */}
        {/* ========================================================= */}
        <header className="sticky top-0 z-50 backdrop-blur-2xl bg-canvas-950/85 border-b border-slate-800/80 shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            
            {/* Brand Logo - Only Name & Hindi Version */}
            <Link href="/" className="flex items-center group">
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-white group-hover:text-accent-sky transition">
                  MANAK<span className="text-accent-cyan font-bold">SETU</span>
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  मानकसेतु
                </span>
              </div>
            </Link>

          </div>
        </header>

        {/* ========================================================= */}
        {/* 3. MAIN WORKSPACE CONTAINER                               */}
        {/* ========================================================= */}
        <main className="flex-1 w-full relative bg-grid-pattern bg-radial-glow">
          {children}
        </main>

        {/* ========================================================= */}
        {/* 4. GLOBAL ENTERPRISE FOOTER & COMPLIANCE BAR              */}
        {/* ========================================================= */}
        <footer className="border-t border-slate-800/90 bg-canvas-900/95 pt-12 pb-8 text-xs text-slate-400">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
            
            {/* Multi-column Directory */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-800/80">
              
              {/* Col 1: Platform Overview */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-accent-blue/20 border border-accent-sky/40 flex items-center justify-center text-accent-cyan">
                    <Shield className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-white text-sm">MANAKSETU</span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Industrial-grade tender scrutiny & standards harmonization engine built for Indian Public Procurement Bodies, CPWD, Railways, and Municipal Corporations.
                </p>
                <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Statutory Engine v2.4 Active
                </div>
              </div>

              {/* Col 2: Solutions & Tooling */}
              <div className="space-y-2.5">
                <div className="text-[11px] font-bold text-slate-200 uppercase tracking-wider font-mono">
                  Workbench Solutions
                </div>
                <ul className="space-y-1.5">
                  <li>
                    <Link href="/audit-studio" className="hover:text-accent-sky transition">Interactive Audit Studio</Link>
                  </li>
                  <li>
                    <Link href="/rfp-scanner" className="hover:text-accent-sky transition">RFP Tender PDF Scrutinizer</Link>
                  </li>
                  <li>
                    <Link href="/boq-auditor" className="hover:text-accent-sky transition">Excel BoQ Schedule Auditor</Link>
                  </li>
                  <li>
                    <Link href="/audit-studio#standards-graph" className="hover:text-accent-sky transition">Normative & Equivalence Graph</Link>
                  </li>
                </ul>
              </div>

              {/* Col 3: Statutory Precedents */}
              <div className="space-y-2.5">
                <div className="text-[11px] font-bold text-slate-200 uppercase tracking-wider font-mono">
                  Statutory Frameworks
                </div>
                <ul className="space-y-1.5 text-slate-400">
                  <li className="hover:text-slate-200">Bureau of Indian Standards Act, 2016</li>
                  <li className="hover:text-slate-200">Quality Control Orders (QCO Scheme-I)</li>
                  <li className="hover:text-slate-200">GFR 2017 Rule 144(vii) Mandates</li>
                  <li className="hover:text-slate-200">CVC Circular No. 03-05-1-CTE-9</li>
                </ul>
              </div>

              {/* Col 4: Institutional Gateways */}
              <div className="space-y-2.5">
                <div className="text-[11px] font-bold text-slate-200 uppercase tracking-wider font-mono">
                  National Portals
                </div>
                <ul className="space-y-1.5">
                  <li>
                    <a href="https://gem.gov.in" target="_blank" rel="noreferrer" className="hover:text-accent-sky flex items-center gap-1 transition">
                      Government e-Marketplace (GeM) <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </li>
                  <li>
                    <a href="https://eprocure.gov.in" target="_blank" rel="noreferrer" className="hover:text-accent-sky flex items-center gap-1 transition">
                      Central Public Procurement Portal <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </li>
                  <li>
                    <a href="https://www.services.bis.gov.in/php/BIS_2.0/bisconnect/knowyourstandards/indian_standards/isdetails" target="_blank" rel="noreferrer" className="hover:text-accent-sky flex items-center gap-1 transition">
                      BIS Standards Search <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </li>
                </ul>
              </div>

            </div>

            {/* Bottom Compliance Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
              <p>
                &copy; {new Date().getFullYear()} ManakSetu National Procurement Workbench. Built strictly under BIS Act 2016 & CVC Anti-Tailoring Directives.
              </p>
              <div className="flex items-center gap-4 text-slate-400">
                <span className="hover:text-white cursor-pointer">Security Protocol</span>
                <span>•</span>
                <span className="hover:text-white cursor-pointer">CAG Audit Defense</span>
                <span>•</span>
                <span className="hover:text-white cursor-pointer">NABL Lab Integrations</span>
              </div>
            </div>

          </div>
        </footer>

      </body>
    </html>
  );
}
