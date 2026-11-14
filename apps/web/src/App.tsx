import React, { useState } from 'react';
import { Header, TabType } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { DashboardPage } from './pages/DashboardPage';
import { SetupPage } from './pages/SetupPage';
import { ActiveTimerPage } from './pages/ActiveTimerPage';
import { CoworkingRoomPage } from './pages/CoworkingRoomPage';
import { AuthModal } from './components/auth/AuthModal';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  const handleQuickStart = (minutes: number) => {
    setActiveTab('active-timer');
  };

  const handleStartFocus = (minutes: number) => {
    setActiveTab('active-timer');
  };

  return (
    <div className="min-h-screen bg-canvas-base text-ink-primary font-body flex flex-col antialiased">
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      <main className="flex-1 w-full pt-20 pb-12 bg-canvas-base">
        <div className="max-w-5xl mx-auto w-full px-margin flex flex-col gap-space-xl">
          {/* Mobile Tab Navigation */}
          <div className="w-full flex justify-center md:hidden">
            <div className="inline-flex p-1 bg-surface-container-low rounded-xl gap-1 border border-border-subtle shadow-sm">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 rounded-lg font-label-md text-label-md transition-all ${
                  activeTab === 'dashboard'
                    ? 'text-accent-ink bg-accent-rest font-semibold shadow-sm'
                    : 'text-ink-secondary hover:text-ink-primary hover:bg-surface-elevation'
                }`}
              >
                Kontrol Paneli
              </button>
              <button
                onClick={() => setActiveTab('setup')}
                className={`px-4 py-2 rounded-lg font-label-md text-label-md transition-all ${
                  activeTab === 'setup'
                    ? 'text-accent-ink bg-accent-rest font-semibold shadow-sm'
                    : 'text-ink-secondary hover:text-ink-primary hover:bg-surface-elevation'
                }`}
              >
                Kurulum
              </button>
              <button
                onClick={() => setActiveTab('active-timer')}
                className={`px-4 py-2 rounded-lg font-label-md text-label-md transition-all ${
                  activeTab === 'active-timer'
                    ? 'text-accent-ink bg-accent-rest font-semibold shadow-sm'
                    : 'text-ink-secondary hover:text-ink-primary hover:bg-surface-elevation'
                }`}
              >
                Aktif Zamanlayıcı
              </button>
              <button
                onClick={() => setActiveTab('coworking')}
                className={`px-4 py-2 rounded-lg font-label-md text-label-md transition-all ${
                  activeTab === 'coworking'
                    ? 'text-accent-ink bg-accent-rest font-semibold shadow-sm'
                    : 'text-ink-secondary hover:text-ink-primary hover:bg-surface-elevation'
                }`}
              >
                Birlikte Çalışma
              </button>
            </div>
          </div>

          {/* Tab Views */}
          {activeTab === 'dashboard' && (
            <DashboardPage
              onQuickStart={handleQuickStart}
              onOpenAuthModal={() => setIsAuthModalOpen(true)}
            />
          )}
          {activeTab === 'setup' && (
            <SetupPage
              onStartFocus={handleStartFocus}
              onOpenAuthModal={() => setIsAuthModalOpen(true)}
            />
          )}
          {activeTab === 'active-timer' && (
            <ActiveTimerPage
              onNavigateToSetup={() => setActiveTab('setup')}
              onOpenAuthModal={() => setIsAuthModalOpen(true)}
            />
          )}
          {activeTab === 'coworking' && (
            <CoworkingRoomPage onOpenAuthModal={() => setIsAuthModalOpen(true)} />
          )}
        </div>
      </main>

      <Footer />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export default App;
