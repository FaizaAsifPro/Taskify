import React, { useState, useEffect } from 'react';
import { Reminder, Priority, Recurrence, Category } from '../types';
import { X, Clock, Calendar, Bell, Sparkles, ArrowLeft } from 'lucide-react';
import { formatDateKey } from '../utils/storage';

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (reminder: Reminder) => void;
  initialReminder?: Reminder | null;
  categories: Category[];
  prefilledTitle?: string;
}

export const ReminderModal: React.FC<ReminderModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialReminder,
  categories,
  prefilledTitle,
}) => {
  const getDefaultDateTime = () => {
    const d = new Date();
    d.setHours(d.getHours() + 1);
    d.setMinutes(0);
    const dateStr = formatDateKey(d);
    const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    return `${dateStr}T${timeStr}`;
  };

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dateTime, setDateTime] = useState(getDefaultDateTime());
  const [priority, setPriority] = useState<Priority>('high');
  const [category, setCategory] = useState(categories[0]?.id || 'work');
  const [recurrence, setRecurrence] = useState<Recurrence>('none');

  // Reset fields when opening modal
  useEffect(() => {
    if (isOpen) {
      if (initialReminder) {
        setTitle(initialReminder.title || '');
        setDescription(initialReminder.description || '');
        setDateTime(initialReminder.dateTime || getDefaultDateTime());
        setPriority(initialReminder.priority || 'high');
        setCategory(initialReminder.category || categories[0]?.id || 'work');
        setRecurrence(initialReminder.recurrence || 'none');
      } else {
        setTitle(prefilledTitle || '');
        setDescription('');
        setDateTime(getDefaultDateTime());
        setPriority('high');
        setCategory(categories[0]?.id || 'work');
        setRecurrence('none');
      }
    }
  }, [isOpen, initialReminder, prefilledTitle, categories]);

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

  if (!isOpen) return null;

  // Preset time helpers
  const applyPreset = (offsetMinutes: number, setSpecificHour?: number) => {
    const d = new Date();
    if (setSpecificHour !== undefined) {
      if (d.getHours() >= setSpecificHour) {
        d.setDate(d.getDate() + 1);
      }
      d.setHours(setSpecificHour, 0, 0, 0);
    } else {
      d.setMinutes(d.getMinutes() + offsetMinutes);
    }
    const dateStr = formatDateKey(d);
    const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    setDateTime(`${dateStr}T${timeStr}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dateTime) return;

    const reminderToSave: Reminder = {
      id: initialReminder?.id || `rem-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || undefined,
      dateTime,
      completed: initialReminder?.completed || false,
      completedAt: initialReminder?.completedAt,
      priority,
      category,
      recurrence,
      createdAt: initialReminder?.createdAt || new Date().toISOString(),
    };

    onSave(reminderToSave);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overscroll-contain"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg max-h-[calc(100dvh-2rem)] flex flex-col bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl shadow-2xl overflow-hidden text-white my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Header with Back Arrow - Pinned */}
          <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-[var(--app-border)] bg-[var(--app-surface)]">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                title="Back (Esc)"
                aria-label="Back"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <h2 className="text-base sm:text-lg font-bold font-display text-white flex items-center gap-2">
                  <Bell size={18} className="text-[var(--app-accent)] shrink-0" />
                  {initialReminder ? 'Edit Reminder' : 'Set Time Reminder'}
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Get audio-visual alerts exactly when it's time
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>

          {/* Scrollable Form Body */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 overscroll-contain">
            {/* Quick Presets */}
            <div className="p-3 bg-[var(--app-elevated)] border border-[var(--app-border)] rounded-xl">
              <div className="text-[11px] font-semibold tracking-wider text-[var(--app-accent)] uppercase flex items-center gap-1.5 mb-2">
                <Sparkles size={12} /> Quick Time Allocators
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                <button
                  type="button"
                  onClick={() => applyPreset(30)}
                  className="px-2.5 py-1.5 text-xs text-neutral-300 hover:text-white bg-[var(--app-surface)] hover:bg-white/10 border border-[var(--app-border)] rounded-lg transition-colors cursor-pointer text-center"
                >
                  In 30 mins
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset(0, 20)}
                  className="px-2.5 py-1.5 text-xs text-neutral-300 hover:text-white bg-[var(--app-surface)] hover:bg-white/10 border border-[var(--app-border)] rounded-lg transition-colors cursor-pointer text-center"
                >
                  Tonight 8 PM
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date();
                    d.setDate(d.getDate() + 1);
                    d.setHours(9, 0, 0, 0);
                    setDateTime(`${formatDateKey(d)}T09:00`);
                  }}
                  className="px-2.5 py-1.5 text-xs text-neutral-300 hover:text-white bg-[var(--app-surface)] hover:bg-white/10 border border-[var(--app-border)] rounded-lg transition-colors cursor-pointer text-center"
                >
                  Tomorrow 9 AM
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date();
                    const day = d.getDay();
                    const diff = d.getDate() + (day === 0 ? 1 : 8 - day);
                    d.setDate(diff);
                    d.setHours(9, 0, 0, 0);
                    setDateTime(`${formatDateKey(d)}T09:00`);
                  }}
                  className="px-2.5 py-1.5 text-xs text-neutral-300 hover:text-white bg-[var(--app-surface)] hover:bg-white/10 border border-[var(--app-border)] rounded-lg transition-colors cursor-pointer text-center"
                >
                  Next Monday
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Reminder Title <span className="text-[var(--app-accent)]">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Client sync presentation call"
                className="w-full px-3.5 py-2.5 bg-[var(--app-elevated)] border border-[var(--app-border)] rounded-xl text-sm text-white placeholder-neutral-400 focus:outline-hidden focus:border-[var(--app-accent)] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Optional Note / Link
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Meeting link, brief reminder details..."
                className="w-full px-3.5 py-2 bg-[var(--app-elevated)] border border-[var(--app-border)] rounded-xl text-sm text-white placeholder-neutral-400 focus:outline-hidden focus:border-[var(--app-accent)] transition-colors resize-none"
              />
            </div>

            {/* Exact Date & Time */}
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1 flex items-center gap-1.5">
                <Clock size={13} className="text-[var(--app-accent)]" />
                Alert Date &amp; Time (24h) <span className="text-[var(--app-accent)]">*</span>
              </label>
              <input
                type="datetime-local"
                required
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--app-elevated)] border border-[var(--app-border)] rounded-xl text-sm font-mono text-white focus:outline-hidden focus:border-[var(--app-accent)] transition-colors"
              />
            </div>

            {/* Priority & Recurrence & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="w-full px-3 py-2 bg-[var(--app-elevated)] border border-[var(--app-border)] rounded-xl text-xs text-white focus:outline-hidden focus:border-[var(--app-accent)] transition-colors"
                >
                  <option value="urgent" className="bg-[var(--app-surface)] text-white">🔴 Urgent</option>
                  <option value="high" className="bg-[var(--app-surface)] text-white">🟡 High</option>
                  <option value="medium" className="bg-[var(--app-surface)] text-white">⚪ Normal</option>
                  <option value="low" className="bg-[var(--app-surface)] text-white">🟢 Low</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--app-elevated)] border border-[var(--app-border)] rounded-xl text-xs text-white focus:outline-hidden focus:border-[var(--app-accent)] transition-colors"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[var(--app-surface)] text-white">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Repeat
                </label>
                <select
                  value={recurrence}
                  onChange={(e) => setRecurrence(e.target.value as Recurrence)}
                  className="w-full px-3 py-2 bg-[var(--app-elevated)] border border-[var(--app-border)] rounded-xl text-xs text-white focus:outline-hidden focus:border-[var(--app-accent)] transition-colors"
                >
                  <option value="none" className="bg-[var(--app-surface)] text-white">Does not repeat</option>
                  <option value="daily" className="bg-[var(--app-surface)] text-white">Daily</option>
                  <option value="weekly" className="bg-[var(--app-surface)] text-white">Weekly</option>
                  <option value="monthly" className="bg-[var(--app-surface)] text-white">Monthly</option>
                </select>
              </div>
            </div>
          </div>

          {/* Form Actions - Pinned Footer */}
          <div className="shrink-0 flex items-center justify-end gap-3 px-5 py-3.5 border-t border-[var(--app-border)] bg-[var(--app-surface)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-300 hover:text-white bg-[var(--app-elevated)] hover:bg-white/10 border border-[var(--app-border)] rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              style={{
                backgroundColor: 'var(--app-accent)',
                color: 'var(--app-accent-text)',
              }}
            >
              {initialReminder ? 'Save Reminder' : 'Set Alert'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
