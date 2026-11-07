import React, { useState } from 'react';
import { Task, Category, Priority } from '../types';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  Check, 
  Plus, 
  AlertCircle, 
  Trash2, 
  Edit3, 
  ArrowRight,
  MoreVertical
} from 'lucide-react';
import { formatDateKey } from '../utils/storage';

interface DailyViewProps {
  tasks: Task[];
  categories: Category[];
  selectedCategory: string | null;
  onToggleTask: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onSelectTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onMoveToDate: (taskId: string, newDateStr: string) => void;
  onOpenTaskModalWithDate: (date: string, time?: string) => void;
}

export const DailyView: React.FC<DailyViewProps> = ({
  tasks,
  categories,
  selectedCategory,
  onToggleTask,
  onToggleSubtask,
  onSelectTask,
  onDeleteTask,
  onMoveToDate,
  onOpenTaskModalWithDate,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [quickTitle, setQuickTitle] = useState('');
  const [activeMenuTaskId, setActiveMenuTaskId] = useState<string | null>(null);

  const dateStr = formatDateKey(selectedDate);
  const isToday = dateStr === formatDateKey(new Date());

  const changeDateBy = (offset: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + offset);
    setSelectedDate(d);
  };

  const jumpToToday = () => {
    setSelectedDate(new Date());
  };

  // Filter tasks for this day
  const dayTasks = tasks.filter((t) => {
    const matchesDate = t.dueDate === dateStr;
    const matchesCat = selectedCategory ? t.category === selectedCategory : true;
    return matchesDate && matchesCat;
  });

  const completedCount = dayTasks.filter((t) => t.completed).length;
  const progressPercent = dayTasks.length > 0 ? Math.round((completedCount / dayTasks.length) * 100) : 0;
  const totalEstimatedMinutes = dayTasks.reduce((acc, t) => acc + (t.estimatedMinutes || 0), 0);

  // Separate timed tasks and anytime tasks
  const timedTasks = dayTasks
    .filter((t) => !!t.dueTime)
    .sort((a, b) => (a.dueTime || '').localeCompare(b.dueTime || ''));
  const anytimeTasks = dayTasks.filter((t) => !t.dueTime);

  // Time slots for schedule (07:00 to 22:00)
  const hours = Array.from({ length: 16 }, (_, i) => i + 7);

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;
    onOpenTaskModalWithDate(dateStr);
    setQuickTitle('');
  };

  const getCategory = (catId: string) => categories.find((c) => c.id === catId);

  // Tomorrow date string for postpone
  const tomorrowObj = new Date(selectedDate);
  tomorrowObj.setDate(tomorrowObj.getDate() + 1);
  const tomorrowStr = formatDateKey(tomorrowObj);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Date Navigation & Summary Bar */}
      <div className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[var(--app-elevated)] border border-[var(--app-border)] rounded-xl p-1">
            <button
              onClick={() => changeDateBy(-1)}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              title="Previous Day"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={jumpToToday}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                isToday
                  ? 'shadow-xs'
                  : 'text-neutral-300 hover:text-white hover:bg-white/10'
              }`}
              style={
                isToday
                  ? {
                      backgroundColor: 'var(--app-accent)',
                      color: 'var(--app-accent-text)',
                    }
                  : {}
              }
            >
              Today
            </button>
            <button
              onClick={() => changeDateBy(1)}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              title="Next Day"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div>
            <h1 className="text-lg font-bold font-display text-white">
              {selectedDate.toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </h1>
            <p className="text-xs text-neutral-400">
              {dayTasks.length} tasks scheduled · {Math.round(totalEstimatedMinutes / 60)}h {totalEstimatedMinutes % 60}m focus planned
            </p>
          </div>
        </div>

        {/* Date picker + Stats */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-neutral-400">{completedCount}/{dayTasks.length} Done</span>
            <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${progressPercent}%`,
                  backgroundColor: 'var(--app-accent)',
                }}
              />
            </div>
          </div>

          <button
            onClick={() => onOpenTaskModalWithDate(dateStr)}
            className="px-4 py-2 font-semibold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
            style={{
              backgroundColor: 'var(--app-accent)',
              color: 'var(--app-accent-text)',
            }}
          >
            <Plus size={15} /> Add Task
          </button>
        </div>
      </div>

      {/* Main Grid: Hour Timeline (left) + Anytime / Priority Tasks (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hourly Timeline (2 cols) */}
        <div className="lg:col-span-2 bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl p-5 transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--app-border)] mb-4">
            <div className="text-xs font-bold font-display text-white flex items-center gap-2">
              <Clock size={15} className="text-[var(--app-accent)]" />
              Hour-by-Hour Timeline Schedule
            </div>
            <span className="text-[11px] font-mono text-neutral-400">
              Click any hour slot to schedule
            </span>
          </div>

          <div className="space-y-1.5">
            {hours.map((hour) => {
              const hourStr = `${String(hour).padStart(2, '0')}:00`;
              const tasksInThisHour = timedTasks.filter((t) => {
                if (!t.dueTime) return false;
                const taskHour = parseInt(t.dueTime.split(':')[0], 10);
                return taskHour === hour;
              });

              return (
                <div
                  key={hour}
                  className="flex items-start gap-3 py-2 border-b border-[var(--app-border)]/50 group min-h-[52px]"
                >
                  {/* Hour label */}
                  <div className="w-14 text-right font-mono text-xs text-neutral-400 shrink-0 pt-1 group-hover:text-[var(--app-accent)] transition-colors">
                    {hourStr}
                  </div>

                  {/* Hour slot content */}
                  <div className="flex-1 min-w-0">
                    {tasksInThisHour.length === 0 ? (
                      <button
                        onClick={() => onOpenTaskModalWithDate(dateStr, hourStr)}
                        className="w-full text-left py-1 px-2.5 rounded-lg text-xs text-neutral-400 hover:text-white hover:bg-[var(--app-elevated)] transition-colors border border-transparent hover:border-[var(--app-border)] flex items-center gap-2 cursor-pointer"
                      >
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--app-accent)] font-mono text-[11px]">
                          + Schedule at {hourStr}
                        </span>
                      </button>
                    ) : (
                      <div className="space-y-1.5">
                        {tasksInThisHour.map((task) => {
                          const cat = getCategory(task.category);
                          return (
                            <div
                              key={task.id}
                              className={`p-3 rounded-xl border flex items-start justify-between gap-3 transition-colors ${
                                task.completed
                                  ? 'bg-[var(--app-canvas)]/60 border-[var(--app-border)] opacity-60'
                                  : 'bg-[var(--app-elevated)] border-[var(--app-border)] hover:border-[var(--app-accent)]/50'
                              }`}
                            >
                              <div className="flex items-start gap-3 flex-1 min-w-0">
                                <button
                                  onClick={() => onToggleTask(task.id)}
                                  className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                                    task.completed
                                      ? 'bg-emerald-500 border-emerald-500 text-black'
                                      : 'border-[var(--app-border)] hover:border-[var(--app-accent)] bg-[var(--app-canvas)]'
                                  }`}
                                >
                                  {task.completed && <Check size={12} strokeWidth={3} />}
                                </button>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-[11px] text-[var(--app-accent)] font-semibold">
                                      {task.dueTime}
                                    </span>
                                    <h4
                                      onClick={() => onSelectTask(task)}
                                      className={`text-xs font-semibold cursor-pointer truncate ${
                                        task.completed ? 'line-through text-neutral-500' : 'text-white'
                                      }`}
                                    >
                                      {task.title}
                                    </h4>
                                  </div>

                                  {task.description && (
                                    <p className="text-[11px] text-neutral-300 line-clamp-1 mt-0.5">
                                      {task.description}
                                    </p>
                                  )}

                                  {/* Subtasks inline preview */}
                                  {task.subtasks.length > 0 && (
                                    <div className="mt-2 space-y-1 pl-1">
                                      {task.subtasks.map((st) => (
                                        <label
                                          key={st.id}
                                          className="flex items-center gap-2 text-[11px] cursor-pointer text-neutral-300 hover:text-white"
                                        >
                                          <input
                                            type="checkbox"
                                            checked={st.completed}
                                            onChange={() => onToggleSubtask(task.id, st.id)}
                                            className="rounded border-[var(--app-border)] focus:ring-0 bg-[var(--app-canvas)] cursor-pointer"
                                            style={{ accentColor: 'var(--app-accent)' }}
                                          />
                                          <span className={st.completed ? 'line-through text-neutral-500' : ''}>
                                            {st.title}
                                          </span>
                                        </label>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Task action menu */}
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={() => onMoveToDate(task.id, tomorrowStr)}
                                  className="px-2 py-1 text-[10px] text-neutral-300 hover:text-[var(--app-accent)] bg-[var(--app-surface)] hover:bg-[var(--app-surface-hover)] rounded-lg border border-[var(--app-border)] transition-colors cursor-pointer"
                                  title="Postpone to tomorrow"
                                >
                                  Postpone
                                </button>
                                <button
                                  onClick={() => onSelectTask(task)}
                                  className="p-1 text-neutral-400 hover:text-white cursor-pointer"
                                  title="Edit Task"
                                >
                                  <Edit3 size={13} />
                                </button>
                                <button
                                  onClick={() => onDeleteTask(task.id)}
                                  className="p-1 text-neutral-400 hover:text-red-400 cursor-pointer"
                                  title="Delete Task"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Anytime / Unscheduled for Today (1 col) */}
        <div className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl p-5 flex flex-col transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--app-border)] mb-4">
            <div className="text-xs font-bold font-display text-white">
              Anytime Today ({anytimeTasks.length})
            </div>
            <span className="text-[11px] font-mono text-neutral-400">Flexible execution</span>
          </div>

          <div className="flex-1 space-y-2.5 overflow-y-auto">
            {anytimeTasks.length === 0 ? (
              <div className="text-center py-10 text-neutral-400 text-xs">
                No flexible tasks today. Everything is either scheduled to a time slot or finished!
              </div>
            ) : (
              anytimeTasks.map((task) => {
                const cat = getCategory(task.category);
                return (
                  <div
                    key={task.id}
                    className={`p-3 rounded-xl border transition-colors ${
                      task.completed
                        ? 'bg-[var(--app-canvas)]/60 border-[var(--app-border)] opacity-60'
                        : 'bg-[var(--app-elevated)] border-[var(--app-border)] hover:border-[var(--app-accent)]/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5 flex-1 min-w-0">
                        <button
                          onClick={() => onToggleTask(task.id)}
                          className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                            task.completed
                              ? 'bg-emerald-500 border-emerald-500 text-black'
                              : 'border-[var(--app-border)] hover:border-[var(--app-accent)] bg-[var(--app-canvas)]'
                          }`}
                        >
                          {task.completed && <Check size={12} strokeWidth={3} />}
                        </button>

                        <div className="flex-1 min-w-0">
                          <h4
                            onClick={() => onSelectTask(task)}
                            className={`text-xs font-semibold cursor-pointer truncate ${
                              task.completed ? 'line-through text-neutral-500' : 'text-neutral-100'
                            }`}
                          >
                            {task.title}
                          </h4>
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

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onSelectTask(task)}
                          className="p-1 text-neutral-400 hover:text-white cursor-pointer"
                        >
                          <Edit3 size={12} />
                        </button>
                        <button
                          onClick={() => onDeleteTask(task.id)}
                          className="p-1 text-neutral-400 hover:text-red-400 cursor-pointer"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick add card at bottom */}
          <div className="mt-4 pt-3 border-t border-[var(--app-border)]">
            <button
              onClick={() => onOpenTaskModalWithDate(dateStr)}
              className="w-full py-2 bg-[var(--app-elevated)] hover:bg-[var(--app-surface-hover)] border border-[var(--app-border)] rounded-xl text-xs font-semibold text-neutral-200 hover:text-[var(--app-accent)] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus size={13} /> + Add Task for {isToday ? 'Today' : dateStr}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
