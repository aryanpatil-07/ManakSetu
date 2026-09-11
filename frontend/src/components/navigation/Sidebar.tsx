'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  name: string;
  href: string;
  icon: string;
  hasBadge?: boolean;
}

const PRIMARY_NAV: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
  { name: 'Tender Scrutiny', href: '/new-analysis', icon: 'troubleshoot', hasBadge: true },
  { name: 'Past Requirements', href: '/past-requirements', icon: 'history' },
  { name: 'Specification Builder', href: '/specification-builder', icon: 'edit_document' },
  { name: 'Standards & QCO Library', href: '/standards-library', icon: 'menu_book' },
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
              alt="IS-Assist ManakSetu Logo"
              className="h-8 w-auto object-contain"
              src="/images/logo.svg"
            />
            <div className="flex flex-col">
              <span className="font-headline-md text-headline-md text-primary font-bold leading-tight">
                ManakSetu
              </span>
              <span className="font-label-eyebrow text-[10px] tracking-[0.1em] text-primary-container uppercase font-semibold leading-none mt-0.5">
                Standards Intelligence
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Section */}
        <div className="p-unit-md flex-1">
          <div className="px-unit-sm mb-unit-xs">
            <span className="font-label-eyebrow text-label-eyebrow uppercase text-on-surface-variant/70 tracking-widest">
              Core Workbenches
            </span>
          </div>
          <nav className="space-y-1">
            {PRIMARY_NAV.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center justify-between px-unit-sm py-2.5 rounded-lg text-body-sm font-body-sm transition-colors ${
                    active
                      ? 'bg-primary-container text-on-primary font-semibold shadow-xs'
                      : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                  }`}
                >
                  <div className="flex items-center">
                    <span
                      className={`material-symbols-outlined text-[20px] mr-unit-md ${
                        active ? 'text-on-primary' : 'text-outline'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span>{item.name}</span>
                  </div>
                  {item.hasBadge && (
                    <span
                      className={`w-2 h-2 rounded-full ${
                        active ? 'bg-secondary-fixed' : 'bg-secondary-container'
                      }`}
                      title="Ready for input"
                    />
                  )}
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
          <span className="material-symbols-outlined text-[20px] mr-unit-md text-outline">
            settings
          </span>
          <span>Settings &amp; Audit Credentials</span>
        </Link>

        {/* Profile Card */}
        <div
          onClick={() => setProfileOpen(!profileOpen)}
          className="flex items-center justify-between p-unit-xs rounded-lg hover:bg-surface-container transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-unit-sm">
            <img
              alt="Priya Rao"
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
                Procurement Officer (DES-8842)
              </span>
            </div>
          </div>
          <button className="p-1 text-outline hover:text-on-surface" type="button" aria-label="Profile actions">
            <span className="material-symbols-outlined text-[18px]">more_horiz</span>
          </button>
        </div>

        {/* Profile Popover */}
        {profileOpen && (
          <div className="absolute bottom-16 left-3 right-3 bg-surface-container-lowest border border-outline-variant/60 rounded-lg shadow-lg p-3 z-50 animate-fade-in-up">
            <div className="pb-2 border-b border-outline-variant/40">
              <div className="font-headline-md text-body-sm font-semibold text-primary">Priya Rao</div>
              <div className="text-[11px] font-mono text-outline">Ministry of Consumer Affairs / BIS</div>
            </div>
            <div className="py-2 space-y-1">
              <div className="text-[11px] text-on-surface-variant flex items-center justify-between">
                <span>DSC Token:</span>
                <span className="text-tertiary-container font-semibold">Active (Class 3)</span>
              </div>
              <div className="text-[11px] text-on-surface-variant flex items-center justify-between">
                <span>GeM Portal Auth:</span>
                <span className="text-tertiary-container font-semibold">Synchronized</span>
              </div>
            </div>
            <Link
              href="/settings"
              onClick={() => setProfileOpen(false)}
              className="mt-2 block w-full text-center py-1 bg-surface-container hover:bg-surface-container-high text-primary rounded text-label-sm font-semibold transition"
            >
              Manage Credentials
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
};
