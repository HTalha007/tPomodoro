import React from 'react';
import { useUserStats } from '../../hooks/useUserStats';

export const DashboardStats: React.FC = () => {
  const { data: stats, isLoading } = useUserStats();

  const todayMinutes = stats?.todayMinutes ?? 0;
  const completedRoundsCount = stats?.completedRoundsCount ?? 0;
  const weekMinutes = stats?.weekMinutes ?? 0;
  const weekGoalMinutes = stats?.weekGoalMinutes ?? 600;
  const streakDays = stats?.streakDays ?? 0;

  const weekProgressPercent = Math.min(
    100,
    Math.round((weekMinutes / weekGoalMinutes) * 100)
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
      {/* Bugün */}
      <div className="bg-surface-elevation p-space-lg rounded-lg border border-border-subtle shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-ink-tertiary">
          <span className="font-label-md text-label-md">Bugün</span>
          <span className="material-symbols-outlined text-[18px]">timelapse</span>
        </div>
        <div className="my-space-sm">
          {isLoading ? (
            <div className="h-10 w-24 bg-surface-container-low animate-pulse rounded"></div>
          ) : (
            <span className="font-code text-display text-ink-primary">
              {todayMinutes}{' '}
              <span className="font-label-md text-ink-secondary">Dk</span>
            </span>
          )}
        </div>
        <p className="font-body text-body-md text-ink-secondary">
          {isLoading ? 'Yükleniyor...' : `${completedRoundsCount} tamamlanan seans`}
        </p>
      </div>

      {/* Bu Hafta */}
      <div className="bg-surface-elevation p-space-lg rounded-lg border border-border-subtle shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-ink-tertiary">
          <span className="font-label-md text-label-md">Bu Hafta</span>
          <span className="material-symbols-outlined text-[18px]">calendar_today</span>
        </div>
        <div className="my-space-sm">
          {isLoading ? (
            <div className="h-10 w-24 bg-surface-container-low animate-pulse rounded"></div>
          ) : (
            <span className="font-code text-display text-ink-primary">
              {weekMinutes}{' '}
              <span className="font-label-md text-ink-secondary">Dk</span>
            </span>
          )}
        </div>
        <div className="flex items-center justify-between text-ink-secondary font-label-sm text-label-sm">
          <span>Hedef {weekGoalMinutes} Dk</span>
          <span className="font-code text-accent-ink font-semibold">
            %{weekProgressPercent}
          </span>
        </div>
      </div>

      {/* Seri */}
      <div className="bg-surface-elevation p-space-lg rounded-lg border border-border-subtle shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-ink-tertiary">
          <span className="font-label-md text-label-md">Seri</span>
          <span className="material-symbols-outlined text-[18px]">
            local_fire_department
          </span>
        </div>
        <div className="my-space-sm">
          {isLoading ? (
            <div className="h-10 w-24 bg-surface-container-low animate-pulse rounded"></div>
          ) : (
            <span className="font-code text-display text-ink-primary">
              {streakDays}{' '}
              <span className="font-label-md text-ink-secondary">Gün</span>
            </span>
          )}
        </div>
        <p className="font-body text-body-md text-ink-secondary">
          {streakDays > 0 ? 'Kesintisiz akış' : 'Bugün henüz seans yok'}
        </p>
      </div>
    </div>
  );
};
