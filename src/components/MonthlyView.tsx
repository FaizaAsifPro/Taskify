import React, { useState } from 'react';
import { Task, Reminder, Category } from '../types';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Plus, 
  Check, 
  Clock, 
  Bell, 
  CheckSquare, 
  AlertCircle 
} from 'lucide-react';
import { formatDateKey } from '../utils/storage';

interface MonthlyViewProps {
  tasks: Task[];
  reminders: Reminder[];
  categories: Category[];
  selectedCategory: string | null;
  onToggleTask: (taskId: string) => void;
  onSelectTask: (task: Task) => void;
  onSelectReminder: (reminder: Reminder) => void;
  onOpenTaskModalWithDate: (date: string) => void;
}

export const MonthlyView: React.FC<MonthlyViewProps> = ({
  tasks,
  reminders,
  categories,
  selectedCategory,
  onToggleTask,
  onSelectTask,
  onSelectReminder,
  onOpenTaskModalWithDate,
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDayKey, setSelectedDayKey] = useState<string>(formatDateKey(new Date()));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const changeMonth = (offset: number) => {
    const d = new Date(year, month + offset, 1);
    setCurrentDate(d);
  };

  const jumpToCurrentMonth = () => {
    setCurrentDate(new Date());
    setSelectedDayKey(formatDateKey(new Date()));
  };

  const todayKey = formatDateKey(new Date());

  // First day of month and total days
  const firstDayOfMonth = new Date(year, month, 1);
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Days in previous month for lead-in padding
  const prevMonthDays = new Date(year, month, 0).getDate();

  // Build calendar matrix
  const calendarCells = [];

  // Previous month padding
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, prevMonthDays - i);
    calendarCells.push({
      date: d,
      dateKey: formatDateKey(d),
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month, i);
    calendarCells.push({
      date: d,
      dateKey: formatDateKey(d),
      isCurrentMonth: true,
    });
  }

  // Trailing next month padding (fill out 35 or 42 cells)
  const remainingCells = 35 - calendarCells.length;
  const paddingCount = remainingCells < 0 ? 42 - calendarCells.length : remainingCells;
  for (let i = 1; i <= paddingCount; i++) {
    const d = new Date(year, month + 1, i);
    calendarCells.push({
      date: d,
      dateKey: formatDateKey(d),
      isCurrentMonth: false,
    });
  }

  // Monthly stats
  const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  const monthTasks = tasks.filter((t) => {
    const isThisMonth = t.dueDate.startsWith(monthPrefix);
    const matchesCat = selectedCategory ? t.category === selectedCategory : true;
    return isThisMonth && matchesCat;
  });
  const monthCompleted = monthTasks.filter((t) => t.completed).length;
  const monthProgress = monthTasks.length > 0 ? Math.round((monthCompleted / monthTasks.length) * 100) : 0;

  // Selected Day tasks & reminders
  const selectedDayTasks = tasks.filter((t) => {
    const matchesDay = t.dueDate === selectedDayKey;
    const matchesCat = selectedCategory ? t.category === selectedCategory : true;
    return matchesDay && matchesCat;
  });

  const selectedDayReminders = reminders.filter((r) => r.dateTime.startsWith(selectedDayKey));

  const getCategory = (catId: string) => categories.find((c) => c.id === catId);

  const monthName = currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Month Navigation & Summary */}
      <div className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[var(--app-elevated)] border border-[var(--app-border)] rounded-xl p-1">
            <button
              onClick={() => changeMonth(-1)}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={jumpToCurrentMonth}
              className="px-3 py-1 text-xs font-semibold text-neutral-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            >
              This Month
            </button>
            <button
              onClick={() => changeMonth(1)}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              title="Next Month"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div>
            <h1 className="text-xl font-bold font-display text-white">
              {monthName}
            </h1>
            <p className="text-xs text-neutral-400">
              Monthly overview of milestones, task deadlines and reminders
            </p>
          </div>
        </div>

        {/* Month Stats */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs font-mono text-white font-semibold tabular-nums">
              {monthCompleted}/{monthTasks.length} Done ({monthProgress}%)
            </div>
            <div className="text-[10px] text-neutral-400">Total Month Output</div>
          </div>
          <div className="w-28 h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${monthProgress}%`,
                backgroundColor: 'var(--app-accent)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Calendar Grid (2 cols) + Selected Day Inspector (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid (2 cols) */}
        <div className="lg:col-span-2 bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl p-5 transition-colors">
          {/* Day of week headers */}
          <div className="grid grid-cols-7 gap-1 text-center pb-3 border-b border-[var(--app-border)] mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="text-xs font-mono font-semibold uppercase text-neutral-400">
                {d}
              </div>
            ))}
          </div>

          {/* Day Cells */}
          <div className="grid grid-cols-7 gap-1.5">
            {calendarCells.map((cell) => {
              const dayTasks = tasks.filter((t) => t.dueDate === cell.dateKey);
              const dayReminders = reminders.filter((r) => r.dateTime.startsWith(cell.dateKey));
              const isToday = cell.dateKey === todayKey;
              const isSelected = cell.dateKey === selectedDayKey;
              const completedTasksCount = dayTasks.filter((t) => t.completed).length;
              const hasUrgent = dayTasks.some((t) => t.priority === 'urgent' && !t.completed);

              return (
                <div
                  key={cell.dateKey}
                  onClick={() => setSelectedDayKey(cell.dateKey)}
                  className={`min-h-[82px] p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-[var(--app-accent)] bg-[var(--app-elevated)] shadow-md shadow-black/20'
                      : isToday
                      ? 'border-[var(--app-accent)]/50 bg-[var(--app-accent)]/10'
                      : cell.isCurrentMonth
                      ? 'border-[var(--app-border)] bg-[var(--app-elevated)]/60 hover:border-[var(--app-accent)]/40'
                      : 'border-[var(--app-border)]/40 bg-[var(--app-canvas)] opacity-40 hover:opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-mono font-semibold ${
                        isToday
                          ? 'text-[var(--app-accent)]'
                          : cell.isCurrentMonth
                          ? 'text-neutral-200'
                          : 'text-neutral-500'
                      }`}
                    >
                      {cell.date.getDate()}
                    </span>

                    {/* Small badges/dots */}
                    <div className="flex items-center gap-1">
                      {hasUrgent && (
                        <span
                          className="w-1.5 h-1.5 rounded-full bg-red-500"
                          title="Urgent task"
                        />
                      )}
                      {dayReminders.length > 0 && (
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: 'var(--app-accent)' }}
                          title={`${dayReminders.length} reminder(s)`}
                        />
                      )}
                    </div>
                  </div>

                  {/* Task counts preview */}
                  <div className="mt-1 space-y-1">
                    {dayTasks.length > 0 && (
                      <div className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--app-surface)] text-neutral-300 truncate">
                        {completedTasksCount}/{dayTasks.length} tasks
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Inspector Drawer (1 col) */}
        <div className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl p-5 flex flex-col transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--app-border)] mb-4">
            <div>
              <div className="text-xs font-mono text-[var(--app-accent)] font-semibold uppercase">
                {selectedDayKey === todayKey ? 'Today' : 'Selected Date'}
              </div>
              <h3 className="text-base font-bold font-display text-white">
                {new Date(selectedDayKey + 'T00:00:00').toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </h3>
            </div>

            <button
              onClick={() => onOpenTaskModalWithDate(selectedDayKey)}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              style={{
                backgroundColor: 'var(--app-accent)',
                color: 'var(--app-accent-text)',
              }}
            >
              <Plus size={13} /> Add
            </button>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto max-h-[500px]">
            {/* Scheduled Tasks for Selected Day */}
            <div>
              <div className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5 mb-2">
                <CheckSquare size={13} className="text-[var(--app-accent)]" />
                Scheduled Tasks ({selectedDayTasks.length})
              </div>

              {selectedDayTasks.length === 0 ? (
                <div className="text-xs text-neutral-400 py-3 text-center bg-[var(--app-elevated)] rounded-xl border border-[var(--app-border)]">
                  No tasks scheduled on this day.
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedDayTasks.map((t) => {
                    const cat = getCategory(t.category);
                    return (
                      <div
                        key={t.id}
                        className={`p-2.5 rounded-xl border text-xs transition-colors ${
                          t.completed
                            ? 'bg-[var(--app-canvas)]/60 border-[var(--app-border)] opacity-60'
                            : 'bg-[var(--app-elevated)] border-[var(--app-border)] hover:border-[var(--app-accent)]/40'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <button
                            onClick={() => onToggleTask(t.id)}
                            className={`mt-0.5 w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                              t.completed
                                ? 'bg-emerald-500 border-emerald-500 text-black'
                                : 'border-[var(--app-border)] hover:border-[var(--app-accent)] bg-[var(--app-canvas)]'
                            }`}
                          >
                            {t.completed && <Check size={10} strokeWidth={3} />}
                          </button>

                          <div
                            className="flex-1 min-w-0 cursor-pointer"
                            onClick={() => onSelectTask(t)}
                          >
                            <div className="flex items-center gap-1.5">
                              {t.dueTime && (
                                <span className="font-mono text-[10px] text-[var(--app-accent)] font-semibold">
                                  {t.dueTime}
                                </span>
                              )}
                              <h4
                                className={`text-xs font-semibold truncate ${
                                  t.completed ? 'line-through text-neutral-500' : 'text-white'
                                }`}
                              >
                                {t.title}
                              </h4>
                            </div>

                            {cat && (
                              <div className="flex items-center gap-1.5 mt-1 text-[10px] text-neutral-400">
                                <span
                                  className="w-1.5 h-1.5 rounded-full"
                                  style={{ backgroundColor: cat.colorHex }}
                                />
                                <span>{cat.name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Reminders on this day */}
            <div>
              <div className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5 mb-2">
                <Bell size={13} className="text-[var(--app-accent)]" />
                Time Reminders ({selectedDayReminders.length})
              </div>

              {selectedDayReminders.length === 0 ? (
                <div className="text-xs text-neutral-400 py-3 text-center bg-[var(--app-elevated)] rounded-xl border border-[var(--app-border)]">
                  No reminders set for this day.
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedDayReminders.map((rem) => (
                    <div
                      key={rem.id}
                      onClick={() => onSelectReminder(rem)}
                      className="p-2.5 bg-[var(--app-elevated)] border border-[var(--app-border)] hover:border-[var(--app-accent)]/40 rounded-xl text-xs cursor-pointer transition-colors"
                    >
                      <div className="font-semibold text-white truncate">{rem.title}</div>
                      <div className="flex items-center gap-1 text-[11px] font-mono text-[var(--app-accent)] mt-1">
                        <Clock size={11} /> {rem.dateTime.split('T')[1]}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
