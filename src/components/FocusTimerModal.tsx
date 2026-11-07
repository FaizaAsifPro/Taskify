import React, { useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles, ArrowLeft } from 'lucide-react';
import { playReminderChime } from '../utils/sound';

interface FocusTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTaskTitle?: string;
}

export const FocusTimerModal: React.FC<FocusTimerModalProps> = ({
  isOpen,
  onClose,
  activeTaskTitle,
}) => {
  const [initialDuration, setInitialDuration] = useState(25 * 60); // 25 mins
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      if (soundEnabled) {
        playReminderChime();
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, soundEnabled]);

  if (!isOpen) return null;

  const setTimerPreset = (minutes: number) => {
    setIsRunning(false);
    setInitialDuration(minutes * 60);
    setTimeLeft(minutes * 60);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(initialDuration);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progressPercent = ((initialDuration - timeLeft) / initialDuration) * 100;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overscroll-contain"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl shadow-2xl p-6 sm:p-7 text-white text-center my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          title="Back (Esc)"
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </button>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          title="Close"
        >
          <X size={18} />
        </button>

        <div className="flex items-center justify-center gap-2 mb-2 pt-1">
          <Sparkles size={16} className="text-[var(--app-accent)]" />
          <span className="text-xs font-mono font-semibold tracking-widest text-[var(--app-accent)] uppercase">
            Focus Chamber
          </span>
        </div>

        {activeTaskTitle ? (
          <p className="text-xs text-neutral-400 max-w-xs mx-auto truncate mb-4">
            Focusing on: <span className="text-neutral-200 font-medium">{activeTaskTitle}</span>
          </p>
        ) : (
          <p className="text-xs text-neutral-400 mb-4">Deep work &amp; distraction-free sprint</p>
        )}

        {/* Circular / Large Digital Display */}
        <div className="relative my-6 flex flex-col items-center justify-center">
          <div className="text-6xl font-bold font-mono tracking-tight text-white mb-2 tabular-nums">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>

          {/* Progress bar */}
          <div className="w-56 h-1.5 bg-[var(--app-elevated)] rounded-full overflow-hidden mt-2">
            <div
              className="h-full bg-[var(--app-accent)] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Presets */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <button
            onClick={() => setTimerPreset(15)}
            className={`px-3 py-1 text-xs rounded-md font-mono transition-colors cursor-pointer ${
              initialDuration === 15 * 60
                ? 'font-semibold'
                : 'bg-[var(--app-elevated)] text-neutral-300 hover:bg-white/10'
            }`}
            style={
              initialDuration === 15 * 60
                ? { backgroundColor: 'var(--app-accent)', color: 'var(--app-accent-text)' }
                : undefined
            }
          >
            15m Sprint
          </button>
          <button
            onClick={() => setTimerPreset(25)}
            className={`px-3 py-1 text-xs rounded-md font-mono transition-colors cursor-pointer ${
              initialDuration === 25 * 60
                ? 'font-semibold'
                : 'bg-[var(--app-elevated)] text-neutral-300 hover:bg-white/10'
            }`}
            style={
              initialDuration === 25 * 60
                ? { backgroundColor: 'var(--app-accent)', color: 'var(--app-accent-text)' }
                : undefined
            }
          >
            25m Focus
          </button>
          <button
            onClick={() => setTimerPreset(50)}
            className={`px-3 py-1 text-xs rounded-md font-mono transition-colors cursor-pointer ${
              initialDuration === 50 * 60
                ? 'font-semibold'
                : 'bg-[var(--app-elevated)] text-neutral-300 hover:bg-white/10'
            }`}
            style={
              initialDuration === 50 * 60
                ? { backgroundColor: 'var(--app-accent)', color: 'var(--app-accent-text)' }
                : undefined
            }
          >
            50m Deep
          </button>
          <button
            onClick={() => setTimerPreset(5)}
            className={`px-3 py-1 text-xs rounded-md font-mono transition-colors cursor-pointer ${
              initialDuration === 5 * 60
                ? 'font-semibold'
                : 'bg-[var(--app-elevated)] text-neutral-300 hover:bg-white/10'
            }`}
            style={
              initialDuration === 5 * 60
                ? { backgroundColor: 'var(--app-accent)', color: 'var(--app-accent-text)' }
                : undefined
            }
          >
            5m Rest
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={resetTimer}
            className="p-3 bg-[var(--app-elevated)] hover:bg-white/10 border border-[var(--app-border)] text-neutral-300 hover:text-white rounded-xl transition-colors cursor-pointer"
            title="Reset Timer"
          >
            <RotateCcw size={18} />
          </button>
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="px-6 py-3 font-bold rounded-xl shadow-lg flex items-center gap-2 text-sm transition-all cursor-pointer"
            style={{
              backgroundColor: 'var(--app-accent)',
              color: 'var(--app-accent-text)',
            }}
          >
            {isRunning ? (
              <>
                <Pause size={18} /> Pause
              </>
            ) : (
              <>
                <Play size={18} fill="currentColor" /> Start Sprint
              </>
            )}
          </button>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-3 bg-[var(--app-elevated)] hover:bg-white/10 border border-[var(--app-border)] text-neutral-300 hover:text-white rounded-xl transition-colors cursor-pointer"
            title={soundEnabled ? 'Mute alert chime' : 'Enable alert chime'}
          >
            {soundEnabled ? <Volume2 size={18} className="text-[var(--app-accent)]" /> : <VolumeX size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};
