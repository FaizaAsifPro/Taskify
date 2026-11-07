import React from 'react';
import { Reminder } from '../types';
import { Bell, Check, Clock, X } from 'lucide-react';

interface ReminderAlertBannerProps {
  activeAlerts: Reminder[];
  onComplete: (reminderId: string) => void;
  onSnooze: (reminderId: string, minutes: number) => void;
  onDismiss: (reminderId: string) => void;
}

export const ReminderAlertBanner: React.FC<ReminderAlertBannerProps> = ({
  activeAlerts,
  onComplete,
  onSnooze,
  onDismiss,
}) => {
  if (activeAlerts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-auto">
      {activeAlerts.map((reminder) => (
        <div
          key={reminder.id}
          className="p-4 bg-[var(--app-surface)] border-2 rounded-2xl shadow-2xl text-white animate-in slide-in-from-bottom-4 duration-300"
          style={{ borderColor: 'var(--app-accent)' }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div 
                className="w-8 h-8 rounded-xl flex items-center justify-center font-bold shrink-0"
                style={{
                  backgroundColor: 'var(--app-accent)',
                  color: 'var(--app-accent-text)',
                }}
              >
                <Bell size={18} className="animate-bounce" />
              </div>
              <div>
                <span 
                  className="text-[10px] font-mono font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--app-accent)' }}
                >
                  Reminder Alert
                </span>
                <h4 className="text-sm font-bold text-white leading-tight">
                  {reminder.title}
                </h4>
              </div>
            </div>
            <button
              onClick={() => onDismiss(reminder.id)}
              className="text-neutral-400 hover:text-white p-1 cursor-pointer"
              title="Dismiss alert"
            >
              <X size={16} />
            </button>
          </div>

          {reminder.description && (
            <p className="text-xs text-neutral-300 mt-2 line-clamp-2 pl-10">
              {reminder.description}
            </p>
          )}

          <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-[var(--app-border)]">
            {/* Snooze dropdown/buttons */}
            <div className="flex items-center gap-1.5 text-xs text-neutral-400">
              <Clock size={12} style={{ color: 'var(--app-accent)' }} />
              <span>Snooze:</span>
              <button
                onClick={() => onSnooze(reminder.id, 5)}
                className="px-2 py-1 text-[11px] bg-white/10 hover:bg-white/20 text-neutral-200 rounded-md transition-colors cursor-pointer"
              >
                5m
              </button>
              <button
                onClick={() => onSnooze(reminder.id, 15)}
                className="px-2 py-1 text-[11px] bg-white/10 hover:bg-white/20 text-neutral-200 rounded-md transition-colors cursor-pointer"
              >
                15m
              </button>
              <button
                onClick={() => onSnooze(reminder.id, 60)}
                className="px-2 py-1 text-[11px] bg-white/10 hover:bg-white/20 text-neutral-200 rounded-md transition-colors cursor-pointer"
              >
                1h
              </button>
            </div>

            {/* Complete button */}
            <button
              onClick={() => onComplete(reminder.id)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors shadow-sm cursor-pointer"
              style={{
                backgroundColor: 'var(--app-accent)',
                color: 'var(--app-accent-text)',
              }}
            >
              <Check size={14} /> Done
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
