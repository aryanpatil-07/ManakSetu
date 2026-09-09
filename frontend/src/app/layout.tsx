import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Shield, FileCheck, Table, BarChart3 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'ManakSetu | AI-Powered BIS Compliance & Tender Scrutiny',
  description: 'Automated BIS Standard Verification, QCO Compliance Engine & CVC Anti-Tailoring Tender Scrutiny System.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 flex flex-col min-h-screen">
        {/* Navigation Bar */}
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/90 border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-6 h-18 py-2 flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 via-slate-900 to-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-md">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg font-black tracking-tight text-white">MANAK</span>
                    <span className="text-lg font-black tracking-tight text-emerald-400">SETU</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">मानकसेतु</span>
                  </div>
                  <div className="text-[10px] tracking-wider text-slate-400 uppercase font-medium">
                    National Standards Harmonization & Procurement Compliance Engine
                  </div>
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="font-semibold text-white">GFR 144(vii)</span> & <span className="text-emerald-400">BIS Act 2016</span> Active
              </div>

              <nav className="flex items-center gap-1 md:gap-2">
                <Link
                  href="/"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition"
                >
                  <BarChart3 className="w-4 h-4 text-emerald-400" />
                  Studio
                </Link>
                <Link
                  href="/rfp-scanner"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition"
                >
                  <FileCheck className="w-4 h-4 text-blue-400" />
                  RFP Scrutinizer
                </Link>
                <Link
                  href="/boq-auditor"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition"
                >
                  <Table className="w-4 h-4 text-amber-400" />
                  BoQ Auditor
                </Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-800/80 bg-slate-950/60 py-6 text-center text-xs text-slate-500">
          <p>
            ManakSetu Procurement Intelligence Platform &copy; 2026. Built in accordance with BIS Act 2016, GFR 144, & CVC Anti-Tailoring Guidelines.
          </p>
        </footer>
      </body>
    </html>
  );
}
