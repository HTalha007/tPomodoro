import React, { useState } from 'react';
import { RoomHeader } from '../components/room/RoomHeader';
import { RoomLeaderboard } from '../components/room/RoomLeaderboard';
import {
  useAuth,
  useActiveRoom,
  useCreateRoom,
  useJoinRoom,
  useLeaveRoom,
} from '../hooks';

interface CoworkingRoomPageProps {
  onOpenAuthModal?: () => void;
}

export const CoworkingRoomPage: React.FC<CoworkingRoomPageProps> = ({
  onOpenAuthModal,
}) => {
  const { account, isAuthenticated } = useAuth();
  const { data: activeRoomData, isLoading, refetch } = useActiveRoom();
  const createRoomMutation = useCreateRoom();
  const joinRoomMutation = useJoinRoom();
  const leaveRoomMutation = useLeaveRoom();

  const [joinCode, setJoinCode] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);

  const activeRoom = activeRoomData?.room ?? null;

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!isAuthenticated) {
      if (onOpenAuthModal) onOpenAuthModal();
      return;
    }

    const code = joinCode.trim();
    if (!code) {
      setErrorMsg('Lütfen geçerli bir oda kodu girin.');
      return;
    }

    try {
      await joinRoomMutation.mutateAsync({ code });
      setJoinCode('');
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Odaya katılınamadı. Kod geçersiz olabilir.';
      setErrorMsg(Array.isArray(msg) ? msg.join(', ') : msg);
    }
  };

  const handleCreateRoom = async () => {
    setErrorMsg(null);
    if (!isAuthenticated) {
      if (onOpenAuthModal) onOpenAuthModal();
      return;
    }

    try {
      await createRoomMutation.mutateAsync();
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Oda oluşturulurken bir hata oluştu.';
      setErrorMsg(Array.isArray(msg) ? msg.join(', ') : msg);
    }
  };

  const handleLeaveRoom = async () => {
    try {
      await leaveRoomMutation.mutateAsync();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Odadan ayrılınamadı.');
    }
  };

  if (isLoading) {
    return (
      <section className="flex flex-col items-center justify-center w-full py-16 gap-3">
        <div className="w-8 h-8 border-2 border-accent-rest border-t-transparent rounded-full animate-spin"></div>
        <span className="font-code text-label-sm text-ink-tertiary">
          Oda üyeliği ve durumu kontrol ediliyor...
        </span>
      </section>
    );
  }

  // Preview Mode for static design review
  if (isPreviewMode) {
    return (
      <section className="flex flex-col gap-space-lg w-full">
        <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
          <span className="font-code text-label-sm text-ink-tertiary">
            ÖNİZLEME MODU // STATİK TASARIM
          </span>
          <button
            onClick={() => setIsPreviewMode(false)}
            className="text-label-sm font-label-sm text-ink-primary underline underline-offset-4"
          >
            Canlı Moda Dön
          </button>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md bg-surface-elevation p-space-lg rounded-lg border border-border-subtle shadow-sm">
          <RoomHeader roomName="#dev-deep-work" roomCode="X7Y9Z" participantCount={3} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          <div className="lg:col-span-8 flex flex-col gap-space-sm w-full">
            <RoomLeaderboard />
          </div>
          <div className="lg:col-span-4 bg-surface-elevation p-space-lg rounded-lg border border-border-subtle shadow-sm flex flex-col gap-space-md">
            <div className="flex items-center gap-2 text-ink-primary font-semibold">
              <span className="material-symbols-outlined text-[20px] text-primary">
                security
              </span>
              <h3 className="font-headline text-headline-sm">Sessiz Oda Protokolü</h3>
            </div>
            <p className="font-body text-body-md text-ink-secondary leading-relaxed">
              Bu oda, yüksek odaklı çalışma saatlerinde bölünmeyi önlemek için canlı
              dakika yarışı prensibiyle çalışır.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-space-lg w-full">
      {/* Top Metadata Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-space-sm">
        <div className="flex items-center gap-space-xs font-code text-code text-ink-secondary">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-[4px] bg-surface-container-high text-ink-primary text-[11px] font-medium">
            04
          </span>
          <span className="text-ink-tertiary">/</span>
          <span className="uppercase tracking-wider text-[11px] font-medium">
            Birlikte Çalışma Odası
          </span>
          <span className="text-ink-tertiary">/</span>
          <span className="text-ink-primary font-medium">Dakika Yarışı</span>
        </div>
        <div className="flex items-center gap-space-xs font-code text-[11px] text-ink-secondary">
          <span className="inline-block w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
          <span>10s Otomatik Yoklama (AC-R10)</span>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-error-surface border border-error-text/20 rounded-lg text-error-text font-body text-body-sm flex items-center justify-between">
          <span>{errorMsg}</span>
          <button
            onClick={() => setErrorMsg(null)}
            className="text-error-text/60 hover:text-error-text"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {!activeRoom ? (
        // Not in a room: Join or Create view
        <div className="flex flex-col gap-space-lg">
          <div className="bg-surface-elevation p-space-xl rounded-lg border border-border-subtle shadow-sm flex flex-col items-center text-center gap-space-md">
            <div className="w-16 h-16 rounded-full bg-surface-container-low border border-border-subtle flex items-center justify-center text-ink-tertiary">
              <span className="material-symbols-outlined text-[32px]">
                groups
              </span>
            </div>

            <div className="flex flex-col items-center gap-1 max-w-md">
              <h2 className="font-headline text-headline-md font-semibold text-ink-primary tracking-tight">
                Birlikte Çalışma Odasına Katıl
              </h2>
              <p className="font-body text-body-md text-ink-secondary">
                Arkadaşlarınızla aynı anda odaklanın, birbirinizin durumunu görün ve
                dakika yarışında yerinizi alın.
              </p>
            </div>

            {!isAuthenticated ? (
              <div className="p-space-md rounded-lg bg-surface-container-low border border-border-subtle max-w-md flex flex-col items-center gap-2 mt-2">
                <span className="font-body text-body-sm text-ink-secondary">
                  Oda oluşturmak veya katılmak için lütfen oturum açın.
                </span>
                <button
                  onClick={onOpenAuthModal}
                  className="px-4 py-2 rounded-lg bg-accent-rest hover:bg-accent-hover text-accent-ink font-label-md text-label-md font-medium transition-colors"
                >
                  Giriş Yap / Kayıt Ol
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-4 mt-2 w-full max-w-md justify-center">
                <form
                  onSubmit={handleJoin}
                  className="flex items-center gap-2 w-full sm:w-auto"
                >
                  <input
                    type="text"
                    maxLength={64}
                    placeholder="Oda Kodu Gir"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    className="h-10 w-full sm:w-56 px-3 bg-surface-container-lowest text-ink-primary placeholder-ink-tertiary font-code text-code rounded-[6px] border border-border-subtle focus:outline-none focus:border-accent-focus transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={joinRoomMutation.isPending}
                    className="h-10 px-4 rounded-[6px] bg-accent-rest hover:bg-accent-hover text-accent-ink font-label-md text-label-md font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      meeting_room
                    </span>
                    <span>
                      {joinRoomMutation.isPending ? 'Katılınıyor...' : 'Katıl'}
                    </span>
                  </button>
                </form>

                <div className="text-ink-tertiary font-code text-label-sm">veya</div>

                <button
                  onClick={handleCreateRoom}
                  disabled={createRoomMutation.isPending}
                  className="h-10 px-4 rounded-[6px] bg-surface-elevation hover:bg-surface-container-low text-ink-primary font-label-md text-label-md font-medium transition-colors border border-border-subtle flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    add_circle
                  </span>
                  <span>
                    {createRoomMutation.isPending ? 'Açılıyor...' : 'Yeni Oda Aç'}
                  </span>
                </button>
              </div>
            )}

            <button
              onClick={() => setIsPreviewMode(true)}
              className="mt-4 font-code text-[12px] text-ink-tertiary hover:text-ink-secondary underline"
            >
              Statik Tasarım Önizlemesini İncele
            </button>
          </div>
        </div>
      ) : (
        // Active in a room
        <div className="flex flex-col gap-space-lg">
          <RoomHeader
            roomName={`#oda-${activeRoom.code.slice(0, 6)}`}
            roomCode={activeRoom.code}
            participantCount={activeRoom.members.length}
            isHost={activeRoom.isHost}
            onLeaveRoom={handleLeaveRoom}
            isLeaving={leaveRoomMutation.isPending}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
            <div className="lg:col-span-8 flex flex-col gap-space-sm w-full">
              <RoomLeaderboard
                members={activeRoom.members}
                currentAccountId={account?.accountId}
              />
            </div>

            {/* Protocol Side Panel */}
            <div className="lg:col-span-4 bg-surface-elevation p-space-lg rounded-lg border border-border-subtle shadow-sm flex flex-col gap-space-md">
              <div className="flex items-center gap-2 text-ink-primary font-semibold">
                <span className="material-symbols-outlined text-[20px] text-primary">
                  security
                </span>
                <h3 className="font-headline text-headline-sm">Sessiz Oda Protokolü</h3>
              </div>
              <p className="font-body text-body-md text-ink-secondary leading-relaxed">
                Bu odada açtığınız tüm odak turlarının kredili dakikaları doğrudan bu
                odanın sıralamasına yazılır (Kural AC-R06).
              </p>
              <div className="flex flex-col gap-2 pt-2 border-t border-border-subtle/50 font-label-sm text-label-sm text-ink-secondary">
                <div className="flex items-center justify-between">
                  <span>Mola Eşiği:</span>
                  <span className="font-code text-ink-primary font-medium">2/3 Oran</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Yoklama Aralığı:</span>
                  <span className="font-code text-ink-primary font-medium">10 Saniye</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Aktiflik Eşiği:</span>
                  <span className="font-code text-ink-primary font-medium">30 Saniye</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
