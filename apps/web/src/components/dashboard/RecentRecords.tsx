import React from 'react';

export interface FocusRecord {
  id: string;
  title: string;
  category: string;
  status: 'completed' | 'half' | 'abandoned';
  durationMinutes: number;
  timeStr: string;
}

const DEFAULT_RECORDS: FocusRecord[] = [
  {
    id: '1',
    title: 'tPomodoro Mimari Refactoring',
    category: 'Bilişsel Kodlama',
    status: 'completed',
    durationMinutes: 45,
    timeStr: '14:20',
  },
  {
    id: '2',
    title: 'Mimari İnceleme & Drizzle Veri Akışı',
    category: 'Sistem Tasarımı',
    status: 'completed',
    durationMinutes: 50,
    timeStr: '11:00',
  },
  {
    id: '3',
    title: 'E-Posta Triyajı ve Not Sentezi',
    category: 'Yönetim',
    status: 'half',
    durationMinutes: 25,
    timeStr: '09:30',
  },
];

export const RecentRecords: React.FC<{ records?: FocusRecord[] }> = ({
  records = DEFAULT_RECORDS,
}) => {
  return (
    <div className="bg-surface-elevation rounded-lg border border-border-subtle shadow-sm p-space-lg flex flex-col gap-space-md">
      <div className="flex items-center justify-between">
        <h2 className="font-headline text-headline-sm text-ink-primary font-semibold">
          Son Odak Kayıtları
        </h2>
        <span className="font-code text-[11px] text-ink-tertiary">GÜNCEL ARŞİV</span>
      </div>

      <div className="flex flex-col gap-2">
        {records.map((rec) => (
          <div
            key={rec.id}
            className="flex items-center justify-between p-3 rounded-lg bg-canvas-base hover:bg-surface-container-low transition-colors border border-border-subtle/50"
          >
            <div className="flex items-center gap-3">
              <span
                className={`w-2 h-2 rounded-full ${
                  rec.status === 'completed'
                    ? 'bg-secondary'
                    : rec.status === 'half'
                    ? 'bg-tertiary'
                    : 'bg-ink-tertiary'
                }`}
              ></span>
              <div>
                <p className="font-label-md text-label-md text-ink-primary font-medium">
                  {rec.title}
                </p>
                <p className="font-label-sm text-label-sm text-ink-secondary">
                  {rec.category} •{' '}
                  {rec.status === 'completed'
                    ? 'Tamamlandı'
                    : rec.status === 'half'
                    ? 'Kısmi Seans'
                    : 'Bırakıldı'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="font-code text-label-md text-ink-primary font-medium">
                {rec.durationMinutes} Dk
              </span>
              <p className="font-label-sm text-label-sm text-ink-tertiary">
                {rec.timeStr}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
