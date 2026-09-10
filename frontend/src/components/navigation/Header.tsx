'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState('English');
  const [notifOpen, setNotifOpen] = useState(false);

  // Dynamic Breadcrumb Label
  const getBreadcrumb = () => {
    if (pathname.startsWith('/dashboard') || pathname === '/') {
      return { section: 'Workspace', title: 'Procurement intelligence' };
    }
    if (pathname.startsWith('/new-analysis')) {
      return { section: 'Workspace', title: 'New standards analysis' };
    }
    if (pathname.startsWith('/documents')) {
      return { section: 'Workspace', title: 'Analyzed documents' };
    }
    if (pathname.startsWith('/specification-builder')) {
      return { section: 'Workspace', title: 'Specification builder' };
    }
    if (pathname.startsWith('/standards-library')) {
      return { section: 'Intelligence', title: 'Standards library' };
    }
    if (pathname.startsWith('/certifications')) {
      return { section: 'Intelligence', title: 'Mandatory certifications & QCOs' };
    }
    if (pathname.startsWith('/recommendations')) {
      return { section: 'Intelligence', title: 'Latest recommendations' };
    }
    if (pathname.startsWith('/settings')) {
      return { section: 'Workspace', title: 'Platform settings' };
    }
    return { section: 'Workspace', title: 'Procurement intelligence' };
  };

  const breadcrumb = getBreadcrumb();

  // Keyboard shortcut ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setSearchModalOpen(false);
        setNotifOpen(false);
        setLangMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchSelect = (path: string) => {
    setSearchModalOpen(false);
    router.push(path);
  };

  return (
    <>
      <header className="fixed top-0 left-[280px] right-0 h-[76px] bg-surface-container-lowest border-b border-outline-variant/50 z-40 px-unit-xl flex items-center justify-between gap-unit-lg select-none">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-unit-xs text-on-surface-variant">
          <span className="font-body-sm text-body-sm hover:text-on-surface cursor-pointer">
            {breadcrumb.section}
          </span>
          <span className="material-symbols-outlined text-[16px] text-outline">
            chevron_right
          </span>
          <span className="font-body-sm text-body-sm text-on-surface font-semibold capitalize">
            {breadcrumb.title}
          </span>
        </div>

        {/* Action Elements */}
        <div className="flex items-center gap-unit-lg">
          {/* Quick Search Input */}
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-unit-sm text-[18px] text-outline pointer-events-none">
              search
            </span>
            <input
              className="w-80 h-[38px] pl-9 pr-12 rounded-lg bg-surface border border-outline-variant text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all"
              placeholder="Search standards or analyses..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchModalOpen(true)}
            />
            <kbd
              onClick={() => setSearchModalOpen(true)}
              className="absolute right-unit-sm font-code-sm text-[11px] px-1.5 py-0.5 rounded bg-surface-container border border-outline-variant/60 text-on-surface-variant font-medium cursor-pointer"
            >
              ⌘K
            </kbd>
          </div>

          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-unit-xs px-unit-sm py-1.5 rounded-lg border border-outline-variant text-body-sm font-label-md text-on-surface-variant hover:bg-surface-container transition-colors"
              type="button"
            >
              <span className="font-label-md text-label-md">{selectedLang}</span>
              <span className="material-symbols-outlined text-[14px]">arrow_drop_down</span>
            </button>
            {langMenuOpen && (
              <div className="absolute right-0 mt-1 w-36 bg-surface-container-lowest border border-outline-variant/60 rounded-lg shadow-md py-1 z-50 animate-fade-in-up">
                {['English', 'हिन्दी (Hindi)', 'मराठी (Marathi)', 'தமிழ் (Tamil)'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      setSelectedLang(lang.split(' ')[0]);
                      setLangMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-body-sm text-on-surface hover:bg-surface-container font-medium"
                  >
                    {lang}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications Trigger */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-2 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
              type="button"
              aria-label="View notifications"
            >
              <span className="material-symbols-outlined text-[22px]">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-secondary-container ring-2 ring-surface-container-lowest" />
            </button>
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-surface-container-lowest border border-outline-variant/60 rounded-lg shadow-xl p-3 z-50 animate-fade-in-up">
                <div className="flex items-center justify-between pb-2 border-b border-outline-variant/40">
                  <span className="font-headline-md text-body-sm font-bold text-primary">Gazette &amp; Audit Alerts</span>
                  <span className="font-code-sm text-[11px] px-1.5 py-0.5 rounded bg-secondary-fixed text-secondary font-bold">2 Unread</span>
                </div>
                <div className="divide-y divide-outline-variant/30 py-1">
                  <div className="py-2 text-left cursor-pointer hover:bg-surface-container-low px-1 rounded transition">
                    <div className="text-[12px] font-semibold text-primary">S.O. 458(E) Gazette Notice</div>
                    <div className="text-[11px] text-on-surface-variant">Mandatory ISI mark enforcement for 2026 Procurement is active.</div>
                    <div className="text-[10px] text-outline mt-0.5">14m ago</div>
                  </div>
                  <div className="py-2 text-left cursor-pointer hover:bg-surface-container-low px-1 rounded transition">
                    <div className="text-[12px] font-semibold text-secondary font-medium">17 Outdated Standards Detected</div>
                    <div className="text-[11px] text-on-surface-variant">Review queue contains tenders citing superseded revision codes.</div>
                    <div className="text-[10px] text-outline mt-0.5">2h ago</div>
                  </div>
                </div>
                <Link
                  href="/recommendations"
                  onClick={() => setNotifOpen(false)}
                  className="mt-2 block text-center py-1 text-label-sm font-semibold text-primary hover:underline"
                >
                  View All Recommendations →
                </Link>
              </div>
            )}
          </div>

          <div className="h-6 w-[1px] bg-outline-variant/60" />

          {/* User Profile Summary */}
          <Link href="/settings" className="flex items-center gap-unit-sm cursor-pointer select-none group">
            <img
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover border border-outline-variant/60 group-hover:border-primary-container transition"
              src="/images/priya-rao.jpg"
            />
            <div className="flex flex-col text-left">
              <span className="font-headline-md text-label-md text-primary font-semibold leading-tight group-hover:text-primary-container transition">
                Priya Rao
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant leading-none mt-0.5">
                Procurement Officer
              </span>
            </div>
          </Link>
        </div>
      </header>

      {/* ⌘K Global Quick Search Modal */}
      {searchModalOpen && (
        <div className="fixed inset-0 bg-primary/40 backdrop-blur-xs z-50 flex items-start justify-center pt-24 px-4">
          <div className="bg-surface-container-lowest border border-outline-variant/80 rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in-up">
            <div className="p-4 border-b border-outline-variant/50 flex items-center gap-3">
              <span className="material-symbols-outlined text-outline text-[22px]">search</span>
              <input
                autoFocus
                type="text"
                placeholder="Type a standard number (IS 1180, IS 4984), tender ID, or destination page..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-body-md text-on-surface focus:outline-none bg-transparent placeholder:text-outline"
              />
              <button
                onClick={() => setSearchModalOpen(false)}
                className="font-code-sm text-[11px] px-2 py-1 rounded bg-surface-container text-outline hover:text-on-surface"
              >
                ESC
              </button>
            </div>

            {/* Quick Links / Filtered Results */}
            <div className="p-3 max-h-96 overflow-y-auto space-y-1">
              <div className="px-2 py-1 text-[11px] font-bold text-outline uppercase tracking-wider">
                Quick Navigation
              </div>
              {[
                { title: 'Dashboard', path: '/dashboard', icon: 'dashboard', desc: 'Overview & telemetry' },
                { title: 'New Standards Analysis', path: '/new-analysis', icon: 'add_circle', desc: 'Scan product SOR or RFP' },
                { title: 'Analyzed Documents', path: '/documents', icon: 'description', desc: '28 prior records & audit telemetry' },
                { title: 'Specification Builder', path: '/specification-builder', icon: 'edit_document', desc: '9-part tender drafting workbench' },
                { title: 'Standards Library', path: '/standards-library', icon: 'menu_book', desc: 'Search 1,500+ Indian Standards' },
                { title: 'Mandatory Certifications & QCOs', path: '/certifications', icon: 'verified_user', desc: 'BIS Schemes & CML license check' },
                { title: 'Latest Recommendations', path: '/recommendations', icon: 'explore', desc: 'Superseded standards & anti-tailoring flags' },
              ]
                .filter((item) =>
                  !searchQuery ||
                  item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  item.desc.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((item) => (
                  <button
                    key={item.path}
                    onClick={() => handleSearchSelect(item.path)}
                    className="w-full flex items-center justify-between p-2 rounded hover:bg-surface-container transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[20px] text-primary-container">
                        {item.icon}
                      </span>
                      <div>
                        <div className="font-headline-md text-body-sm font-semibold text-primary">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-on-surface-variant">{item.desc}</div>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-[16px] text-outline">
                      arrow_forward
                    </span>
                  </button>
                ))}

              <div className="pt-2 px-2 py-1 text-[11px] font-bold text-outline uppercase tracking-wider">
                Featured Standards (Quick-Jump)
              </div>
              {[
                { code: 'IS 1180 (Part 1):2014', title: 'Outdoor Distribution Transformers 11kV/433V', qco: true },
                { code: 'IS 4984:2016', title: 'HDPE Pipes for Water Supply (Supersedes 1995)', qco: true },
                { code: 'IS 2026:2011', title: 'Power Transformers General Requirements', qco: false },
                { code: 'IS 10500:2012', title: 'Drinking Water Quality Standards', qco: true },
              ]
                .filter(s => !searchQuery || s.code.toLowerCase().includes(searchQuery.toLowerCase()) || s.title.toLowerCase().includes(searchQuery.toLowerCase()))
                .map(std => (
                  <button
                    key={std.code}
                    onClick={() => handleSearchSelect('/standards-library')}
                    className="w-full flex items-center justify-between p-2 rounded hover:bg-surface-container transition-colors text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-code-sm text-body-sm font-bold text-primary">
                        {std.code}
                      </span>
                      <span className="text-body-sm text-on-surface-variant truncate max-w-sm">
                        {std.title}
                      </span>
                    </div>
                    {std.qco && (
                      <span className="font-label-eyebrow text-[10px] px-1.5 py-0.5 rounded bg-tertiary-fixed text-tertiary font-bold">
                        QCO Mandatory
                      </span>
                    )}
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
