import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useStartRound } from '../hooks/useStartRound';

interface SetupPageProps {
  onStartFocus: (minutes: number) => void;
  onOpenAuthModal?: () => void;
}

const QUICK_DURATIONS = [15, 25, 45, 60, 90];

export const SetupPage: React.FC<SetupPageProps> = ({
  onStartFocus,
  onOpenAuthModal,
}) => {
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { isAuthenticated } = useAuth();
  const startRoundMutation = useStartRound();

  const calculateCredits = (mins: number) => {
    return (mins / 45).toFixed(1);
  };

  const handleStart = async () => {
    setErrorMessage(null);
    if (!isAuthenticated) {
      if (onOpenAuthModal) {
        onOpenAuthModal();
      }
      return;
    }

    try {
      await startRoundMutation.mutateAsync({ plannedMinutes: durationMinutes });
      onStartFocus(durationMinutes);
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Tur başlatılırken bir hata oluştu.';
      setErrorMessage(Array.isArray(msg) ? msg.join(', ') : msg);
    }
  };

  return (
    <section className="flex flex-col items-center w-full">
      <div className="w-full max-w-xl bg-surface-elevation p-space-xl rounded-lg border border-border-subtle shadow-sm flex flex-col gap-space-xl">
        <div className="text-center flex flex-col gap-1">
          <span className="font-code text-label-sm uppercase tracking-widest text-ink-tertiary">
            Blok Süresi Belirle
          </span>
          <h2 className="font-headline text-headline-lg text-ink-primary font-semibold">
            Zamanlama Ayarı
          </h2>
          <p className="font-body text-body-md text-ink-secondary">
            Zihninizin bölünmeden akışta kalacağı periyodu seçin.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 bg-error-surface text-error-text rounded-lg border border-error/20 font-label-sm text-label-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Big Display */}
        <div className="text-center py-4 bg-canvas-base rounded-xl border border-border-subtle/50">
          <div className="font-code text-display text-ink-primary tracking-tight font-semibold">
            {durationMinutes} DAKİKA
          </div>
          <span className="font-label-sm text-label-sm text-ink-tertiary mt-1 inline-block">
            {calculateCredits(durationMinutes)} Kredi Değeri • Kesintisiz Seans
          </span>
        </div>

        {/* Range Slider */}
        <div className="flex flex-col gap-2">
          <input
            type="range"
            min="15"
            max="180"
            step="5"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(Number(e.target.value))}
            className="w-full h-2 bg-surface-container-high rounded-lg appearance-none cursor-pointer accent-accent-focus"
          />
          <div className="flex justify-between font-code text-label-sm text-ink-tertiary px-1">
            <span>15 dk</span>
            <span>60 dk</span>
            <span>120 dk</span>
            <span>180 dk</span>
          </div>
        </div>

        {/* Quick Duration Buttons */}
        <div className="flex flex-col gap-space-xs">
          <label className="font-label-md text-label-md text-ink-secondary">
            Hızlı Seçimler
          </label>
          <div className="grid grid-cols-5 gap-2">
            {QUICK_DURATIONS.map((mins) => (
              <button
                key={mins}
                onClick={() => setDurationMinutes(mins)}
                className={`py-2 text-center font-code text-code rounded-[4px] transition-colors ${
                  durationMinutes === mins
                    ? 'bg-accent-rest text-accent-ink font-semibold border border-accent-focus/30'
                    : 'bg-surface-container-low hover:bg-surface-container text-ink-primary'
                }`}
              >
                {mins}
              </button>
            ))}
          </div>
        </div>

        {/* Setup Meta Options */}
        <div className="flex items-center justify-between p-3 bg-canvas-base rounded-lg border border-border-subtle/50 text-ink-secondary font-label-md text-label-md">
          <span className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">
              notifications_paused
            </span>
            Derin Sessizlik Modu
          </span>
          <span className="font-code text-label-sm text-success-text bg-success-surface px-2 py-0.5 rounded-[4px]">
            Aktif
          </span>
        </div>

        {/* Start Primary Action */}
        <button
          onClick={handleStart}
          disabled={startRoundMutation.isPending}
          className="w-full py-3.5 bg-accent-rest hover:bg-accent-hover text-accent-ink font-headline text-headline-sm rounded-[6px] transition-all flex items-center justify-center gap-2 shadow-sm font-semibold disabled:opacity-50 cursor-pointer"
        >
          {startRoundMutation.isPending ? (
            <span>Başlatılıyor...</span>
          ) : (
            <>
              <span className="material-symbols-outlined text-[20px]">timer</span>
              <span>Odaklanmaya Başla</span>
            </>
          )}
        </button>
      </div>
    </section>
  );
};
