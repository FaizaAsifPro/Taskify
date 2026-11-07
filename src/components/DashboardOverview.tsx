import React from 'react';
import { Task, Reminder, Note, Category, ActiveView } from '../types';
import { 
  CheckSquare, 
  Bell, 
  FileText, 
  Calendar, 
  Clock, 
  ArrowRight, 
  Check, 
  Flame, 
  Sparkles, 
  Pin,
  ChevronRight
} from 'lucide-react';
import { formatDateKey } from '../utils/storage';

interface DashboardOverviewProps {
  tasks: Task[];
  reminders: Reminder[];
  notes: Note[];
  categories: Category[];
  onSelectView: (view: ActiveView) => void;
  onToggleTask: (taskId: string) => void;
  onToggleReminder: (reminderId: string) => void;
  onSelectTask: (task: Task) => void;
  onSelectReminder: (reminder: Reminder) => void;
  onSelectNote: (note: Note) => void;
  onOpenTaskModal: () => void;
  onOpenReminderModal: () => void;
  onOpenNoteModal: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  tasks,
  reminders,
  notes,
  categories,
  onSelectView,
  onToggleTask,
  onToggleReminder,
  onSelectTask,
  onSelectReminder,
  onSelectNote,
  onOpenTaskModal,
  onOpenReminderModal,
  onOpenNoteModal,
}) => {
  const todayKey = formatDateKey(new Date());

  // Filter tasks for today
  const todayTasks = tasks.filter((t) => t.dueDate === todayKey);
  const completedTodayTasks = todayTasks.filter((t) => t.completed).length;
  const todayProgress = todayTasks.length > 0 ? Math.round((completedTodayTasks / todayTasks.length) * 100) : 0;

  // Active / Upcoming reminders
  const activeReminders = reminders
    .filter((r) => !r.completed)
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
    .slice(0, 4);

  // Pinned Notes
  const pinnedNotes = notes.filter((n) => n.pinned && !n.archived).slice(0, 3);

  const getCategory = (catId: string) => {
    return categories.find((c) => c.id === catId);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner / Welcome Row */}
      <div className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl p-6 relative overflow-hidden transition-colors">
        <div 
          className="absolute top-0 right-0 w-80 h-full pointer-events-none opacity-20"
          style={{
            background: 'linear-gradient(to left, var(--app-accent), transparent)',
          }}
        />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div 
              className="text-xs font-mono font-semibold tracking-wider uppercase mb-1 flex items-center gap-1.5"
              style={{ color: 'var(--app-accent)' }}
            >
              <Sparkles size={13} />
              Executive Productivity Brief
            </div>
            <h1 className="text-2xl font-bold font-display text-white tracking-tight">
              Ready for focused execution.
            </h1>
            <p className="text-xs text-neutral-300 mt-1 max-w-xl">
              You have {todayTasks.length - completedTodayTasks} tasks remaining today and {activeReminders.length} active time-targeted reminders.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenTaskModal}
              className="px-3.5 py-2 text-xs font-semibold bg-[var(--app-elevated)] hover:bg-[var(--app-surface-hover)] text-white border border-[var(--app-border)] rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <CheckSquare size={14} className="text-[var(--app-accent)]" />
              Schedule Task
            </button>
            <button
              onClick={onOpenReminderModal}
              className="px-3.5 py-2 text-xs font-semibold bg-[var(--app-elevated)] hover:bg-[var(--app-surface-hover)] text-white border border-[var(--app-border)] rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Bell size={14} className="text-[var(--app-accent)]" />
              Set Reminder
            </button>
            <button
              onClick={onOpenNoteModal}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              style={{
                backgroundColor: 'var(--app-accent)',
                color: 'var(--app-accent-text)',
              }}
            >
              <FileText size={14} />
              Quick Note
            </button>
          </div>
        </div>
      </div>

      {/* 4 Metric Strips */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl p-4 transition-colors">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium">Today's Focus</span>
            <CheckSquare size={16} className="text-[var(--app-accent)]" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {completedTodayTasks}/{todayTasks.length}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500" 
                style={{ 
                  width: `${todayProgress}%`,
                  backgroundColor: 'var(--app-accent)' 
                }}
              />
            </div>
            <span className="text-[11px] font-mono text-neutral-400 tabular-nums">{todayProgress}%</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl p-4 transition-colors">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium">Pending Reminders</span>
            <Bell size={16} className="text-[var(--app-accent)]" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {activeReminders.length}
          </div>
          <div className="text-[11px] text-neutral-400 mt-2 flex items-center gap-1">
            <Clock size={12} className="text-[var(--app-accent)]" />
            <span>Time-critical notifications</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl p-4 transition-colors">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium">Active Notes</span>
            <FileText size={16} className="text-[var(--app-accent)]" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {notes.filter((n) => !n.archived).length}
          </div>
          <div className="text-[11px] text-neutral-400 mt-2 flex items-center gap-1">
            <Pin size={12} className="text-[var(--app-accent)]" />
            <span>{pinnedNotes.length} pinned to desktop</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl p-4 transition-colors">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium">Momentum Streak</span>
            <Flame size={16} className="text-[var(--app-accent)] fill-current" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            7 Days
          </div>
          <div className="text-[11px] font-mono mt-2" style={{ color: 'var(--app-accent)' }}>
            Unbroken consistency
          </div>
        </div>
      </div>

      {/* Main 2-Column Split: Today's Schedule & Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Tasks Timeline (2 cols) */}
        <div className="lg:col-span-2 bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl p-5 transition-colors">
          <div className="flex items-center justify-between pb-4 border-b border-[var(--app-border)] mb-4">
            <div>
              <h3 className="text-sm font-bold font-display text-white flex items-center gap-2">
                <Calendar size={16} className="text-[var(--app-accent)]" />
                Today's Scheduled Tasks
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Tasks allocated for today ({todayKey})
              </p>
            </div>
            <button
              onClick={() => onSelectView('daily')}
              className="text-xs text-[var(--app-accent)] hover:underline font-medium flex items-center gap-1 transition-colors cursor-pointer"
            >
              Open Day Timeline <ArrowRight size={13} />
            </button>
          </div>

          {todayTasks.length === 0 ? (
            <div className="text-center py-10 bg-[var(--app-elevated)] rounded-xl border border-dashed border-[var(--app-border)]">
              <CheckSquare size={32} className="mx-auto text-neutral-500 mb-2" />
              <div className="text-xs font-semibold text-neutral-300">No tasks scheduled for today</div>
              <p className="text-[11px] text-neutral-400 mt-1 mb-3">Add items to keep your daily workflow sharp.</p>
              <button
                onClick={onOpenTaskModal}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                style={{
                  backgroundColor: 'var(--app-accent)',
                  color: 'var(--app-accent-text)',
                }}
              >
                + Schedule Task
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {todayTasks.map((task) => {
                const cat = getCategory(task.category);
                const subCompleted = task.subtasks.filter((s) => s.completed).length;
                return (
                  <div
                    key={task.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      task.completed
                        ? 'bg-[var(--app-canvas)]/60 border-[var(--app-border)] opacity-60'
                        : 'bg-[var(--app-elevated)] border-[var(--app-border)] hover:border-[var(--app-accent)]/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
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

                        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onSelectTask(task)}>
                          <div className="flex items-center gap-2">
                            <h4
                              className={`text-xs font-semibold truncate ${
                                task.completed ? 'line-through text-neutral-500' : 'text-neutral-100'
                              }`}
                            >
                              {task.title}
                            </h4>
                            {task.priority === 'urgent' && (
                              <span className="text-[10px] font-mono text-red-400 font-semibold uppercase">
                                Urgent
                              </span>
                            )}
                          </div>

                          {task.description && (
                            <p className="text-[11px] text-neutral-400 line-clamp-1 mt-0.5">
                              {task.description}
                            </p>
                          )}

                          {/* Metadata row */}
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-neutral-400 mt-2">
                            {task.dueTime && (
                              <span className="font-mono text-[var(--app-accent)] flex items-center gap-1">
                                <Clock size={11} /> {task.dueTime}
                              </span>
                            )}
                            {cat && (
                              <>
                                <span>·</span>
                                <span className="flex items-center gap-1">
                                  <span
                                    className="w-1.5 h-1.5 rounded-full"
                                    style={{ backgroundColor: cat.colorHex }}
                                  />
                                  {cat.name}
                                </span>
                              </>
                            )}
                            {task.subtasks.length > 0 && (
                              <>
                                <span>·</span>
                                <span className="font-mono">
                                  {subCompleted}/{task.subtasks.length} subtasks
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => onSelectTask(task)}
                        className="text-neutral-400 hover:text-white p-1 cursor-pointer"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Reminders with Time Column (1 col) */}
        <div className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl p-5 flex flex-col transition-colors">
          <div className="flex items-center justify-between pb-4 border-b border-[var(--app-border)] mb-4">
            <div>
              <h3 className="text-sm font-bold font-display text-white flex items-center gap-2">
                <Bell size={16} className="text-[var(--app-accent)]" />
                Time Reminders
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Exact time-targeted alerts
              </p>
            </div>
            <button
              onClick={() => onSelectView('reminders')}
              className="text-xs text-[var(--app-accent)] hover:underline font-medium flex items-center gap-1 transition-colors cursor-pointer"
            >
              All <ArrowRight size={13} />
            </button>
          </div>

          <div className="flex-1 space-y-2.5">
            {activeReminders.length === 0 ? (
              <div className="text-center py-8 text-neutral-400 text-xs">
                No active reminders pending.
              </div>
            ) : (
              activeReminders.map((rem) => {
                const remDate = new Date(rem.dateTime);
                const isOverdue = remDate.getTime() < Date.now();
                return (
                  <div
                    key={rem.id}
                    className={`p-3 rounded-xl border text-xs transition-colors ${
                      isOverdue
                        ? 'bg-red-950/20 border-red-900/40'
                        : 'bg-[var(--app-elevated)] border-[var(--app-border)] hover:border-[var(--app-accent)]/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onSelectReminder(rem)}>
                        <div className="font-semibold text-neutral-100 truncate flex items-center gap-1.5">
                          {isOverdue && (
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                          )}
                          <span className="truncate">{rem.title}</span>
                        </div>
                        <div className="mt-1 flex items-center gap-1.5 text-[11px] font-mono text-[var(--app-accent)]">
                          <Clock size={11} />
                          <span>{rem.dateTime.replace('T', ' ')}</span>
                          {isOverdue && <span className="text-red-400 ml-1 font-sans">Overdue</span>}
                        </div>
                      </div>

                      <button
                        onClick={() => onToggleReminder(rem.id)}
                        className="p-1.5 rounded-lg bg-[var(--app-surface)] hover:bg-emerald-500 hover:text-black text-neutral-300 transition-colors cursor-pointer"
                        title="Mark Reminder as Completed"
                      >
                        <Check size={13} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <button
            onClick={onOpenReminderModal}
            className="w-full mt-4 py-2 bg-[var(--app-elevated)] hover:bg-[var(--app-surface-hover)] border border-[var(--app-border)] rounded-xl text-xs font-semibold text-neutral-200 hover:text-[var(--app-accent)] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Bell size={13} /> + Set New Reminder
          </button>
        </div>
      </div>

      {/* Pinned Notes Grid */}
      <div className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl p-5 transition-colors">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--app-border)] mb-4">
          <div>
            <h3 className="text-sm font-bold font-display text-white flex items-center gap-2">
              <Pin size={16} className="text-[var(--app-accent)] fill-current" />
              Pinned Notes &amp; Quick References
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Instant access to core documents, meeting briefs, and project notes
            </p>
          </div>
          <button
            onClick={() => onSelectView('notes')}
            className="text-xs text-[var(--app-accent)] hover:underline font-medium flex items-center gap-1 transition-colors cursor-pointer"
          >
            Open Notes Workspace <ArrowRight size={13} />
          </button>
        </div>

        {pinnedNotes.length === 0 ? (
          <div className="text-center py-8 text-neutral-400 text-xs">
            No pinned notes. Pin important notes in the Notes workspace to see them here.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pinnedNotes.map((note) => (
              <div
                key={note.id}
                onClick={() => onSelectNote(note)}
                className="p-4 bg-[var(--app-elevated)] hover:bg-[var(--app-surface-hover)] border border-[var(--app-border)] hover:border-[var(--app-accent)]/50 rounded-xl cursor-pointer transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h4 className="text-xs font-bold text-white truncate flex-1">
                      {note.title}
                    </h4>
                    <span 
                      className="w-2 h-2 rounded-full shrink-0" 
                      style={{ backgroundColor: 'var(--app-accent)' }}
                    />
                  </div>
                  <p className="text-xs text-neutral-300 line-clamp-3 leading-relaxed">
                    {note.content.replace(/[#*`>-]/g, '')}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[var(--app-border)] flex items-center justify-between text-[11px] text-neutral-400">
                  <span className="font-mono text-[10px]">
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </span>
                  {note.checklist && note.checklist.length > 0 && (
                    <span className="font-mono text-[var(--app-accent)]">
                      {note.checklist.filter((c) => c.checked).length}/{note.checklist.length} checklist
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
