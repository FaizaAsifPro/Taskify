/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Task, 
  Reminder, 
  Note, 
  Category, 
  ActiveView, 
  AppSettings,
  ThemePreset 
} from './types';
import { 
  loadTasks, 
  saveTasks, 
  loadReminders, 
  saveReminders, 
  loadNotes, 
  saveNotes, 
  loadCategories, 
  saveCategories, 
  loadSettings, 
  saveSettings, 
  generateInitialData,
  formatDateKey 
} from './utils/storage';
import { playReminderChime, playCompletionSound } from './utils/sound';

import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardOverview } from './components/DashboardOverview';
import { DailyView } from './components/DailyView';
import { WeeklyView } from './components/WeeklyView';
import { MonthlyView } from './components/MonthlyView';
import { RemindersView } from './components/RemindersView';
import { NotesView } from './components/NotesView';
import { OrganizeView } from './components/OrganizeView';

import { TaskModal } from './components/TaskModal';
import { ReminderModal } from './components/ReminderModal';
import { NoteModal } from './components/NoteModal';
import { FocusTimerModal } from './components/FocusTimerModal';
import { CommandPalette } from './components/CommandPalette';
import { ReminderAlertBanner } from './components/ReminderAlertBanner';

export default function App() {
  // Primary Data State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<AppSettings>(loadSettings());

  // UI Navigation State
  const [activeView, setActiveView] = useState<ActiveView>('overview');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Modals State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskModalDefaultDate, setTaskModalDefaultDate] = useState<string | undefined>();
  const [taskModalDefaultTime, setTaskModalDefaultTime] = useState<string | undefined>();

  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [prefilledReminderTitle, setPrefilledReminderTitle] = useState<string | undefined>();

  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const [isFocusTimerOpen, setIsFocusTimerOpen] = useState(false);
  const [focusTaskTitle, setFocusTaskTitle] = useState<string | undefined>();

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Active Alert Notifications
  const [activeAlerts, setActiveAlerts] = useState<Reminder[]>([]);
  const [dismissedAlertIds, setDismissedAlertIds] = useState<Set<string>>(new Set());

  // Load initial data
  useEffect(() => {
    setTasks(loadTasks());
    setReminders(loadReminders());
    setNotes(loadNotes());
    setCategories(loadCategories());
    setSettings(loadSettings());
  }, []);

  // Save tasks on changes
  const updateTasks = useCallback((newTasks: Task[]) => {
    setTasks(newTasks);
    saveTasks(newTasks);
  }, []);

  // Save reminders on changes
  const updateReminders = useCallback((newReminders: Reminder[]) => {
    setReminders(newReminders);
    saveReminders(newReminders);
  }, []);

  // Save notes on changes
  const updateNotes = useCallback((newNotes: Note[]) => {
    setNotes(newNotes);
    saveNotes(newNotes);
  }, []);

  // Save categories on changes
  const updateCategories = useCallback((newCategories: Category[]) => {
    setCategories(newCategories);
    saveCategories(newCategories);
  }, []);

  // Save settings on changes
  const updateSettings = useCallback((newSettings: AppSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  }, []);

  // Real-time Reminder Watcher: runs every 5 seconds
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date().getTime();
      const triggered: Reminder[] = [];

      reminders.forEach((r) => {
        if (r.completed) return;
        if (dismissedAlertIds.has(r.id)) return;

        // Check if snoozed
        if (r.snoozedUntil && new Date(r.snoozedUntil).getTime() > now) {
          return;
        }

        const dueMs = new Date(r.dateTime).getTime();
        // If due within the last 2 hours and not dismissed
        if (dueMs <= now && now - dueMs < 7200000) {
          triggered.push(r);
        }
      });

      const alertsAreUnchanged =
        activeAlerts.length === triggered.length &&
        activeAlerts.every((alert, index) => alert === triggered[index]);

      if (!alertsAreUnchanged) {
        const currentAlertIds = new Set(activeAlerts.map((alert) => alert.id));
        const hasBrandNew = triggered.some((reminder) => !currentAlertIds.has(reminder.id));
        if (hasBrandNew && settings.soundEnabled) {
          playReminderChime();
        }
        setActiveAlerts(triggered);
      }
    };

    checkReminders();
    const interval = setInterval(checkReminders, 5000);
    return () => clearInterval(interval);
  }, [reminders, dismissedAlertIds, activeAlerts, settings.soundEnabled]);

  // Global Keyboard Shortcuts (Escape to close, Cmd/Ctrl+K to open search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isCommandPaletteOpen) setIsCommandPaletteOpen(false);
        else if (isTaskModalOpen) setIsTaskModalOpen(false);
        else if (isReminderModalOpen) setIsReminderModalOpen(false);
        else if (isNoteModalOpen) setIsNoteModalOpen(false);
        else if (isFocusTimerOpen) setIsFocusTimerOpen(false);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, isTaskModalOpen, isReminderModalOpen, isNoteModalOpen, isFocusTimerOpen]);

  // Lock body scroll when any modal is open to prevent background dashboard from scrolling
  const isAnyModalOpen = isTaskModalOpen || isReminderModalOpen || isNoteModalOpen || isFocusTimerOpen || isCommandPaletteOpen;
  useEffect(() => {
    if (isAnyModalOpen) {
      const prevBodyOverflow = document.body.style.overflow;
      const prevDocOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevBodyOverflow;
        document.documentElement.style.overflow = prevDocOverflow;
      };
    }
  }, [isAnyModalOpen]);

  // Task Handlers
  const handleToggleTask = (taskId: string) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        const nextCompleted = !t.completed;
        if (nextCompleted && settings.soundEnabled) {
          playCompletionSound();
        }
        return {
          ...t,
          completed: nextCompleted,
          completedAt: nextCompleted ? new Date().toISOString() : undefined,
        };
      }
      return t;
    });
    updateTasks(updated);
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        const updatedSubtasks = t.subtasks.map((st) =>
          st.id === subtaskId ? { ...st, completed: !st.completed } : st
        );
        if (settings.soundEnabled) playCompletionSound();
        return { ...t, subtasks: updatedSubtasks };
      }
      return t;
    });
    updateTasks(updated);
  };

  const handleSaveTask = (taskToSave: Task) => {
    const exists = tasks.some((t) => t.id === taskToSave.id);
    if (exists) {
      updateTasks(tasks.map((t) => (t.id === taskToSave.id ? taskToSave : t)));
    } else {
      updateTasks([taskToSave, ...tasks]);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    updateTasks(tasks.filter((t) => t.id !== taskId));
  };

  const handleMoveToDate = (taskId: string, newDateStr: string) => {
    updateTasks(
      tasks.map((t) => (t.id === taskId ? { ...t, dueDate: newDateStr } : t))
    );
  };

  // Reminder Handlers
  const handleToggleReminder = (reminderId: string) => {
    const updated = reminders.map((r) => {
      if (r.id === reminderId) {
        const nextCompleted = !r.completed;
        if (nextCompleted && settings.soundEnabled) {
          playCompletionSound();
        }
        return {
          ...r,
          completed: nextCompleted,
          completedAt: nextCompleted ? new Date().toISOString() : undefined,
        };
      }
      return r;
    });
    updateReminders(updated);
    setActiveAlerts((prev) => prev.filter((a) => a.id !== reminderId));
  };

  const handleSnoozeReminder = (reminderId: string, minutes: number) => {
    const snoozeTime = new Date(Date.now() + minutes * 60000).toISOString();
    updateReminders(
      reminders.map((r) =>
        r.id === reminderId ? { ...r, snoozedUntil: snoozeTime } : r
      )
    );
    setActiveAlerts((prev) => prev.filter((a) => a.id !== reminderId));
  };

  const handleDismissReminderAlert = (reminderId: string) => {
    setDismissedAlertIds((prev) => new Set([...prev, reminderId]));
    setActiveAlerts((prev) => prev.filter((a) => a.id !== reminderId));
  };

  const handleSaveReminder = (reminderToSave: Reminder) => {
    const exists = reminders.some((r) => r.id === reminderToSave.id);
    if (exists) {
      updateReminders(
        reminders.map((r) => (r.id === reminderToSave.id ? reminderToSave : r))
      );
    } else {
      updateReminders([reminderToSave, ...reminders]);
    }
  };

  const handleDeleteReminder = (reminderId: string) => {
    updateReminders(reminders.filter((r) => r.id !== reminderId));
    setActiveAlerts((prev) => prev.filter((a) => a.id !== reminderId));
  };

  // Note Handlers
  const handleSaveNote = (noteToSave: Note) => {
    const exists = notes.some((n) => n.id === noteToSave.id);
    if (exists) {
      updateNotes(notes.map((n) => (n.id === noteToSave.id ? noteToSave : n)));
    } else {
      updateNotes([noteToSave, ...notes]);
    }
  };

  const handleTogglePinNote = (noteId: string) => {
    updateNotes(
      notes.map((n) => (n.id === noteId ? { ...n, pinned: !n.pinned } : n))
    );
  };

  const handleToggleArchiveNote = (noteId: string) => {
    updateNotes(
      notes.map((n) => (n.id === noteId ? { ...n, archived: !n.archived } : n))
    );
  };

  const handleDeleteNote = (noteId: string) => {
    updateNotes(notes.filter((n) => n.id !== noteId));
  };

  const handleToggleNoteChecklist = (noteId: string, itemId: string) => {
    updateNotes(
      notes.map((n) => {
        if (n.id === noteId && n.checklist) {
          const updated = n.checklist.map((item) =>
            item.id === itemId ? { ...item, checked: !item.checked } : item
          );
          if (settings.soundEnabled) playCompletionSound();
          return { ...n, checklist: updated };
        }
        return n;
      })
    );
  };

  // Convert Note Checklist to Scheduled Tasks
  const handleConvertNoteToTasks = (note: Note) => {
    const todayStr = formatDateKey(new Date());
    const newTasksFromNote: Task[] = [];

    // If note has checklist items, convert unchecked items
    if (note.checklist && note.checklist.length > 0) {
      note.checklist.forEach((item) => {
        newTasksFromNote.push({
          id: `task-from-note-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          title: item.text,
          description: `Derived from note: "${note.title}"`,
          dueDate: todayStr,
          priority: 'medium',
          category: note.category,
          completed: item.checked,
          createdAt: new Date().toISOString(),
          subtasks: [],
          tags: [...note.tags],
        });
      });
    } else {
      // Or create single task from note title
      newTasksFromNote.push({
        id: `task-from-note-${Date.now()}`,
        title: note.title,
        description: note.content.slice(0, 160),
        dueDate: todayStr,
        priority: 'medium',
        category: note.category,
        completed: false,
        createdAt: new Date().toISOString(),
        subtasks: [],
        tags: [...note.tags],
      });
    }

    updateTasks([...newTasksFromNote, ...tasks]);
    setActiveView('daily');
  };

  // Reset to Demo Data
  const handleResetData = () => {
    const init = generateInitialData();
    updateTasks(init.tasks);
    updateReminders(init.reminders);
    updateNotes(init.notes);
    setDismissedAlertIds(new Set());
    setActiveAlerts([]);
  };

  const handleReloadAllData = () => {
    setTasks(loadTasks());
    setReminders(loadReminders());
    setNotes(loadNotes());
    setCategories(loadCategories());
    setSettings(loadSettings());
  };

  // Open task modal with specific date/time
  const handleOpenTaskModalWithDate = (date: string, time?: string) => {
    setEditingTask(null);
    setTaskModalDefaultDate(date);
    setTaskModalDefaultTime(time || '10:00');
    setIsTaskModalOpen(true);
  };

  // Computed counts for badges
  const todayKey = formatDateKey(new Date());
  const todayTasksCount = tasks.filter((t) => t.dueDate === todayKey && !t.completed).length;
  const dueRemindersCount = reminders.filter((r) => !r.completed).length;
  const activeNotesCount = notes.filter((n) => !n.archived).length;

  // Theme Accent Palette background style mapping
  const themeClasses = useMemo(() => {
    switch (settings.themePreset) {
      case 'obsidian-gold':
        return 'theme-obsidian-gold';
      case 'cyber-amber':
        return 'theme-cyber-amber';
      case 'emerald-midnight':
        return 'theme-emerald-midnight';
      case 'royal-amethyst':
        return 'theme-royal-amethyst';
      case 'nordic-frost':
        return 'theme-nordic-frost';
      case 'crimson-noir':
        return 'theme-crimson-noir';
      case 'burgundy-rose-mint':
      default:
        return 'theme-burgundy-rose-mint';
    }
  }, [settings.themePreset]);

  // Synchronize documentElement class for full-page root styling
  useEffect(() => {
    document.documentElement.className = themeClasses;
  }, [themeClasses]);

  return (
    <div className={`min-h-screen bg-[var(--app-canvas)] text-[var(--app-text-primary)] flex transition-colors duration-200 ${themeClasses}`}>
      {/* Sidebar Navigation */}
      <Sidebar
        activeView={activeView}
        onSelectView={setActiveView}
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onOpenFocusTimer={() => setIsFocusTimerOpen(true)}
        todayTasksCount={todayTasksCount}
        dueRemindersCount={dueRemindersCount}
        notesCount={activeNotesCount}
        streakDays={7}
        isOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
      />

      {/* Main Content Area - sits side-by-side with sidebar */}
      <div className="flex flex-col flex-1 min-w-0 min-h-screen">
        {/* Top Header */}
        <Header
          activeView={activeView}
          currentTheme={settings.themePreset}
          onSelectTheme={(theme) => updateSettings({ ...settings, themePreset: theme })}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenTaskModal={() => {
            setEditingTask(null);
            setTaskModalDefaultDate(formatDateKey(new Date()));
            setIsTaskModalOpen(true);
          }}
          onOpenReminderModal={() => {
            setEditingReminder(null);
            setPrefilledReminderTitle(undefined);
            setIsReminderModalOpen(true);
          }}
          onOpenNoteModal={() => {
            setEditingNote(null);
            setIsNoteModalOpen(true);
          }}
          onOpenFocusTimer={() => setIsFocusTimerOpen(true)}
        />

        {/* Dynamic View Port */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {activeView === 'overview' && (
            <DashboardOverview
              tasks={tasks}
              reminders={reminders}
              notes={notes}
              categories={categories}
              onSelectView={setActiveView}
              onToggleTask={handleToggleTask}
              onToggleReminder={handleToggleReminder}
              onSelectTask={(task) => {
                setEditingTask(task);
                setIsTaskModalOpen(true);
              }}
              onSelectReminder={(rem) => {
                setEditingReminder(rem);
                setIsReminderModalOpen(true);
              }}
              onSelectNote={(note) => {
                setEditingNote(note);
                setIsNoteModalOpen(true);
              }}
              onOpenTaskModal={() => {
                setEditingTask(null);
                setTaskModalDefaultDate(formatDateKey(new Date()));
                setIsTaskModalOpen(true);
              }}
              onOpenReminderModal={() => {
                setEditingReminder(null);
                setIsReminderModalOpen(true);
              }}
              onOpenNoteModal={() => {
                setEditingNote(null);
                setIsNoteModalOpen(true);
              }}
            />
          )}

          {activeView === 'daily' && (
            <DailyView
              tasks={tasks}
              categories={categories}
              selectedCategory={selectedCategory}
              onToggleTask={handleToggleTask}
              onToggleSubtask={handleToggleSubtask}
              onSelectTask={(task) => {
                setEditingTask(task);
                setIsTaskModalOpen(true);
              }}
              onDeleteTask={handleDeleteTask}
              onMoveToDate={handleMoveToDate}
              onOpenTaskModalWithDate={handleOpenTaskModalWithDate}
            />
          )}

          {activeView === 'weekly' && (
            <WeeklyView
              tasks={tasks}
              categories={categories}
              selectedCategory={selectedCategory}
              onToggleTask={handleToggleTask}
              onSelectTask={(task) => {
                setEditingTask(task);
                setIsTaskModalOpen(true);
              }}
              onMoveToDate={handleMoveToDate}
              onOpenTaskModalWithDate={(date) => handleOpenTaskModalWithDate(date)}
            />
          )}

          {activeView === 'monthly' && (
            <MonthlyView
              tasks={tasks}
              reminders={reminders}
              categories={categories}
              selectedCategory={selectedCategory}
              onToggleTask={handleToggleTask}
              onSelectTask={(task) => {
                setEditingTask(task);
                setIsTaskModalOpen(true);
              }}
              onSelectReminder={(rem) => {
                setEditingReminder(rem);
                setIsReminderModalOpen(true);
              }}
              onOpenTaskModalWithDate={(date) => handleOpenTaskModalWithDate(date)}
            />
          )}

          {activeView === 'reminders' && (
            <RemindersView
              reminders={reminders}
              categories={categories}
              selectedCategory={selectedCategory}
              onToggleReminder={handleToggleReminder}
              onSnoozeReminder={handleSnoozeReminder}
              onSelectReminder={(rem) => {
                setEditingReminder(rem);
                setIsReminderModalOpen(true);
              }}
              onDeleteReminder={handleDeleteReminder}
              onOpenReminderModal={() => {
                setEditingReminder(null);
                setIsReminderModalOpen(true);
              }}
            />
          )}

          {activeView === 'notes' && (
            <NotesView
              notes={notes}
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectNote={(note) => {
                setEditingNote(note);
                setIsNoteModalOpen(true);
              }}
              onTogglePinNote={handleTogglePinNote}
              onToggleArchiveNote={handleToggleArchiveNote}
              onDeleteNote={handleDeleteNote}
              onToggleNoteChecklist={handleToggleNoteChecklist}
              onConvertToTasks={handleConvertNoteToTasks}
              onOpenNoteModal={() => {
                setEditingNote(null);
                setIsNoteModalOpen(true);
              }}
            />
          )}

          {activeView === 'organize' && (
            <OrganizeView
              categories={categories}
              tasks={tasks}
              reminders={reminders}
              notes={notes}
              settings={settings}
              onUpdateCategories={updateCategories}
              onUpdateSettings={updateSettings}
              onResetData={handleResetData}
              onReloadAllData={handleReloadAllData}
            />
          )}
        </main>
      </div>

      {/* Real-time Reminder Audio & Banner Toast */}
      <ReminderAlertBanner
        activeAlerts={activeAlerts}
        onComplete={handleToggleReminder}
        onSnooze={handleSnoozeReminder}
        onDismiss={handleDismissReminderAlert}
      />

      {/* Task Creation & Edit Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        initialTask={editingTask}
        categories={categories}
        defaultDate={taskModalDefaultDate}
      />

      {/* Reminder Creation & Edit Modal */}
      <ReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => {
          setIsReminderModalOpen(false);
          setEditingReminder(null);
          setPrefilledReminderTitle(undefined);
        }}
        onSave={handleSaveReminder}
        initialReminder={editingReminder}
        categories={categories}
        prefilledTitle={prefilledReminderTitle}
      />

      {/* Note Creation & Edit Modal */}
      <NoteModal
        isOpen={isNoteModalOpen}
        onClose={() => {
          setIsNoteModalOpen(false);
          setEditingNote(null);
        }}
        onSave={handleSaveNote}
        initialNote={editingNote}
        categories={categories}
        onConvertToTasks={handleConvertNoteToTasks}
      />

      {/* Pomodoro Focus Timer */}
      <FocusTimerModal
        isOpen={isFocusTimerOpen}
        onClose={() => setIsFocusTimerOpen(false)}
        activeTaskTitle={focusTaskTitle}
      />

      {/* Command Palette (Cmd+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        tasks={tasks}
        reminders={reminders}
        notes={notes}
        onSelectView={setActiveView}
        onOpenTaskModal={() => {
          setEditingTask(null);
          setIsTaskModalOpen(true);
        }}
        onOpenReminderModal={() => {
          setEditingReminder(null);
          setIsReminderModalOpen(true);
        }}
        onOpenNoteModal={() => {
          setEditingNote(null);
          setIsNoteModalOpen(true);
        }}
        onSelectTask={(task) => {
          setEditingTask(task);
          setIsTaskModalOpen(true);
        }}
        onSelectReminder={(rem) => {
          setEditingReminder(rem);
          setIsReminderModalOpen(true);
        }}
        onSelectNote={(note) => {
          setEditingNote(note);
          setIsNoteModalOpen(true);
        }}
      />
    </div>
  );
}
