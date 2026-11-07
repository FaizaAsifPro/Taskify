import React, { useState } from 'react';
import { Reminder, Category, Priority } from '../types';
import { 
  Bell, 
  Clock, 
  Check, 
  Plus, 
  Trash2, 
  Edit3, 
  Volume2, 
  AlertTriangle, 
  Calendar,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { playReminderChime } from '../utils/sound';
import { formatDateKey } from '../utils/storage';

interface RemindersViewProps {
  reminders: Reminder[];
  categories: Category[];
  selectedCategory: string | null;
  onToggleReminder: (reminderId: string) => void;
  onSnoozeReminder: (reminderId: string, minutes: number) => void;
  onSelectReminder: (reminder: Reminder) => void;
  onDeleteReminder: (reminderId: string) => void;
  onOpenReminderModal: () => void;
}

export const RemindersView: React.FC<RemindersViewProps> = ({
  reminders,
  categories,
  selectedCategory,
  onToggleReminder,
  onSnoozeReminder,
  onSelectReminder,
  onDeleteReminder,
  onOpenReminderModal,
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'completed'>('active');
  const [searchQuery, setSearchQuery] = useState('');

  const now = new Date();
  const todayKey = formatDateKey(now);
  const tomorrowObj = new Date(now);
  tomorrowObj.setDate(tomorrowObj.getDate() + 1);
  const tomorrowKey = formatDateKey(tomorrowObj);

  // Filter list
  const filteredReminders = reminders.filter((r) => {
    const matchesCat = selectedCategory ? r.category === selectedCategory : true;
    const matchesTab =
      filterTab === 'all'
        ? true
        : filterTab === 'active'
        ? !r.completed
        : r.completed;
    const matchesQuery =
      searchQuery === ''
        ? true
        : r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesTab && matchesQuery;
  });

  // Group into Overdue, Today, Upcoming, and Completed
  const overdue: Reminder[] = [];
  const todayReminders: Reminder[] = [];
  const upcomingReminders: Reminder[] = [];
  const completedReminders: Reminder[] = [];

  const nowMs = now.getTime();

  filteredReminders.forEach((r) => {
    if (r.completed) {
      completedReminders.push(r);
      return;
    }

    const remTime = new Date(r.dateTime).getTime();
    const dateKey = r.dateTime.split('T')[0];

    if (remTime < nowMs) {
      overdue.push(r);
    } else if (dateKey === todayKey) {
      todayReminders.push(r);
    } else {
      upcomingReminders.push(r);
    }
  });

  // Sort groups by time
  const sortByTime = (a: Reminder, b: Reminder) =>
    new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime();
  overdue.sort(sortByTime);
  todayReminders.sort(sortByTime);
  upcomingReminders.sort(sortByTime);

  const getCategory = (catId: string) => categories.find((c) => c.id === catId);

  const renderReminderCard = (rem: Reminder, isOverdueState = false) => {
    const cat = getCategory(rem.category);
    const dateParts = rem.dateTime.split('T');
    const dateStr = dateParts[0];
    const timeStr = dateParts[1] || '00:00';

    return (
      <div
        key={rem.id}
        className={`p-4 rounded-xl border transition-all ${
          rem.completed
            ? 'bg-[var(--app-canvas)]/60 border-[var(--app-border)] opacity-60'
            : isOverdueState
            ? 'bg-red-950/20 border-red-900/50 hover:border-red-500/60'
            : 'bg-[var(--app-elevated)] border-[var(--app-border)] hover:border-[var(--app-accent)]/50'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <button
              onClick={() => onToggleReminder(rem.id)}
              className={`mt-1 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                rem.completed
                  ? 'bg-emerald-500 border-emerald-500 text-black'
                  : 'border-[var(--app-border)] hover:border-[var(--app-accent)] bg-[var(--app-canvas)]'
              }`}
            >
              {rem.completed && <Check size={12} strokeWidth={3} />}
            </button>

            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onSelectReminder(rem)}>
              <div className="flex items-center gap-2">
                <h4
                  className={`text-sm font-semibold truncate ${
                    rem.completed ? 'line-through text-neutral-500' : 'text-neutral-100'
                  }`}
                >
                  {rem.title}
                </h4>
                {isOverdueState && (
                  <span className="text-[10px] font-mono text-red-400 uppercase font-bold tracking-wider">
                    Overdue
                  </span>
                )}
                {rem.recurrence && rem.recurrence !== 'none' && (
                  <span className="text-[10px] font-mono text-[var(--app-accent)]/90 lowercase">
                    ({rem.recurrence})
                  </span>
                )}
              </div>

              {rem.description && (
                <p className="text-xs text-neutral-300 mt-1 line-clamp-2">
                  {rem.description}
                </p>
              )}

              {/* Time & Category Metadata */}
              <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-neutral-400">
                <span className="font-mono text-[var(--app-accent)] font-medium flex items-center gap-1">
                  <Clock size={12} /> {timeStr} ({dateStr})
                </span>
                {cat && (
                  <>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: cat.colorHex }}
                      />
                      {cat.name}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Snooze & Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            {!rem.completed && (
              <div className="flex items-center gap-1 bg-[var(--app-surface)] p-1 rounded-lg border border-[var(--app-border)]">
                <button
                  onClick={() => onSnoozeReminder(rem.id, 15)}
                  className="px-2 py-0.5 text-[10px] font-mono text-neutral-300 hover:text-[var(--app-accent)] rounded hover:bg-white/10 transition-colors cursor-pointer"
                  title="Snooze 15 minutes"
                >
                  +15m
                </button>
                <button
                  onClick={() => onSnoozeReminder(rem.id, 60)}
                  className="px-2 py-0.5 text-[10px] font-mono text-neutral-300 hover:text-[var(--app-accent)] rounded hover:bg-white/10 transition-colors cursor-pointer"
                  title="Snooze 1 hour"
                >
                  +1h
                </button>
              </div>
            )}

            <button
              onClick={() => onSelectReminder(rem)}
              className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-white/10 transition-colors cursor-pointer"
              title="Edit Reminder"
            >
              <Edit3 size={14} />
            </button>
            <button
              onClick={() => onDeleteReminder(rem.id)}
              className="p-1.5 text-neutral-400 hover:text-red-400 rounded hover:bg-white/10 transition-colors cursor-pointer"
              title="Delete Reminder"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="text-xs font-mono text-[var(--app-accent)] font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Bell size={13} />
            Time Alert Engine
          </div>
          <h1 className="text-xl font-bold font-display text-white">
            Time-Based Reminders
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Set exact date and time notifications with audio chime and snooze controls
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => playReminderChime()}
            className="px-3 py-2 bg-[var(--app-elevated)] hover:bg-[var(--app-surface-hover)] text-neutral-300 hover:text-[var(--app-accent)] border border-[var(--app-border)] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Listen to the synthesized audio bell chime"
          >
            <Volume2 size={14} className="text-[var(--app-accent)]" /> Test Bell Sound
          </button>
          <button
            onClick={onOpenReminderModal}
            className="px-4 py-2 font-semibold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
            style={{
              backgroundColor: 'var(--app-accent)',
              color: 'var(--app-accent-text)',
            }}
          >
            <Plus size={15} /> Set Reminder
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-[var(--app-surface)] border border-[var(--app-border)] rounded-xl">
          <button
            onClick={() => setFilterTab('active')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              filterTab === 'active'
                ? 'shadow-xs'
                : 'text-neutral-400 hover:text-white'
            }`}
            style={
              filterTab === 'active'
                ? {
                    backgroundColor: 'var(--app-accent)',
                    color: 'var(--app-accent-text)',
                  }
                : {}
            }
          >
            Active ({overdue.length + todayReminders.length + upcomingReminders.length})
          </button>
          <button
            onClick={() => setFilterTab('completed')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              filterTab === 'completed'
                ? 'shadow-xs'
                : 'text-neutral-400 hover:text-white'
            }`}
            style={
              filterTab === 'completed'
                ? {
                    backgroundColor: 'var(--app-accent)',
                    color: 'var(--app-accent-text)',
                  }
                : {}
            }
          >
            Completed ({completedReminders.length})
          </button>
          <button
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              filterTab === 'all'
                ? 'shadow-xs'
                : 'text-neutral-400 hover:text-white'
            }`}
            style={
              filterTab === 'all'
                ? {
                    backgroundColor: 'var(--app-accent)',
                    color: 'var(--app-accent-text)',
                  }
                : {}
            }
          >
            All ({reminders.length})
          </button>
        </div>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter reminders..."
          className="px-3.5 py-1.5 bg-[var(--app-surface)] border border-[var(--app-border)] rounded-xl text-xs text-white placeholder-neutral-400 focus:outline-hidden focus:border-[var(--app-accent)] max-w-xs w-full"
        />
      </div>

      {/* Group Sections */}
      <div className="space-y-6">
        {/* Overdue Section */}
        {overdue.length > 0 && filterTab !== 'completed' && (
          <div className="bg-[var(--app-surface)] border border-red-950/60 rounded-2xl p-5 transition-colors">
            <div className="flex items-center gap-2 pb-3 border-b border-red-900/30 mb-4 text-red-400 font-bold text-xs font-display">
              <AlertTriangle size={15} />
              Overdue Reminders ({overdue.length})
            </div>
            <div className="space-y-3">
              {overdue.map((r) => renderReminderCard(r, true))}
            </div>
          </div>
        )}

        {/* Today Section */}
        {todayReminders.length > 0 && filterTab !== 'completed' && (
          <div className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl p-5 transition-colors">
            <div className="flex items-center gap-2 pb-3 border-b border-[var(--app-border)] mb-4 text-[var(--app-accent)] font-bold text-xs font-display">
              <Clock size={15} />
              Today's Schedule ({todayReminders.length})
            </div>
            <div className="space-y-3">
              {todayReminders.map((r) => renderReminderCard(r, false))}
            </div>
          </div>
        )}

        {/* Upcoming Section */}
        {upcomingReminders.length > 0 && filterTab !== 'completed' && (
          <div className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl p-5 transition-colors">
            <div className="flex items-center gap-2 pb-3 border-b border-[var(--app-border)] mb-4 text-neutral-300 font-bold text-xs font-display">
              <Calendar size={15} />
              Upcoming Days &amp; Months ({upcomingReminders.length})
            </div>
            <div className="space-y-3">
              {upcomingReminders.map((r) => renderReminderCard(r, false))}
            </div>
          </div>
        )}

        {/* Completed Section */}
        {completedReminders.length > 0 && (filterTab === 'completed' || filterTab === 'all') && (
          <div className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl p-5 transition-colors">
            <div className="flex items-center gap-2 pb-3 border-b border-[var(--app-border)] mb-4 text-emerald-400 font-bold text-xs font-display">
              <Check size={15} />
              Completed Archive ({completedReminders.length})
            </div>
            <div className="space-y-3">
              {completedReminders.map((r) => renderReminderCard(r, false))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {overdue.length === 0 && todayReminders.length === 0 && upcomingReminders.length === 0 && completedReminders.length === 0 && (
          <div className="text-center py-16 bg-[var(--app-surface)] border border-dashed border-[var(--app-border)] rounded-2xl">
            <Bell size={36} className="mx-auto text-neutral-500 mb-3" />
            <h3 className="text-sm font-semibold text-neutral-200">No Reminders Found</h3>
            <p className="text-xs text-neutral-400 mt-1 mb-4">
              Set exact time reminders for meetings, deadlines, or daily routines.
            </p>
            <button
              onClick={onOpenReminderModal}
              className="px-4 py-2 font-semibold text-xs rounded-xl cursor-pointer"
              style={{
                backgroundColor: 'var(--app-accent)',
                color: 'var(--app-accent-text)',
              }}
            >
              + Create First Reminder
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
