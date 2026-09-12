'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  // Dynamic Breadcrumb Label
  const getBreadcrumb = () => {
    if (pathname.startsWith('/dashboard') || pathname === '/') {
      return { section: 'Workspace', title: 'Dashboard' };
    }
    if (pathname.startsWith('/new-analysis')) {
      return { section: 'Scrutiny', title: 'Tender Analysis' };
    }
    if (pathname.startsWith('/specification-builder')) {
      return { section: 'Authoring', title: 'Specification Builder' };
    }
    if (pathname.startsWith('/standards-library')) {
      return { section: 'Registry', title: 'Standards Library' };
    }
    if (pathname.startsWith('/settings')) {
      return { section: 'System', title: 'Settings' };
    }
    return { section: 'Workspace', title: 'ManakSetu' };
  };

  const breadcrumb = getBreadcrumb();

  // Keyboard shortcut Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setSearchModalOpen(false);
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
          <span className="text-outline">/</span>
          <span className="font-body-sm text-body-sm text-on-surface font-semibold capitalize">
            {breadcrumb.title}
          </span>
        </div>

        {/* Action Elements */}
        <div className="flex items-center gap-unit-lg">
          {/* Search Input */}
          <div className="relative flex items-center">
            <input
              className="w-80 h-[38px] pl-4 pr-12 rounded-lg bg-surface border border-outline-variant text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all"
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
              Ctrl+K
            </kbd>
          </div>

          <div className="h-6 w-[1px] bg-outline-variant/60" />

          {/* User Profile */}
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
                Officer
              </span>
            </div>
          </Link>
        </div>
      </header>

      {/* Quick Search Modal */}
      {searchModalOpen && (
        <div className="fixed inset-0 bg-primary/40 backdrop-blur-xs z-50 flex items-start justify-center pt-24 px-4">
          <div className="bg-surface-container-lowest border border-outline-variant/80 rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in-up">
            <div className="p-4 border-b border-outline-variant/50 flex items-center gap-3">
              <input
                autoFocus
                type="text"
                placeholder="Search standards, analyses, or navigate..."
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

            {/* Quick Links */}
            <div className="p-3 max-h-96 overflow-y-auto space-y-1">
              <div className="px-2 py-1 text-[11px] font-bold text-outline uppercase tracking-wider">
                Workbenches
              </div>
              {[
                { title: 'Dashboard', path: '/dashboard', desc: 'Overview and metrics' },
                { title: 'Tender Analysis', path: '/new-analysis', desc: 'Audit and scrutiny' },
                { title: 'Specifications', path: '/specification-builder', desc: 'Create clauses' },
                { title: 'Standards', path: '/standards-library', desc: 'Reference library' },
                { title: 'Settings', path: '/settings', desc: 'Configuration' },
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
                    <div>
                      <div className="font-headline-md text-body-sm font-semibold text-primary">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-on-surface-variant">{item.desc}</div>
                    </div>
                  </button>
                ))}

              <div className="pt-2 px-2 py-1 text-[11px] font-bold text-outline uppercase tracking-wider">
                Standards
              </div>
              {[
                { code: 'IS 1180:2014', title: 'Distribution Transformers' },
                { code: 'IS 4984:2016', title: 'HDPE Pipes' },
                { code: 'IS 2026:2011', title: 'Power Transformers' },
                { code: 'IS 10500:2012', title: 'Drinking Water' },
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
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
