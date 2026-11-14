import React from 'react';
import { RoundPhaseContract } from '@tpomodoro/contracts';

interface AbandonConfirmModalProps {
  isOpen: boolean;
  phase: RoundPhaseContract;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const AbandonConfirmModal: React.FC<AbandonConfirmModalProps> = ({
  isOpen,
  phase,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const isHalfCredit = phase === 'focus_after_break';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-primary/20 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md bg-surface-elevation rounded-xl border border-border-subtle shadow-lg p-space-lg flex flex-col gap-space-md"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 text-error-text">
            <span className="material-symbols-outlined text-[24px]">warning</span>
            <h3 className="font-headline text-headline-sm font-semibold text-ink-primary">
              Turu Sonlandır
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-ink-tertiary hover:text-ink-primary p-1 rounded-md transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <p className="font-body text-body-md text-ink-secondary">
          {isHalfCredit
            ? 'İkinci aşamadasınız. Turu şimdi sonlandırırsanız, kural gereği (AC-K07) şu ana kadar biriken sürenin yarısı cüzdanınıza kredilendirilir ve seans kapatılır.'
            : 'Mola öncesi veya mola kararındasınız. Kural gereği (AC-K06) bu aşamada turu sonlandırırsanız bu tur için 0 kredi yazılır.'}
        </p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-ink-primary font-label-md text-label-md transition-colors border border-border-subtle"
          >
            Odakta Kal
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg bg-error-surface hover:bg-error-surface/80 text-error-text font-label-md text-label-md font-medium transition-colors border border-error-text/20 flex items-center gap-2"
          >
            {isLoading && (
              <span className="inline-block w-3.5 h-3.5 border-2 border-error-text border-t-transparent rounded-full animate-spin"></span>
            )}
            <span>Turu Bırak</span>
          </button>
        </div>
      </div>
    </div>
  );
};
