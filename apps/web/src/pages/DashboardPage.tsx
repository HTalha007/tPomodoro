import React from 'react';
import { DashboardStats } from '../components/dashboard/DashboardStats';
import { QuickStartCard } from '../components/dashboard/QuickStartCard';
import { RecentRecords } from '../components/dashboard/RecentRecords';
import { useAuth } from '../hooks/useAuth';
import { useStartRound } from '../hooks/useStartRound';

interface DashboardPageProps {
  onQuickStart: (minutes: number) => void;
  onOpenAuthModal?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onQuickStart,
  onOpenAuthModal,
}) => {
  const { account, isAuthenticated } = useAuth();
  const startRoundMutation = useStartRound();

  const displayName = account
    ? account.email.split('@')[0]
    : 'Misafir';

  const handleQuickStart = async (minutes: number) => {
    if (!isAuthenticated) {
      if (onOpenAuthModal) onOpenAuthModal();
      return;
    }

    try {
      await startRoundMutation.mutateAsync({ plannedMinutes: minutes });
      onQuickStart(minutes);
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Tur başlatılamadı.');
    }
  };

  return (
    <section className="flex flex-col gap-space-lg w-full">
      {/* Quiet Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-space-sm pb-space-sm">
        <div>
          <span className="font-code text-label-sm uppercase tracking-wider text-ink-tertiary">
            Günlük Kayıt Defteri
          </span>
          <h1 className="font-headline text-headline-lg text-ink-primary tracking-tight mt-1 capitalize">
            Hoş geldin, {displayName}.
          </h1>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container text-ink-secondary font-code text-label-sm">
          <span className="w-2 h-2 rounded-full bg-secondary"></span>
          <span>Bilişsel Yük: Düşük</span>
        </div>
      </div>

      {!isAuthenticated && (
        <div className="p-space-md rounded-lg bg-surface-container-low border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-ink-secondary">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-primary">
              info
            </span>
            <span className="font-body text-body-md">
              Kredili dakikalarınızın ve serinizin kaydedilmesi için lütfen oturum açın.
            </span>
          </div>
          {onOpenAuthModal && (
            <button
              onClick={onOpenAuthModal}
              className="px-3.5 py-1.5 bg-accent-rest hover:bg-accent-hover text-accent-ink font-label-md text-label-md font-semibold rounded-lg transition-colors whitespace-nowrap self-start sm:self-auto shadow-sm"
            >
              Giriş / Kayıt
            </button>
          )}
        </div>
      )}

      {/* 3 Metrics in a row */}
      <DashboardStats />

      {/* Quick Action */}
      <QuickStartCard onStart45Min={() => handleQuickStart(45)} />

      {/* Recent Records */}
      <RecentRecords />
    </section>
  );
};
