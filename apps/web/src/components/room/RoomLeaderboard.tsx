import React from 'react';
import { RoomMemberDto } from '@tpomodoro/contracts';

export interface LeaderboardEntry {
  rank: number;
  name: string;
  username: string;
  project: string;
  status: 'focus' | 'break' | 'away';
  creditedMinutes: number;
  credits: number;
  isCurrentUser?: boolean;
}

const SAMPLE_ENTRIES: LeaderboardEntry[] = [
  {
    rank: 1,
    name: 'Kerem Ak',
    username: '@kerem',
    project: 'API & PostgreSQL Mimarisi',
    status: 'focus',
    creditedMinutes: 310,
    credits: 6.8,
  },
  {
    rank: 2,
    name: 'Zeynep Çelik',
    username: '@zeynep',
    project: 'Quiet Paper UI',
    status: 'focus',
    creditedMinutes: 280,
    credits: 6.2,
  },
  {
    rank: 3,
    name: 'Sen',
    username: '@sen',
    project: 'Sessiz Odak Seansı',
    status: 'focus',
    creditedMinutes: 180,
    credits: 4.0,
    isCurrentUser: true,
  },
];

interface RoomLeaderboardProps {
  members?: RoomMemberDto[];
  currentAccountId?: string | null;
  entries?: LeaderboardEntry[];
}

export const RoomLeaderboard: React.FC<RoomLeaderboardProps> = ({
  members,
  currentAccountId,
  entries: propEntries,
}) => {
  // Map real members if provided
  let displayEntries: LeaderboardEntry[] = [];

  if (members) {
    displayEntries = members.map((m, idx) => {
      const emailPrefix = m.email.split('@')[0];
      const isCurrent = currentAccountId ? m.accountId === currentAccountId : false;
      const creditedMins = Math.floor(m.totalCreditedSeconds / 60);
      const credits = Number((m.totalCreditedSeconds / 2700).toFixed(1));

      return {
        rank: idx + 1,
        name: isCurrent ? `${emailPrefix} (Sen)` : emailPrefix,
        username: `@${emailPrefix}`,
        project: isCurrent ? 'Aktif Odak Seansı' : 'Oda Katılımcısı',
        status: m.isOnline ? 'focus' : 'away',
        creditedMinutes: creditedMins,
        credits,
        isCurrentUser: isCurrent,
      };
    });
  } else {
    displayEntries = propEntries ?? SAMPLE_ENTRIES;
  }

  return (
    <div className="flex flex-col gap-space-sm w-full">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-ink-secondary text-[20px]">
            leaderboard
          </span>
          <h2 className="font-headline text-headline-sm text-ink-primary font-semibold">
            Oda Kredili Dakika Sıralaması
          </h2>
        </div>
        <span className="font-code text-[11px] text-ink-secondary">
          10s Otomatik Yoklama (AC-R10)
        </span>
      </div>

      <div className="bg-surface-elevation rounded-lg border border-border-subtle overflow-hidden shadow-sm">
        {/* Column Headers */}
        <div className="grid grid-cols-12 px-space-md py-space-sm bg-surface-container-low text-ink-secondary font-label-sm text-label-sm uppercase tracking-wider border-b border-border-subtle">
          <div className="col-span-1 text-center font-code">Sıra</div>
          <div className="col-span-6 pl-2">Odaklayıcı &amp; Durum</div>
          <div className="col-span-3 text-center">Durum Rozeti</div>
          <div className="col-span-2 text-right pr-1">Kredili Süre</div>
        </div>

        {/* Rows */}
        {displayEntries.length === 0 ? (
          <div className="p-space-lg text-center font-body text-body-md text-ink-tertiary">
            Odada henüz katılımcı bulunmuyor.
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-border-subtle/50">
            {displayEntries.map((item) => (
              <div
                key={item.rank}
                className={`relative grid grid-cols-12 items-center px-space-md py-3.5 transition-colors ${
                  item.isCurrentUser
                    ? 'bg-accent-rest/40 hover:bg-accent-rest/60'
                    : 'hover:bg-surface-container-low/60'
                }`}
              >
                {/* Left visual indicator bar for current user */}
                {item.isCurrentUser && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent-focus"></div>
                )}

                <div className="col-span-1 flex justify-center">
                  <span
                    className={`w-6 h-6 rounded-[4px] font-code text-[12px] flex items-center justify-center font-medium ${
                      item.rank === 1
                        ? 'bg-secondary-container text-on-secondary-container font-bold'
                        : 'bg-surface-container-high text-ink-secondary'
                    }`}
                  >
                    {item.rank}
                  </span>
                </div>

                <div className="col-span-6 pl-2 flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5 truncate">
                    <span
                      className={`font-body text-body-md font-semibold truncate ${
                        item.isCurrentUser ? 'text-accent-ink' : 'text-ink-primary'
                      }`}
                    >
                      {item.name}
                    </span>
                    <span className="font-code text-[11px] text-ink-secondary">
                      {item.username}
                    </span>
                    {item.isCurrentUser && (
                      <span className="px-1.5 py-0.2 rounded-[4px] bg-accent-rest text-accent-ink font-code text-[10px] font-medium uppercase tracking-tight">
                        Sen
                      </span>
                    )}
                  </div>
                  <span className="font-body text-[12px] text-ink-secondary truncate">
                    {item.project}
                  </span>
                </div>

                <div className="col-span-3 flex justify-center">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] font-label-sm text-label-sm font-medium ${
                      item.status === 'focus'
                        ? 'bg-vault-surface text-vault-ink'
                        : item.status === 'break'
                        ? 'bg-warning-surface text-warning-text'
                        : 'bg-surface-container text-ink-tertiary'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        item.status === 'focus'
                          ? 'bg-secondary'
                          : item.status === 'break'
                          ? 'bg-warning-text'
                          : 'bg-ink-tertiary'
                      }`}
                    ></span>
                    <span>
                      {item.status === 'focus'
                        ? 'Odakta'
                        : item.status === 'break'
                        ? 'Mola'
                        : 'Uzakta (>30s)'}
                    </span>
                  </span>
                </div>

                <div className="col-span-2 text-right pr-1 flex flex-col">
                  <span
                    className={`font-code text-headline-sm font-semibold ${
                      item.isCurrentUser ? 'text-accent-ink' : 'text-ink-primary'
                    }`}
                  >
                    {item.creditedMinutes}
                    <span className="font-label-sm text-label-sm text-ink-secondary font-normal ml-1">
                      dk
                    </span>
                  </span>
                  <span className="font-code text-[10px] text-ink-tertiary">
                    {item.credits} Kredi
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
