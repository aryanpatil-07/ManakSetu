'use client';

import React from 'react';
import { Sidebar } from '@/components/navigation/Sidebar';
import { Header } from '@/components/navigation/Header';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background text-on-surface flex">
      {/* 280px Persistent Left Rail */}
      <Sidebar />

      {/* Main Workspace Frame */}
      <div className="pl-[280px] flex-1 flex flex-col min-w-0">
        {/* 76px Fixed Top Header */}
        <Header />

        {/* Scrollable Main Content Workbench */}
        <main className="w-full pt-[76px] bg-background min-h-screen">
          <div className="w-full p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
