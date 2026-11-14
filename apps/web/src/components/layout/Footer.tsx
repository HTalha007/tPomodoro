import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-canvas-base border-t border-border-subtle py-space-md mt-auto">
      <div className="max-w-7xl mx-auto px-margin flex flex-col sm:flex-row items-center justify-between gap-space-sm font-label-sm text-label-sm text-ink-secondary">
        <div className="flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-secondary"></span>
          <span className="font-code text-[11px] text-ink-secondary">
            Protokol Aktif • PostgreSQL 16 • Senkronize
          </span>
        </div>
        <div>
          <span>© 2026 KrediOdak. Arşivsel Odak Altyapısı.</span>
        </div>
      </div>
    </footer>
  );
};
