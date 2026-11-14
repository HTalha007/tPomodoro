import React from 'react';

interface QuickStartCardProps {
  onStart45Min?: () => void;
}

export const QuickStartCard: React.FC<QuickStartCardProps> = ({ onStart45Min }) => {
  return (
    <div className="bg-surface-elevation p-space-lg rounded-lg border border-border-subtle shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md">
      <div className="flex items-center gap-space-md">
        <div className="w-12 h-12 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
          <span className="material-symbols-outlined text-[24px]">hourglass_top</span>
        </div>
        <div>
          <h3 className="font-headline text-headline-sm text-ink-primary font-semibold">
            Standart Blok Seansı
          </h3>
          <p className="font-body text-body-md text-ink-secondary">
            Derin çalışma için ideal 45 dakikalık konsantrasyon aralığı.
          </p>
        </div>
      </div>
      <button
        onClick={onStart45Min}
        className="px-5 py-2.5 bg-accent-rest hover:bg-accent-hover text-accent-ink font-label-md text-label-md font-medium rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
      >
        <span className="material-symbols-outlined text-[18px]">play_arrow</span>
        45 Dk Başlat
      </button>
    </div>
  );
};
