import { useState, useEffect, useRef } from 'react';
import { RoundResponseDto } from '@tpomodoro/contracts';

interface UseTimerCountdownOptions {
  round: RoundResponseDto | null | undefined;
  serverNow?: string;
  onThresholdReached?: () => void;
}

export interface TimerCountdownState {
  secondsLeft: number;
  totalSeconds: number;
  percent: number;
  formattedTime: string;
  canResume: boolean;
  phaseLabel: string;
  phaseSubLabel: string;
  isBreakPhase: boolean;
}

export const useTimerCountdown = ({
  round,
  serverNow,
  onThresholdReached,
}: UseTimerCountdownOptions): TimerCountdownState => {
  const [ticks, setTicks] = useState<number>(0);
  const anchorRef = useRef<{ serverAnchor: number; localAnchor: number } | null>(null);
  const thresholdTriggeredRef = useRef<boolean>(false);

  // Sync server time anchor whenever serverNow or round changes
  useEffect(() => {
    if (serverNow) {
      anchorRef.current = {
        serverAnchor: new Date(serverNow).getTime(),
        localAnchor: performance.now(),
      };
      // Reset threshold trigger flag when new round data arrives
      thresholdTriggeredRef.current = false;
    }
  }, [serverNow, round?.phase, round?.roundId]);

  // 1-second interval to increment ticks and trigger re-render
  useEffect(() => {
    const timer = setInterval(() => {
      setTicks((t) => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!round || round.phase === 'closed') {
    return {
      secondsLeft: 0,
      totalSeconds: 0,
      percent: 0,
      formattedTime: '00:00',
      canResume: false,
      phaseLabel: 'Hazır',
      phaseSubLabel: 'Yeni bir odak seansı başlatabilirsiniz.',
      isBreakPhase: false,
    };
  }

  // Derive current server time safely without local clock drift
  let currentServerTime = Date.now();
  if (anchorRef.current) {
    const elapsedSinceAnchor = performance.now() - anchorRef.current.localAnchor;
    currentServerTime = anchorRef.current.serverAnchor + elapsedSinceAnchor;
  }

  let secondsLeft = 0;
  let totalSeconds = 0;
  let canResume = false;
  let phaseLabel = '';
  let phaseSubLabel = '';
  let isBreakPhase = false;

  if (round.phase === 'focus_before_break') {
    phaseLabel = 'FAZ 1 // DERİN BLOK';
    phaseSubLabel = 'Mola eşiğine kadar kesintisiz odaklanma.';
    isBreakPhase = false;
    totalSeconds = round.breakAfterSeconds;

    const startedTime = new Date(round.startedAt).getTime();
    const targetBreakTime = startedTime + round.breakAfterSeconds * 1000;
    const diff = Math.floor((targetBreakTime - currentServerTime) / 1000);
    secondsLeft = Math.max(0, diff);
  } else if (round.phase === 'awaiting_decision') {
    phaseLabel = 'MOLA & KARAR FAZI // FSM: STATE_DECISION_GATE';
    phaseSubLabel = 'İlk odak bloğu tamamlandı. Zihnini dinlendir ve seansı değerlendir.';
    isBreakPhase = true;
    totalSeconds = round.breakLengthSeconds;

    const breakStartTime = round.breakStartedAt
      ? new Date(round.breakStartedAt).getTime()
      : new Date(round.startedAt).getTime() + round.breakAfterSeconds * 1000;
    const breakEndTime = breakStartTime + round.breakLengthSeconds * 1000;
    const diff = Math.floor((breakEndTime - currentServerTime) / 1000);
    secondsLeft = Math.max(0, diff);
    canResume = secondsLeft <= 0;
  } else if (round.phase === 'focus_after_break') {
    phaseLabel = 'FAZ 2 // TAMAMLAMA BLOĞU';
    phaseSubLabel = 'Son aşama. Hedeflenen süreyi tamamlayıp tam krediyi mühürle.';
    isBreakPhase = false;
    const secondHalfPlanned = round.plannedSeconds - round.breakAfterSeconds;
    totalSeconds = secondHalfPlanned;

    const resumeTime = round.resumedAt
      ? new Date(round.resumedAt).getTime()
      : currentServerTime;
    const targetEndTime = resumeTime + secondHalfPlanned * 1000;
    const diff = Math.floor((targetEndTime - currentServerTime) / 1000);
    secondsLeft = Math.max(0, diff);
  }

  // Check if countdown hit zero to trigger phase re-evaluation
  if (secondsLeft === 0 && !thresholdTriggeredRef.current) {
    thresholdTriggeredRef.current = true;
    if (onThresholdReached) {
      onThresholdReached();
    }
  }

  const percent =
    totalSeconds > 0
      ? Math.min(100, Math.max(0, ((totalSeconds - secondsLeft) / totalSeconds) * 100))
      : 0;

  const minutes = Math.floor(secondsLeft / 60);
  const remainingSecs = secondsLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(
    remainingSecs
  ).padStart(2, '0')}`;

  return {
    secondsLeft,
    totalSeconds,
    percent,
    formattedTime,
    canResume,
    phaseLabel,
    phaseSubLabel,
    isBreakPhase,
  };
};
