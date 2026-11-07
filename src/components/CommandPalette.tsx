import React, { useState, useEffect } from 'react';
import { Task, Reminder, Note, ActiveView } from '../types';
import { Search, CheckSquare, Bell, FileText, ArrowRight, ArrowLeft, X, Calendar, Sparkles } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  reminders: Reminder[];
  notes: Note[];
  onSelectView: (view: ActiveView) => void;
  onOpenTaskModal: () => void;
  onOpenReminderModal: () => void;
  onOpenNoteModal: () => void;
  onSelectTask: (task: Task) => void;
  onSelectReminder: (reminder: Reminder) => void;
  onSelectNote: (note: Note) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  tasks,
  reminders,
  notes,
  onSelectView,
  onOpenTaskModal,
  onOpenReminderModal,
  onOpenNoteModal,
  onSelectTask,
  onSelectReminder,
  onSelectNote,
}) => {
  const [query, setQuery] = useState('');

  // Handle Escape key and Ctrl/Cmd+K to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const lowerQ = query.toLowerCase().trim();

  const filteredTasks = lowerQ
    ? tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(lowerQ) ||
          t.description?.toLowerCase().includes(lowerQ) ||
          t.tags.some((tag) => tag.toLowerCase().includes(lowerQ))
      ).slice(0, 5)
    : [];

  const filteredReminders = lowerQ
    ? reminders.filter(
        (r) =>
          r.title.toLowerCase().includes(lowerQ) ||
          r.description?.toLowerCase().includes(lowerQ)
      ).slice(0, 4)
    : [];

  const filteredNotes = lowerQ
    ? notes.filter(
        (n) =>
          n.title.toLowerCase().includes(lowerQ) ||
          n.content.toLowerCase().includes(lowerQ) ||
          n.tags.some((tag) => tag.toLowerCase().includes(lowerQ))
      ).slice(0, 4)
    : [];

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center sm:items-start justify-center p-3 sm:p-4 sm:pt-14 overscroll-contain"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-xl max-h-[calc(100dvh-3.5rem)] flex flex-col bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl shadow-2xl overflow-hidden text-white my-auto sm:my-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar with Back Arrow */}
        <div className="shrink-0 flex items-center px-4 py-3.5 border-b border-[var(--app-border)] gap-2.5 bg-[var(--app-surface)]">
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors shrink-0 flex items-center justify-center cursor-pointer"
            title="Go back / Close search (Esc)"
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </button>

          <Search size={18} className="text-[var(--app-accent)] shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes, tasks, reminders or type a view..."
            className="w-full bg-transparent text-sm text-white placeholder-neutral-400 focus:outline-hidden"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-neutral-400 hover:text-white p-1 cursor-pointer"
            >
              <X size={15} />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-[10px] font-mono text-neutral-400 bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded border border-white/10 cursor-pointer"
            title="Press Escape to exit"
          >
            ESC
          </button>
        </div>

        {/* Results / Navigation Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-2 space-y-4">
          {/* Quick Actions if query is empty or matching */}
          {(!query || 'schedule task new'.includes(lowerQ)) && (
            <div>
              <div className="px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-neutral-500">
                Quick Actions
              </div>
              <div className="space-y-1 mt-1">
                <button
                  onClick={() => {
                    onOpenTaskModal();
                    onClose();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-neutral-200 hover:bg-white/10 hover:text-[var(--app-accent)] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <CheckSquare size={14} className="text-[var(--app-accent)]" />
                    Schedule New Task
                  </span>
                  <span className="text-neutral-500 font-mono text-[10px]">T</span>
                </button>
                <button
                  onClick={() => {
                    onOpenReminderModal();
                    onClose();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-neutral-200 hover:bg-white/10 hover:text-[var(--app-accent)] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Bell size={14} className="text-[var(--app-accent)]" />
                    Set Time Reminder
                  </span>
                  <span className="text-neutral-500 font-mono text-[10px]">R</span>
                </button>
                <button
                  onClick={() => {
                    onOpenNoteModal();
                    onClose();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-neutral-200 hover:bg-white/10 hover:text-[var(--app-accent)] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <FileText size={14} className="text-[var(--app-accent)]" />
                    Capture Note
                  </span>
                  <span className="text-neutral-500 font-mono text-[10px]">N</span>
                </button>
              </div>
            </div>
          )}

          {/* Jump to View */}
          {(!query || ['daily', 'weekly', 'monthly', 'calendar', 'notes', 'reminders', 'organize'].some(v => v.includes(lowerQ))) && (
            <div>
              <div className="px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-neutral-500">
                Switch View
              </div>
              <div className="grid grid-cols-2 gap-1 mt-1">
                {[
                  { id: 'daily', label: 'Daily Schedule' },
                  { id: 'weekly', label: 'Weekly Planner' },
                  { id: 'monthly', label: 'Monthly Calendar' },
                  { id: 'reminders', label: 'Time Reminders' },
                  { id: 'notes', label: 'Notes Workspace' },
                  { id: 'organize', label: 'Categories & Archive' },
                ].map((v) => (
                  <button
                    key={v.id}
                    onClick={() => {
                      onSelectView(v.id as ActiveView);
                      onClose();
                    }}
                    className="flex items-center justify-between px-3 py-1.5 rounded-lg text-xs text-neutral-300 hover:bg-white/10 hover:text-[var(--app-accent)] transition-colors"
                  >
                    <span>{v.label}</span>
                    <ArrowRight size={12} className="text-neutral-500" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tasks match */}
          {filteredTasks.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-neutral-500">
                Tasks ({filteredTasks.length})
              </div>
              <div className="space-y-1 mt-1">
                {filteredTasks.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      onSelectTask(t);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-neutral-200 hover:bg-white/10 transition-colors text-left"
                  >
                    <div className="truncate mr-2">
                      <span className="font-medium text-white">{t.title}</span>
                      <span className="text-[11px] text-neutral-400 ml-2 font-mono">
                        {t.dueDate} {t.dueTime || ''}
                      </span>
                    </div>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-white/10 text-[var(--app-accent)] shrink-0">
                      {t.priority}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Reminders match */}
          {filteredReminders.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-neutral-500">
                Reminders ({filteredReminders.length})
              </div>
              <div className="space-y-1 mt-1">
                {filteredReminders.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      onSelectReminder(r);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-neutral-200 hover:bg-white/10 transition-colors text-left"
                  >
                    <span className="font-medium text-white truncate mr-2">{r.title}</span>
                    <span className="text-[11px] font-mono text-[var(--app-accent)] shrink-0">
                      {r.dateTime.replace('T', ' ')}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notes match */}
          {filteredNotes.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-neutral-500">
                Notes ({filteredNotes.length})
              </div>
              <div className="space-y-1 mt-1">
                {filteredNotes.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => {
                      onSelectNote(n);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-neutral-200 hover:bg-white/10 transition-colors text-left"
                  >
                    <span className="font-medium text-white truncate mr-2">{n.title}</span>
                    <span className="text-[10px] text-neutral-400 shrink-0">
                      {n.tags.slice(0, 2).join(', ')}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No results */}
          {query && filteredTasks.length === 0 && filteredReminders.length === 0 && filteredNotes.length === 0 && (
            <div className="text-center py-8 text-neutral-400 text-xs">
              No matching tasks, reminders, or notes found for "{query}".
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
