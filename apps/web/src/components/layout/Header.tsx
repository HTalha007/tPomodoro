import React from 'react';
import { useAuth } from '../../hooks/useAuth';

export type TabType = 'dashboard' | 'setup' | 'active-timer' | 'coworking';

interface HeaderProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onOpenAuthModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenAuthModal,
}) => {
  const { account, isAuthenticated, logout } = useAuth();
  const username = account ? `@${account.email.split('@')[0]}` : 'Misafir';

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-canvas-base border-b border-border-subtle">
      <div className="h-16 max-w-7xl mx-auto px-margin flex items-center justify-between gap-gutter">
        <div className="flex items-center gap-space-lg">
          <div className="flex items-center gap-space-sm">
            <span className="font-headline text-headline-sm text-ink-primary font-semibold tracking-tight">
              tPomodoro
            </span>
            <span className="px-1.5 py-0.5 rounded border border-border-subtle bg-surface-container-low font-code text-[11px] leading-none text-ink-secondary tracking-normal">
              v2.5 // FSM
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-space-xs">
            <button
              onClick={() => onTabChange('dashboard')}
              className={`px-3 py-1.5 rounded-lg transition-colors font-label-md text-label-md ${
                activeTab === 'dashboard'
                  ? 'bg-accent-rest text-accent-ink font-semibold'
                  : 'text-ink-secondary hover:text-ink-primary hover:bg-surface-container-low'
              }`}
            >
              Kontrol Paneli
            </button>
            <button
              onClick={() => onTabChange('setup')}
              className={`px-3 py-1.5 rounded-lg transition-colors font-label-md text-label-md ${
                activeTab === 'setup'
                  ? 'bg-accent-rest text-accent-ink font-semibold'
                  : 'text-ink-secondary hover:text-ink-primary hover:bg-surface-container-low'
              }`}
            >
              Kurulum
            </button>
            <button
              onClick={() => onTabChange('active-timer')}
              className={`px-3 py-1.5 rounded-lg transition-colors font-label-md text-label-md ${
                activeTab === 'active-timer'
                  ? 'bg-accent-rest text-accent-ink font-semibold'
                  : 'text-ink-secondary hover:text-ink-primary hover:bg-surface-container-low'
              }`}
            >
              Aktif Zamanlayıcı
            </button>
            <button
              onClick={() => onTabChange('coworking')}
              className={`px-3 py-1.5 rounded-lg transition-colors font-label-md text-label-md ${
                activeTab === 'coworking'
                  ? 'bg-accent-rest text-accent-ink font-semibold'
                  : 'text-ink-secondary hover:text-ink-primary hover:bg-surface-container-low'
              }`}
            >
              Birlikte Çalışma
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-space-md">
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-space-sm px-2.5 py-1.5 rounded-lg border border-border-subtle bg-surface-elevation">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
                </span>
                <span className="font-code text-code text-ink-primary font-medium tracking-tight">
                  {username}
                </span>
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-[18px]">
                    person
                  </span>
                </div>
              </div>

              <button
                onClick={() => logout()}
                className="p-1.5 text-ink-tertiary hover:text-error-text transition-colors rounded-lg hover:bg-surface-container-low"
                title="Çıkış Yap"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="px-3.5 py-1.5 bg-accent-rest hover:bg-accent-hover text-accent-ink font-label-md text-label-md font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">login</span>
              <span>Giriş Yap</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
