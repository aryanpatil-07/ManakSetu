'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  name: string;
  href: string;
}

const PRIMARY_NAV: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Tender Analysis', href: '/new-analysis' },
  { name: 'Past Requirements', href: '/past-requirements' },
  { name: 'Specifications', href: '/specification-builder' },
  { name: 'Standards Library', href: '/standards-library' },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/dashboard' && (pathname === '/' || pathname === '/dashboard')) return true;
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-[280px] bg-surface-container-lowest border-r border-outline-variant/50 z-50 flex flex-col justify-between select-none">
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* Brand Header */}
        <div className="h-[76px] px-unit-xl border-b border-outline-variant/50 flex items-center gap-unit-md">
          <Link href="/dashboard" className="flex items-center gap-unit-md">
            <img
              alt="ManakSetu Logo"
              className="h-8 w-auto object-contain"
              src="/images/logo.svg"
            />
            <div className="flex flex-col">
              <span className="font-headline-md text-headline-md text-primary font-bold leading-tight">
                ManakSetu
              </span>
              <span className="font-label-eyebrow text-[10px] tracking-[0.1em] text-primary-container uppercase font-semibold leading-none mt-0.5">
                Standards
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Section */}
        <div className="p-unit-md flex-1">
          <div className="px-unit-sm mb-unit-xs">
            <span className="font-label-eyebrow text-label-eyebrow uppercase text-on-surface-variant/70 tracking-widest">
              Workbenches
            </span>
          </div>
          <nav className="space-y-1">
            {PRIMARY_NAV.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-unit-sm py-2.5 rounded-lg text-body-sm font-body-sm transition-colors ${
                    active
                      ? 'bg-primary-container text-on-primary font-semibold shadow-xs'
                      : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                  }`}
                >
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer Settings & Officer Profile */}
      <div className="p-unit-md border-t border-outline-variant/50 relative">
        <Link
          href="/settings"
          className={`flex items-center px-unit-sm py-2 rounded-lg font-body-sm text-body-sm transition-colors mb-unit-sm ${
            pathname.startsWith('/settings')
              ? 'bg-primary-container text-on-primary font-semibold'
              : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
          }`}
        >
          <span>Settings</span>
        </Link>

        {/* Profile Card */}
        <div
          onClick={() => setProfileOpen(!profileOpen)}
          className="flex items-center justify-between p-unit-xs rounded-lg hover:bg-surface-container transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-unit-sm">
            <img
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover border border-outline-variant/60"
              src="/images/priya-rao.jpg"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="flex flex-col">
              <span className="font-headline-md text-label-md text-primary font-semibold leading-tight">
                Priya Rao
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant leading-none mt-0.5">
                Officer
              </span>
            </div>
          </div>
        </div>

        {/* Profile Popover */}
        {profileOpen && (
          <div className="absolute bottom-16 left-3 right-3 bg-surface-container-lowest border border-outline-variant/60 rounded-lg shadow-lg p-3 z-50 animate-fade-in-up">
            <div className="pb-2 border-b border-outline-variant/40">
              <div className="font-headline-md text-body-sm font-semibold text-primary">Priya Rao</div>
              <div className="text-[11px] font-mono text-outline">Officer</div>
            </div>
            <Link
              href="/settings"
              onClick={() => setProfileOpen(false)}
              className="mt-2 block w-full text-center py-1 bg-surface-container hover:bg-surface-container-high text-primary rounded text-label-sm font-semibold transition"
            >
              Settings
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
};
