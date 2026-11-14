import React, { useState } from 'react';
import { FocusTimerCard } from '../components/timer/FocusTimerCard';
import { BreakDecisionCard } from '../components/timer/BreakDecisionCard';
import { AbandonConfirmModal } from '../components/timer/AbandonConfirmModal';
import {
  useCurrentSession,
  useTimerCountdown,
  useResumeRound,
  useAbandonRound,
  useStartRound,
  useAuth,
} from '../hooks';

interface ActiveTimerPageProps {
  onNavigateToSetup?: () => void;
  onOpenAuthModal?: () => void;
}

export const ActiveTimerPage: React.FC<ActiveTimerPageProps> = ({
  onNavigateToSetup,
  onOpenAuthModal,
}) => {
  const { isAuthenticated } = useAuth();
  const { data: session, isLoading, refetch } = useCurrentSession();
  const resumeMutation = useResumeRound();
  const abandonMutation = useAbandonRound();
  const startRoundMutation = useStartRound();

  const [isAbandonModalOpen, setIsAbandonModalOpen] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewPhase, setPreviewPhase] = useState<'focus' | 'break'>('focus');

  const activeRound = session?.hasActiveRound ? session.round : null;

  const countdown = useTimerCountdown({
    round: activeRound,
    serverNow: session?.serverNow,
    onThresholdReached: () => {
      // Re-evaluate round progression on server when countdown reaches zero
      refetch();
    },
  });

  const handleConfirmAbandon = () => {
    abandonMutation.mutate(undefined, {
      onSettled: () => {
        setIsAbandonModalOpen(false);
      },
    });
  };

  const handleQuickStart = (minutes: number) => {
    if (!isAuthenticated) {
      if (onOpenAuthModal) onOpenAuthModal();
      return;
    }
    startRoundMutation.mutate({ plannedMinutes: minutes });
  };

  if (isLoading) {
    return (
      <section className="flex flex-col items-center justify-center w-full py-16 gap-3">
        <div className="w-8 h-8 border-2 border-accent-rest border-t-transparent rounded-full animate-spin"></div>
        <span className="font-code text-label-sm text-ink-tertiary">
          Oturum durumu kontrol ediliyor...
        </span>
      </section>
    );
  }

  // Preview Mode for inspecting design layouts without active DB session
  if (isPreviewMode) {
    return (
      <section className="flex flex-col items-center w-full">
        <div className="mb-space-lg flex items-center gap-3">
          <div className="flex items-center gap-2 p-1 bg-surface-container-low rounded-full border border-border-subtle">
            <button
              onClick={() => setPreviewPhase('focus')}
              className={`px-4 py-1.5 rounded-full font-label-md text-label-md transition-all ${
                previewPhase === 'focus'
                  ? 'bg-surface-elevation text-ink-primary shadow-sm font-semibold'
                  : 'text-ink-secondary hover:text-ink-primary'
              }`}
            >
              Odak Fazı (Statik)
            </button>
            <button
              onClick={() => setPreviewPhase('break')}
              className={`px-4 py-1.5 rounded-full font-label-md text-label-md transition-all ${
                previewPhase === 'break'
                  ? 'bg-vault-surface text-vault-ink shadow-sm font-semibold border border-vault-outline'
                  : 'text-ink-secondary hover:text-ink-primary'
              }`}
            >
              Mola &amp; Karar Fazı (Statik)
            </button>
          </div>
          <button
            onClick={() => setIsPreviewMode(false)}
            className="text-label-sm font-label-sm text-ink-tertiary hover:text-ink-primary underline underline-offset-4"
          >
            Canlı Moda Dön
          </button>
        </div>

        {previewPhase === 'focus' ? (
          <FocusTimerCard
            onFinishPhase={() => setPreviewPhase('break')}
            onEarlyExit={() => alert('Önizleme: Erken çıkış simülasyonu')}
          />
        ) : (
          <BreakDecisionCard
            onContinueCycle={() => {
              alert('Önizleme: Devam et simülasyonu');
              setPreviewPhase('focus');
            }}
            onSealAndExit={() => alert('Önizleme: Kapatma simülasyonu')}
          />
        )}
      </section>
    );
  }

  // Standby State: No active round
  if (!activeRound) {
    return (
      <section className="flex flex-col items-center justify-center w-full py-12 gap-space-lg text-center">
        {session?.round?.phase === 'closed' && session.round.outcome === 'full' && (
          <div className="p-space-md rounded-xl bg-vault-surface border border-vault-outline max-w-md w-full flex items-center gap-3 text-vault-ink shadow-sm animate-fade-in mb-2">
            <div className="w-10 h-10 rounded-full bg-vault-base border border-vault-outline flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px]">verified</span>
            </div>
            <div className="text-left">
              <p className="font-headline text-headline-sm font-semibold">Tebrikler! Seans Tamamlandı</p>
              <p className="font-body text-body-sm text-vault-ink/80">
                +{session.round.plannedSeconds / 60} kredili dakika cüzdanınıza mühürlendi.
              </p>
            </div>
          </div>
        )}

        <div className="w-16 h-16 rounded-full bg-surface-container-low border border-border-subtle flex items-center justify-center text-ink-tertiary">
          <span className="material-symbols-outlined text-[32px]">timer</span>
        </div>

        <div className="flex flex-col items-center gap-1 max-w-md">
          <h2 className="font-headline text-headline-md font-semibold text-ink-primary tracking-tight">
            Aktif Odak Seansı Yok
          </h2>
          <p className="font-body text-body-md text-ink-secondary">
            Şu anda açık bir odak seansı bulunmuyor. Yeni bir tur başlatıp kredili
            dakika kazanmaya başlayabilirsiniz.
          </p>
        </div>

        {!isAuthenticated ? (
          <div className="p-space-md rounded-lg bg-surface-container-low border border-border-subtle max-w-md flex flex-col items-center gap-2">
            <span className="font-body text-body-sm text-ink-secondary">
              Turlarınızın cüzdanınıza kaydedilmesi ve seri sayılması için oturum açmalısınız.
            </span>
            <button
              onClick={onOpenAuthModal}
              className="px-4 py-2 rounded-lg bg-accent-rest hover:bg-accent-hover text-accent-ink font-label-md text-label-md font-medium transition-colors"
            >
              Giriş Yap / Kayıt Ol
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-space-md">
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleQuickStart(25)}
                disabled={startRoundMutation.isPending}
                className="px-4 py-2 rounded-lg bg-surface-elevation hover:bg-surface-container-low border border-border-subtle text-ink-primary font-code text-label-md transition-colors"
              >
                25 Dk Başlat
              </button>
              <button
                onClick={() => handleQuickStart(45)}
                disabled={startRoundMutation.isPending}
                className="px-5 py-2.5 rounded-lg bg-accent-rest hover:bg-accent-hover text-accent-ink font-label-md text-label-md font-semibold shadow-sm transition-colors"
              >
                45 Dk Başlat (Önerilen)
              </button>
              <button
                onClick={() => handleQuickStart(90)}
                disabled={startRoundMutation.isPending}
                className="px-4 py-2 rounded-lg bg-surface-elevation hover:bg-surface-container-low border border-border-subtle text-ink-primary font-code text-label-md transition-colors"
              >
                90 Dk Başlat
              </button>
            </div>

            {onNavigateToSetup && (
              <button
                onClick={onNavigateToSetup}
                className="font-label-sm text-label-sm text-ink-tertiary hover:text-ink-primary underline underline-offset-4"
              >
                Özel Süre Kurulumuna Git
              </button>
            )}
          </div>
        )}

        <button
          onClick={() => setIsPreviewMode(true)}
          className="mt-6 font-code text-[12px] text-ink-tertiary hover:text-ink-secondary underline"
        >
          Tasarım Önizleme Modunu Aç
        </button>
      </section>
    );
  }

  // Active Round: Server State Machine Rendering
  const plannedMinutes = activeRound.plannedSeconds / 60;
  const breakAfterMinutes = activeRound.breakAfterSeconds / 60;
  const breakLengthMinutes = activeRound.breakLengthSeconds / 60;

  return (
    <section className="flex flex-col items-center w-full">
      {/* Active Phase Status Ribbon */}
      <div className="mb-space-md flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container-low border border-border-subtle text-ink-secondary font-code text-label-sm">
        <span className="w-2 h-2 rounded-full bg-accent-rest animate-ping"></span>
        <span>CANLI SEANS</span>
        <span>•</span>
        <span>Plan: {plannedMinutes} Dk</span>
        <span>•</span>
        <span>Faz: {activeRound.phase}</span>
      </div>

      {activeRound.phase === 'awaiting_decision' ? (
        <BreakDecisionCard
          formattedTime={countdown.formattedTime}
          percent={countdown.percent}
          canResume={countdown.canResume}
          breakSecondsLeft={countdown.secondsLeft}
          plannedMinutes={plannedMinutes}
          breakLengthMinutes={breakLengthMinutes}
          breakAfterMinutes={breakAfterMinutes}
          onContinueCycle={() => resumeMutation.mutate()}
          onSealAndExit={() => setIsAbandonModalOpen(true)}
          isResuming={resumeMutation.isPending}
          isAbandoning={abandonMutation.isPending}
        />
      ) : (
        <FocusTimerCard
          phaseLabel={countdown.phaseLabel}
          phaseSubLabel={countdown.phaseSubLabel}
          formattedTime={countdown.formattedTime}
          percent={countdown.percent}
          plannedMinutes={plannedMinutes}
          breakAfterMinutes={breakAfterMinutes}
          isSecondHalf={activeRound.phase === 'focus_after_break'}
          onEarlyExit={() => setIsAbandonModalOpen(true)}
        />
      )}

      {/* Confirmation Modal for Abandoning (AC-K06 / AC-K07) */}
      <AbandonConfirmModal
        isOpen={isAbandonModalOpen}
        phase={activeRound.phase}
        onClose={() => setIsAbandonModalOpen(false)}
        onConfirm={handleConfirmAbandon}
        isLoading={abandonMutation.isPending}
      />
    </section>
  );
};
