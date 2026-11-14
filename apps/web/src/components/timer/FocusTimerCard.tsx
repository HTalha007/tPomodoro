import React, { useState, useEffect } from 'react';

interface FocusTimerCardProps {
  phaseLabel?: string;
  phaseSubLabel?: string;
  formattedTime?: string;
  percent?: number;
  plannedMinutes?: number;
  breakAfterMinutes?: number;
  isSecondHalf?: boolean;
  onEarlyExit?: () => void;
  // Standalone preview fallbacks
  initialSeconds?: number;
  onFinishPhase?: () => void;
}

export const FocusTimerCard: React.FC<FocusTimerCardProps> = ({
  phaseLabel = 'FAZ 1 // DERİN BLOK',
  phaseSubLabel = 'Bildirimler bastırıldı. Zihnini tek bir amaca kitle.',
  formattedTime: propFormattedTime,
  percent: propPercent,
  plannedMinutes = 45,
  breakAfterMinutes = 30,
  isSecondHalf = false,
  onEarlyExit,
  initialSeconds = 38 * 60 + 42,
  onFinishPhase,
}) => {
  // Local fallback state if no propFormattedTime passed (preview mode)
  const [localSecondsLeft, setLocalSecondsLeft] = useState<number>(initialSeconds);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  useEffect(() => {
    if (propFormattedTime !== undefined || isPaused) return;
    const interval = setInterval(() => {
      setLocalSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused, propFormattedTime]);

  const localMinutes = Math.floor(localSecondsLeft / 60);
  const localSeconds = localSecondsLeft % 60;
  const localFormatted = `${String(localMinutes).padStart(2, '0')}:${String(
    localSeconds
  ).padStart(2, '0')}`;

  const displayTime = propFormattedTime ?? localFormatted;

  // Circumference = 2 * PI * 44 = 276.46
  const total = 45 * 60;
  const calculatedPercent =
    propPercent !== undefined
      ? propPercent
      : ((total - localSecondsLeft) / total) * 100;

  const strokeDashoffset = Math.max(
    0,
    Math.min(276.46, 276.46 - (calculatedPercent / 100) * 276.46)
  );

  return (
    <div className="w-full max-w-xl bg-surface-elevation p-space-xl rounded-lg border border-border-subtle shadow-sm flex flex-col items-center justify-center text-center gap-space-lg transition-all">
      <div className="flex flex-col items-center gap-1">
        <span className="font-code text-label-sm uppercase tracking-widest text-ink-tertiary">
          {phaseLabel}
        </span>
        <p className="font-body text-body-md text-ink-secondary max-w-md">
          {phaseSubLabel}
        </p>
      </div>

      {/* Circular Progress with JetBrains Mono Typography */}
      <div className="relative w-64 h-64 flex items-center justify-center my-2">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            fill="transparent"
            r="44"
            stroke="#efeeea"
            strokeWidth="3"
          />
          <circle
            className="transition-all duration-1000"
            cx="50"
            cy="50"
            fill="transparent"
            r="44"
            stroke="#4356a7"
            strokeDasharray="276.46"
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            strokeWidth="3"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-code text-[42px] leading-none text-ink-primary tracking-tighter font-semibold">
            {displayTime}
          </span>
          <span className="font-code text-[11px] text-ink-tertiary uppercase mt-2 tracking-wider">
            {isSecondHalf ? 'Kalan Tur Süresi' : 'Mola Eşiğine Kalan'}
          </span>
        </div>
      </div>

      {/* Protocol Badge & Meta */}
      <div className="flex items-center gap-4 text-ink-tertiary font-code text-label-sm">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-accent-rest animate-pulse"></span>
          Plan: {plannedMinutes} Dk
        </span>
        <span>•</span>
        <span>
          {isSecondHalf
            ? 'Tamamlama Fazı (Tam Kredi)'
            : `Mola Noktası: ${breakAfterMinutes}. Dk`}
        </span>
      </div>

      {/* Interactive Controls */}
      <div className="flex items-center gap-4 w-full justify-center mt-1">
        {onFinishPhase && (
          <button
            onClick={onFinishPhase}
            className="px-5 py-2 rounded-lg bg-accent-rest hover:bg-accent-hover text-accent-ink font-label-md text-label-md transition-colors flex items-center gap-2 font-medium"
          >
            <span className="material-symbols-outlined text-[18px]">skip_next</span>
            Fazı Bitir (Önizleme)
          </button>
        )}

        <button
          onClick={onEarlyExit}
          className="font-label-sm text-label-sm text-ink-tertiary hover:text-error-text transition-colors flex items-center gap-1.5 py-1 px-3 rounded hover:bg-error-surface/30"
        >
          <span className="material-symbols-outlined text-[16px]">logout</span>
          {isSecondHalf ? 'Turu Erken Bitir (Yarım Kredi)' : 'Turu İptal Et (0 Kredi)'}
        </button>
      </div>
    </div>
  );
};
