import React, { useState, useEffect } from 'react';

interface BreakDecisionCardProps {
  formattedTime?: string;
  percent?: number;
  canResume?: boolean;
  breakSecondsLeft?: number;
  plannedMinutes?: number;
  breakLengthMinutes?: number;
  breakAfterMinutes?: number;
  onContinueCycle?: () => void;
  onSealAndExit?: () => void;
  isResuming?: boolean;
  isAbandoning?: boolean;
  // Standalone fallback
  initialBreakSeconds?: number;
}

export const BreakDecisionCard: React.FC<BreakDecisionCardProps> = ({
  formattedTime: propFormattedTime,
  percent: propPercent,
  canResume: propCanResume,
  breakSecondsLeft: propBreakSecondsLeft,
  plannedMinutes = 45,
  breakLengthMinutes = 5,
  breakAfterMinutes = 30,
  onContinueCycle,
  onSealAndExit,
  isResuming = false,
  isAbandoning = false,
  initialBreakSeconds = 298, // 04:58 default preview
}) => {
  // Local fallback if no props provided (preview mode)
  const [localSecondsLeft, setLocalSecondsLeft] = useState<number>(initialBreakSeconds);
  const totalBreakSeconds = breakLengthMinutes * 60;

  useEffect(() => {
    if (propFormattedTime !== undefined) return;
    const interval = setInterval(() => {
      setLocalSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [propFormattedTime]);

  const localMinutes = Math.floor(localSecondsLeft / 60);
  const localSeconds = localSecondsLeft % 60;
  const localFormatted = `${String(localMinutes).padStart(2, '0')}:${String(
    localSeconds
  ).padStart(2, '0')}`;

  const displayTime = propFormattedTime ?? localFormatted;
  const currentSecondsLeft = propBreakSecondsLeft ?? localSecondsLeft;
  const isResumeAllowed = propCanResume !== undefined ? propCanResume : localSecondsLeft <= 0;

  const calculatedPercent =
    propPercent !== undefined
      ? propPercent
      : ((totalBreakSeconds - localSecondsLeft) / totalBreakSeconds) * 100;

  return (
    <div className="w-full max-w-2xl bg-vault-base p-space-xl rounded-lg border border-vault-outline shadow-sm flex flex-col items-center justify-center text-center gap-space-lg transition-all animate-fade-in">
      {/* Breadcrumb Archival Protocol Stamp */}
      <div className="flex items-center gap-space-sm text-vault-ink opacity-80">
        <span className="font-code text-label-sm tracking-wider uppercase">
          FSM_GATE_ID: 0x4B9E // BLOK: #{plannedMinutes}M
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-vault-outline"></span>
        <span className="font-code text-label-sm tracking-wider text-secondary font-medium">
          {isResumeAllowed ? 'MOLA TAMAMLANDI // GEÇİŞ SERBEST' : 'MOLA AKTİF // EŞİK KİLİTLİ'}
        </span>
      </div>

      <div className="flex flex-col items-center gap-1">
        <div className="w-12 h-12 rounded-full bg-vault-surface flex items-center justify-center text-vault-ink mb-1 border border-vault-outline">
          <span className="material-symbols-outlined text-[24px]">
            {isResumeAllowed ? 'lock_open' : 'self_improvement'}
          </span>
        </div>
        <span className="font-code text-label-sm uppercase tracking-widest text-vault-ink font-semibold">
          MOLA &amp; KARAR FAZI // FSM: STATE_DECISION_GATE
        </span>
        <h2 className="font-headline text-headline-lg text-vault-ink tracking-tight font-semibold mt-1">
          {isResumeAllowed ? 'Mola Tamamlandı: Karar Noktası' : 'Mola Zamanı & Dinlenme'}
        </h2>
        <p className="font-body text-body-md text-vault-ink max-w-sm mt-1">
          {isResumeAllowed
            ? 'Mola süresi doldu. Şimdi ikinci yarıya devam edebilir veya seansı kapatabilirsiniz.'
            : `${breakAfterMinutes} dakikalık ilk odak tamamlandı. Zihnini dinlendir (Kural AC-K04).`}
        </p>
      </div>

      {/* Monolithic Monospace Timer */}
      <div className="my-space-sm flex flex-col items-center select-none">
        <div className="font-code text-[72px] sm:text-[96px] leading-none font-normal tracking-tighter text-vault-ink">
          {isResumeAllowed ? '00:00' : displayTime}
        </div>
        <div className="flex items-center gap-3 mt-space-sm font-code text-label-sm text-secondary">
          <span className="px-2 py-0.5 rounded bg-surface-elevation text-vault-ink font-medium border border-vault-outline/30">
            {isResumeAllowed ? 'SÜRE DOLDU' : 'MOLA GERİ SAYIMI'}
          </span>
          <span>
            {isResumeAllowed
              ? 'Turu Katla butonu aktif'
              : `Devam için kalan mola: ${displayTime}`}
          </span>
        </div>
      </div>

      {/* Archival Progress Bar */}
      <div className="w-full max-w-md h-2 bg-vault-surface rounded-full my-space-xs overflow-hidden p-0.5 border border-vault-outline/40">
        <div
          className="h-full bg-secondary rounded-full transition-all duration-1000"
          style={{ width: `${Math.min(100, Math.max(0, calculatedPercent))}%` }}
        ></div>
      </div>

      {/* Decision Buttons */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-space-md max-w-xl mt-2">
        {/* Primary: Continue and Compound */}
        <button
          onClick={onContinueCycle}
          disabled={!isResumeAllowed || isResuming}
          type="button"
          className={`group relative flex flex-col items-start justify-center p-5 rounded-md text-left transition-all duration-150 border shadow-sm ${
            isResumeAllowed
              ? 'bg-vault-outline hover:bg-secondary-container text-vault-ink border-secondary/40 active:scale-[0.99] cursor-pointer'
              : 'bg-vault-surface/60 text-vault-ink/50 border-vault-outline/40 cursor-not-allowed opacity-60'
          }`}
        >
          <div className="flex items-center justify-between w-full mb-1">
            <span className="font-headline text-headline-sm font-semibold tracking-tight flex items-center gap-1.5">
              {isResuming ? 'Geçiş Yapılıyor...' : 'Devam Et (Turu Katla)'}
              <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-1">
                {isResumeAllowed ? 'trending_up' : 'lock'}
              </span>
            </span>
            <span className="font-code text-[11px] px-1.5 py-0.5 rounded bg-vault-surface text-vault-ink font-medium border border-vault-outline/50">
              {isResumeAllowed ? 'AKTİF' : `KİLİTLİ (${displayTime})`}
            </span>
          </div>
          <span className="font-body text-body-md opacity-90">
            {isResumeAllowed
              ? `Kalan ${plannedMinutes - breakAfterMinutes} Dk Seansı Başlat • Tam Kredi Hedefi`
              : 'Mola bitmeden erken devam kural gereği kilitlidir (AC-K04)'}
          </span>
        </button>

        {/* Secondary: Seal and Conclude */}
        <button
          onClick={onSealAndExit}
          disabled={isAbandoning}
          type="button"
          className="group relative flex flex-col items-start justify-center p-5 rounded-md text-left bg-surface-elevation hover:bg-vault-surface transition-all duration-150 active:scale-[0.99] border border-vault-outline shadow-sm cursor-pointer"
        >
          <div className="flex items-center justify-between w-full mb-1">
            <span className="font-headline text-headline-sm font-semibold text-vault-ink tracking-tight flex items-center gap-1.5">
              {isAbandoning ? 'İşleniyor...' : 'Turu Bırak (Kapat)'}
              <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-1">
                logout
              </span>
            </span>
            <span className="font-code text-[11px] px-1.5 py-0.5 rounded bg-surface-container-low text-secondary font-medium">
              AC-K06
            </span>
          </div>
          <span className="font-body text-body-md text-secondary">
            Mola kararında turu bırakma • 0 Kredi Yazılır
          </span>
        </button>
      </div>

      {/* Metrics Summary Bar */}
      <div className="w-full bg-surface-elevation rounded-md p-space-md border border-vault-outline/50 mt-2">
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-vault-outline/50 text-center">
          <div className="px-space-md py-space-xs flex flex-col items-center justify-center">
            <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider mb-0.5">
              Tamamlanan Blok
            </span>
            <span className="font-code text-headline-sm text-headline-sm font-semibold text-vault-ink">
              {breakAfterMinutes} Dk
            </span>
            <span className="font-code text-[11px] text-secondary mt-0.5">
              Planın 2/3 Eşiği
            </span>
          </div>
          <div className="px-space-md py-space-xs flex flex-col items-center justify-center">
            <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider mb-0.5">
              Mola Süresi
            </span>
            <span className="font-code text-headline-sm text-headline-sm font-semibold text-vault-ink">
              {String(breakLengthMinutes).padStart(2, '0')}:00
            </span>
            <span className="font-code text-[11px] text-secondary mt-0.5">
              {breakLengthMinutes >= 15 ? 'Uzun Mola' : 'Kısa Mola'}
            </span>
          </div>
          <div className="px-space-md py-space-xs flex flex-col items-center justify-center">
            <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider mb-0.5">
              Toplam Plan
            </span>
            <span className="font-code text-headline-sm text-headline-sm font-semibold text-vault-ink">
              {plannedMinutes} Dk
            </span>
            <span className="font-code text-[11px] text-secondary mt-0.5">
              Protokol P-{plannedMinutes}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
