import React, { useState } from 'react';
import { Task, Category } from '../types';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Plus, 
  Check, 
  Clock, 
  ArrowRight, 
  MoreHorizontal,
  Flame
} from 'lucide-react';
import { formatDateKey } from '../utils/storage';

interface WeeklyViewProps {
  tasks: Task[];
  categories: Category[];
  selectedCategory: string | null;
  onToggleTask: (taskId: string) => void;
  onSelectTask: (task: Task) => void;
  onMoveToDate: (taskId: string, newDateStr: string) => void;
  onOpenTaskModalWithDate: (date: string) => void;
}

export const WeeklyView: React.FC<WeeklyViewProps> = ({
  tasks,
  categories,
  selectedCategory,
  onToggleTask,
  onSelectTask,
  onMoveToDate,
  onOpenTaskModalWithDate,
}) => {
  // Current anchor date (defaults to today)
  const [currentAnchorDate, setCurrentAnchorDate] = useState<Date>(new Date());

  // Helper to get Monday of the current anchor week
  const getWeekDays = (anchor: Date) => {
    const d = new Date(anchor);
    const day = d.getDay(); // 0 is Sunday, 1 is Monday
    const diffToMonday = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diffToMonday);

    const weekDays: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(d);
      dayDate.setDate(d.getDate() + i);
      weekDays.push(dayDate);
    }
    return weekDays;
  };

  const weekDays = getWeekDays(currentAnchorDate);
  const startDay = weekDays[0];
  const endDay = weekDays[6];

  const changeWeek = (offset: number) => {
    const d = new Date(currentAnchorDate);
    d.setDate(d.getDate() + offset * 7);
    setCurrentAnchorDate(d);
  };

  const jumpToThisWeek = () => {
    setCurrentAnchorDate(new Date());
  };

  const todayStr = formatDateKey(new Date());

  // Filter tasks belonging to this week
  const weekDayKeys = weekDays.map((d) => formatDateKey(d));
  const weekTasks = tasks.filter((t) => {
    const matchesWeek = weekDayKeys.includes(t.dueDate);
    const matchesCat = selectedCategory ? t.category === selectedCategory : true;
    return matchesWeek && matchesCat;
  });

  const weekCompleted = weekTasks.filter((t) => t.completed).length;
  const weekProgress = weekTasks.length > 0 ? Math.round((weekCompleted / weekTasks.length) * 100) : 0;

  const getCategory = (catId: string) => categories.find((c) => c.id === catId);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Week Header & Control Bar */}
      <div className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[var(--app-elevated)] border border-[var(--app-border)] rounded-xl p-1">
            <button
              onClick={() => changeWeek(-1)}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              title="Previous Week"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={jumpToThisWeek}
              className="px-3 py-1 text-xs font-semibold text-neutral-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            >
              Current Week
            </button>
            <button
              onClick={() => changeWeek(1)}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              title="Next Week"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div>
            <h1 className="text-lg font-bold font-display text-white">
              {startDay.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} –{' '}
              {endDay.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </h1>
            <p className="text-xs text-neutral-400">
              7-Day Sprint Planning &amp; Task Distribution
            </p>
          </div>
        </div>

        {/* Weekly Progress Meter */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs font-mono text-white font-semibold tabular-nums">
              {weekCompleted} of {weekTasks.length} Completed
            </div>
            <div className="text-[10px] text-neutral-400">Weekly Target Progress</div>
          </div>
          <div className="w-28 h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${weekProgress}%`,
                backgroundColor: 'var(--app-accent)',
              }}
            />
          </div>
        </div>
      </div>

      {/* 7 Columns Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
        {weekDays.map((dayDate) => {
          const dayKey = formatDateKey(dayDate);
          const isToday = dayKey === todayStr;
          const dayName = dayDate.toLocaleDateString(undefined, { weekday: 'short' });
          const dayNum = dayDate.getDate();

          // Next day for quick postpone
          const nextDayObj = new Date(dayDate);
          nextDayObj.setDate(nextDayObj.getDate() + 1);
          const nextDayKey = formatDateKey(nextDayObj);

          const dayTasks = weekTasks
            .filter((t) => t.dueDate === dayKey)
            .sort((a, b) => {
              if (a.completed !== b.completed) return a.completed ? 1 : -1;
              return (a.dueTime || '99:99').localeCompare(b.dueTime || '99:99');
            });

          const dayCompleted = dayTasks.filter((t) => t.completed).length;

          return (
            <div
              key={dayKey}
              className={`flex flex-col bg-[var(--app-surface)] rounded-2xl border transition-all min-h-[480px] overflow-hidden ${
                isToday
                  ? 'border-[var(--app-accent)] shadow-lg shadow-black/20'
                  : 'border-[var(--app-border)] hover:border-[var(--app-accent)]/40'
              }`}
            >
              {/* Column Header */}
              <div
                className={`p-3 border-b flex items-center justify-between ${
                  isToday
                    ? 'border-[var(--app-accent)]/40 bg-[var(--app-accent)]/15'
                    : 'border-[var(--app-border)] bg-[var(--app-elevated)]'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white font-display uppercase tracking-wider">
                      {dayName}
                    </span>
                    {isToday && (
                      <span
                        className="text-[9px] font-mono px-1.5 py-0.2 rounded font-bold"
                        style={{
                          backgroundColor: 'var(--app-accent)',
                          color: 'var(--app-accent-text)',
                        }}
                      >
                        TODAY
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-bold font-mono text-neutral-200 mt-0.5 tabular-nums">
                    {dayNum}
                  </div>
                </div>

                <div className="text-[11px] font-mono text-neutral-400">
                  {dayCompleted}/{dayTasks.length}
                </div>
              </div>

              {/* Tasks List */}
              <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[520px]">
                {dayTasks.length === 0 ? (
                  <div className="text-center py-8 text-[11px] text-neutral-500">
                    No tasks
                  </div>
                ) : (
                  dayTasks.map((task) => {
                    const cat = getCategory(task.category);
                    return (
                      <div
                        key={task.id}
                        className={`p-2.5 rounded-xl border text-xs transition-colors group ${
                          task.completed
                            ? 'bg-[var(--app-canvas)]/60 border-[var(--app-border)] opacity-60'
                            : 'bg-[var(--app-elevated)] border-[var(--app-border)] hover:border-[var(--app-accent)]/50'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <button
                            onClick={() => onToggleTask(task.id)}
                            className={`mt-0.5 w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                              task.completed
                                ? 'bg-emerald-500 border-emerald-500 text-black'
                                : 'border-[var(--app-border)] hover:border-[var(--app-accent)] bg-[var(--app-canvas)]'
                            }`}
                          >
                            {task.completed && <Check size={10} strokeWidth={3} />}
                          </button>

                          <div
                            className="flex-1 min-w-0 cursor-pointer"
                            onClick={() => onSelectTask(task)}
                          >
                            <h4
                              className={`text-[11px] font-semibold truncate leading-tight ${
                                task.completed ? 'line-through text-neutral-500' : 'text-neutral-100'
                              }`}
                            >
                              {task.title}
                            </h4>

                            <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-neutral-400">
                              {task.dueTime && (
                                <span className="font-mono text-[var(--app-accent)] flex items-center gap-0.5">
                                  <Clock size={10} /> {task.dueTime}
                                </span>
                              )}
                              {cat && (
                                <span
                                  className="w-1.5 h-1.5 rounded-full"
                                  style={{ backgroundColor: cat.colorHex }}
                                  title={cat.name}
                                />
                              )}
                              {task.subtasks.length > 0 && (
                                <span className="font-mono text-[9px] text-neutral-400">
                                  {task.subtasks.filter((s) => s.completed).length}/
                                  {task.subtasks.length}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Quick postpone to next day button on hover */}
                        {!task.completed && (
                          <div className="mt-2 pt-1.5 border-t border-[var(--app-border)]/50 flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => onMoveToDate(task.id, nextDayKey)}
                              className="text-[10px] text-neutral-400 hover:text-[var(--app-accent)] flex items-center gap-0.5 transition-colors cursor-pointer"
                              title="Move to next day"
                            >
                              Move <ArrowRight size={10} />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Column Footer: Direct + Add */}
              <div className="p-2 border-t border-[var(--app-border)] bg-[var(--app-elevated)]">
                <button
                  onClick={() => onOpenTaskModalWithDate(dayKey)}
                  className="w-full py-1.5 text-[11px] text-neutral-400 hover:text-[var(--app-accent)] hover:bg-[var(--app-surface)] rounded-lg transition-colors flex items-center justify-center gap-1 font-medium cursor-pointer"
                >
                  <Plus size={12} /> Add
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
