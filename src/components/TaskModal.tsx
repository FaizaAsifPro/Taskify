import React, { useState, useEffect } from 'react';
import { Task, Priority, Recurrence, Category } from '../types';
import { X, Plus, Trash2, Calendar, Clock, AlertCircle, Tag, CheckSquare, ArrowLeft } from 'lucide-react';
import { formatDateKey } from '../utils/storage';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  initialTask?: Task | null;
  categories: Category[];
  defaultDate?: string;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTask,
  categories,
  defaultDate,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(defaultDate || formatDateKey(new Date()));
  const [dueTime, setDueTime] = useState('10:00');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState(categories[0]?.id || 'work');
  const [estimatedMinutes, setEstimatedMinutes] = useState(30);
  const [recurrence, setRecurrence] = useState<Recurrence>('none');
  const [tagsInput, setTagsInput] = useState('');
  const [subtasks, setSubtasks] = useState<Task['subtasks']>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  // Reset fields when opening modal
  useEffect(() => {
    if (isOpen) {
      if (initialTask) {
        setTitle(initialTask.title || '');
        setDescription(initialTask.description || '');
        setDueDate(initialTask.dueDate || defaultDate || formatDateKey(new Date()));
        setDueTime(initialTask.dueTime || '10:00');
        setPriority(initialTask.priority || 'medium');
        setCategory(initialTask.category || categories[0]?.id || 'work');
        setEstimatedMinutes(initialTask.estimatedMinutes || 30);
        setRecurrence(initialTask.recurrence || 'none');
        setTagsInput(initialTask.tags?.join(', ') || '');
        setSubtasks(initialTask.subtasks ? [...initialTask.subtasks] : []);
      } else {
        setTitle('');
        setDescription('');
        setDueDate(defaultDate || formatDateKey(new Date()));
        setDueTime('10:00');
        setPriority('medium');
        setCategory(categories[0]?.id || 'work');
        setEstimatedMinutes(30);
        setRecurrence('none');
        setTagsInput('');
        setSubtasks([]);
      }
      setNewSubtaskTitle('');
    }
  }, [isOpen, initialTask, defaultDate, categories]);

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

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setSubtasks([
      ...subtasks,
      {
        id: `st-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        title: newSubtaskTitle.trim(),
        completed: false,
      },
    ]);
    setNewSubtaskTitle('');
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter((s) => s.id !== id));
  };

  const handleToggleSubtask = (id: string) => {
    setSubtasks(
      subtasks.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const taskToSave: Task = {
      id: initialTask?.id || `task-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate,
      dueTime: dueTime || undefined,
      priority,
      category,
      completed: initialTask?.completed || false,
      completedAt: initialTask?.completedAt,
      createdAt: initialTask?.createdAt || new Date().toISOString(),
      subtasks,
      tags,
      estimatedMinutes: Number(estimatedMinutes) || 0,
      recurrence,
    };

    onSave(taskToSave);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overscroll-contain"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-xl max-h-[calc(100dvh-2rem)] flex flex-col bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl shadow-2xl overflow-hidden text-white my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Modal Header with Back Arrow - Pinned */}
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
                  <span className="w-2.5 h-2.5 rounded-full bg-[var(--app-accent)] shrink-0"></span>
                  {initialTask ? 'Edit Scheduled Task' : 'Schedule New Task'}
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Organize tasks across days, weeks, and months
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

          {/* Modal Form Body - Scrollable */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 overscroll-contain">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Task Title <span className="text-[var(--app-accent)]">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Deliver architecture review & database schema"
                className="w-full px-3.5 py-2.5 bg-[var(--app-elevated)] border border-[var(--app-border)] rounded-xl text-sm text-white placeholder-neutral-400 focus:outline-hidden focus:border-[var(--app-accent)] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Details / Scope Notes
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add key context, links, or acceptance criteria..."
                className="w-full px-3.5 py-2 bg-[var(--app-elevated)] border border-[var(--app-border)] rounded-xl text-sm text-white placeholder-neutral-400 focus:outline-hidden focus:border-[var(--app-accent)] transition-colors resize-none"
              />
            </div>

            {/* Date, Time, Duration Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1 flex items-center gap-1.5">
                  <Calendar size={13} className="text-[var(--app-accent)]" />
                  Due Date
                </label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--app-elevated)] border border-[var(--app-border)] rounded-xl text-xs font-mono text-white focus:outline-hidden focus:border-[var(--app-accent)] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1 flex items-center gap-1.5">
                  <Clock size={13} className="text-[var(--app-accent)]" />
                  Time (Optional)
                </label>
                <input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--app-elevated)] border border-[var(--app-border)] rounded-xl text-xs font-mono text-white focus:outline-hidden focus:border-[var(--app-accent)] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Estimate (Min)
                </label>
                <input
                  type="number"
                  min="5"
                  step="5"
                  value={estimatedMinutes}
                  onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[var(--app-elevated)] border border-[var(--app-border)] rounded-xl text-xs font-mono text-white focus:outline-hidden focus:border-[var(--app-accent)] transition-colors"
                />
              </div>
            </div>

            {/* Priority & Category & Recurrence */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1 flex items-center gap-1.5">
                  <AlertCircle size={13} className="text-[var(--app-accent)]" />
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="w-full px-3 py-2 bg-[var(--app-elevated)] border border-[var(--app-border)] rounded-xl text-xs text-white focus:outline-hidden focus:border-[var(--app-accent)] transition-colors"
                >
                  <option value="urgent" className="bg-[var(--app-surface)] text-white">🔴 Urgent</option>
                  <option value="high" className="bg-[var(--app-surface)] text-white">🟡 High</option>
                  <option value="medium" className="bg-[var(--app-surface)] text-white">⚪ Medium</option>
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
                  Recurrence
                </label>
                <select
                  value={recurrence}
                  onChange={(e) => setRecurrence(e.target.value as Recurrence)}
                  className="w-full px-3 py-2 bg-[var(--app-elevated)] border border-[var(--app-border)] rounded-xl text-xs text-white focus:outline-hidden focus:border-[var(--app-accent)] transition-colors"
                >
                  <option value="none" className="bg-[var(--app-surface)] text-white">One-time</option>
                  <option value="daily" className="bg-[var(--app-surface)] text-white">Daily</option>
                  <option value="weekly" className="bg-[var(--app-surface)] text-white">Weekly</option>
                  <option value="monthly" className="bg-[var(--app-surface)] text-white">Monthly</option>
                </select>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1 flex items-center gap-1.5">
                <Tag size={13} className="text-[var(--app-accent)]" />
                Tags (Comma separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="e.g. Q4, Infrastructure, Client"
                className="w-full px-3.5 py-2 bg-[var(--app-elevated)] border border-[var(--app-border)] rounded-xl text-xs text-white placeholder-neutral-400 focus:outline-hidden focus:border-[var(--app-accent)] transition-colors"
              />
            </div>

            {/* Subtasks Checklist */}
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <CheckSquare size={13} className="text-[var(--app-accent)]" />
                  Subtask Checklist ({subtasks.filter((s) => s.completed).length}/{subtasks.length})
                </span>
              </label>

              {/* Subtasks list */}
              {subtasks.length > 0 && (
                <div className="space-y-1.5 mb-2 max-h-36 overflow-y-auto pr-1">
                  {subtasks.map((st) => (
                    <div
                      key={st.id}
                      className="flex items-center justify-between px-3 py-1.5 bg-[var(--app-elevated)] border border-[var(--app-border)] rounded-lg text-xs group"
                    >
                      <label className="flex items-center gap-2 cursor-pointer flex-1 mr-2">
                        <input
                          type="checkbox"
                          checked={st.completed}
                          onChange={() => handleToggleSubtask(st.id)}
                          className="rounded border-[var(--app-border)] focus:ring-0 focus:ring-offset-0 bg-[var(--app-canvas)] cursor-pointer"
                          style={{ accentColor: 'var(--app-accent)' }}
                        />
                        <span className={st.completed ? 'line-through text-neutral-500' : 'text-neutral-200'}>
                          {st.title}
                        </span>
                      </label>
                      <button
                        type="button"
                        onClick={() => handleRemoveSubtask(st.id)}
                        className="text-neutral-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add subtask input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSubtask();
                    }
                  }}
                  placeholder="Add subtask step and press Enter..."
                  className="flex-1 px-3 py-1.5 bg-[var(--app-elevated)] border border-[var(--app-border)] rounded-lg text-xs text-white placeholder-neutral-400 focus:outline-hidden focus:border-[var(--app-accent)]"
                />
                <button
                  type="button"
                  onClick={handleAddSubtask}
                  className="px-3 py-1.5 bg-[var(--app-surface)] hover:bg-[var(--app-surface-hover)] text-[var(--app-accent)] border border-[var(--app-border)] rounded-lg text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus size={13} /> Add
                </button>
              </div>
            </div>
          </div>

          {/* Form Actions - Pinned Footer */}
          <div className="shrink-0 flex items-center justify-end gap-3 px-5 py-3.5 border-t border-[var(--app-border)] bg-[var(--app-surface)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-300 hover:text-white bg-[var(--app-elevated)] hover:bg-[var(--app-surface-hover)] rounded-xl transition-colors cursor-pointer"
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
              {initialTask ? 'Save Changes' : 'Schedule Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
