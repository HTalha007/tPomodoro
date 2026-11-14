import React, { useState } from 'react';

interface RoomHeaderProps {
  roomName?: string;
  roomCode?: string;
  participantCount?: number;
  isHost?: boolean;
  onLeaveRoom?: () => void;
  isLeaving?: boolean;
}

export const RoomHeader: React.FC<RoomHeaderProps> = ({
  roomName = '#birlikte-odak',
  roomCode = 'X7Y9Z',
  participantCount = 1,
  isHost = false,
  onLeaveRoom,
  isLeaving = false,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-surface-elevation rounded-lg border border-border-subtle p-space-lg flex flex-col md:flex-row md:items-center md:justify-between gap-space-lg shadow-sm">
      <div className="flex flex-col gap-space-xs">
        <div className="flex flex-wrap items-center gap-space-sm">
          <h1 className="font-headline text-headline-lg text-ink-primary font-semibold tracking-tight">
            {roomName}
          </h1>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-surface-container-low border border-border-subtle">
            <span className="font-code text-code text-ink-secondary">Kod:</span>
            <span className="font-code text-code text-ink-primary font-semibold tracking-wider">
              {roomCode}
            </span>
            <button
              onClick={handleCopy}
              className="ml-1 text-ink-secondary hover:text-ink-primary transition-colors flex items-center justify-center p-0.5 rounded"
              title="Kodu Kopyala"
            >
              <span className="material-symbols-outlined text-[16px]">
                {copied ? 'check' : 'content_copy'}
              </span>
            </button>
          </div>
          {isHost && (
            <span className="px-2 py-0.5 rounded-[4px] bg-accent-rest text-accent-ink font-code text-[11px] font-semibold uppercase">
              Oda Kurucusu
            </span>
          )}
          <span className="px-2 py-0.5 rounded-[4px] bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-medium">
            Canlı Protokol
          </span>
        </div>

        <p className="font-body text-body-md text-ink-secondary flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px] text-secondary">
            group
          </span>
          <span>{participantCount} Katılımcı Senkronize</span>
          <span className="text-ink-tertiary">•</span>
          <span className="text-ink-primary font-medium">
            Sessiz Çalışma &amp; 10s Yoklama Aktif
          </span>
        </p>
      </div>

      {onLeaveRoom && (
        <button
          onClick={onLeaveRoom}
          disabled={isLeaving}
          className="px-3.5 py-1.5 rounded-lg bg-surface-container-low hover:bg-error-surface/30 text-ink-secondary hover:text-error-text border border-border-subtle font-label-md text-label-md transition-colors flex items-center gap-1.5 self-start md:self-auto cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">logout</span>
          <span>{isLeaving ? 'Ayrılınıyor...' : 'Odadan Ayrıl'}</span>
        </button>
      )}
    </div>
  );
};
