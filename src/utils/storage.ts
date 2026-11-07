import { Task, Reminder, Note, Category, AppSettings } from '../types';

const STORAGE_KEYS = {
  TASKS: 'auratask_tasks_v1',
  REMINDERS: 'auratask_reminders_v1',
  NOTES: 'auratask_notes_v1',
  CATEGORIES: 'auratask_categories_v1',
  SETTINGS: 'auratask_settings_v1',
};

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'work', name: 'Deep Work & Strategy', colorHex: '#FACC15', icon: 'Briefcase' },
  { id: 'personal', name: 'Personal & Life', colorHex: '#38BDF8', icon: 'User' },
  { id: 'projects', name: 'Product Deliverables', colorHex: '#A855F7', icon: 'FolderGit2' },
  { id: 'finance', name: 'Finance & Admin', colorHex: '#34D399', icon: 'Coins' },
  { id: 'health', name: 'Health & Wellness', colorHex: '#FB7185', icon: 'HeartPulse' },
];

export const DEFAULT_SETTINGS: AppSettings = {
  soundEnabled: true,
  themePreset: 'burgundy-rose-mint',
  startOfWeek: 1, // Monday
  defaultCategory: 'work',
};

// Helper to format Date to YYYY-MM-DD
export function formatDateKey(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Generate realistic starter data anchored to today
export function generateInitialData(): {
  tasks: Task[];
  reminders: Reminder[];
  notes: Note[];
} {
  const today = new Date();
  
  const addDays = (days: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + days);
    return d;
  };

  const todayStr = formatDateKey(today);
  const tomorrowStr = formatDateKey(addDays(1));
  const in3DaysStr = formatDateKey(addDays(3));
  const in5DaysStr = formatDateKey(addDays(5));
  const in12DaysStr = formatDateKey(addDays(12));
  const in20DaysStr = formatDateKey(addDays(20));

  const tasks: Task[] = [
    {
      id: 'task-1',
      title: 'Review Q4 Architecture Plan & Infrastructure Budget',
      description: 'Audit server cluster costs, finalize compute limits, and draft executive summary.',
      dueDate: todayStr,
      dueTime: '10:00',
      priority: 'urgent',
      category: 'work',
      completed: false,
      createdAt: new Date().toISOString(),
      tags: ['Strategy', 'Infrastructure', 'Q4'],
      estimatedMinutes: 60,
      subtasks: [
        { id: 'st-1', title: 'Compile AWS and Cloud compute invoice trends', completed: true },
        { id: 'st-2', title: 'Compare database scaling overhead with forecasts', completed: false },
        { id: 'st-3', title: 'Draft 1-page executive brief for stakeholders', completed: false },
      ],
    },
    {
      id: 'task-2',
      title: 'Design System & Typography Polish',
      description: 'Ensure all UI components strictly follow obsidian black & canary yellow styling rules.',
      dueDate: todayStr,
      dueTime: '14:30',
      priority: 'high',
      category: 'projects',
      completed: false,
      createdAt: new Date().toISOString(),
      tags: ['Design', 'UI/UX'],
      estimatedMinutes: 90,
      subtasks: [
        { id: 'st-4', title: 'Audit high-contrast badge & button hover states', completed: true },
        { id: 'st-5', title: 'Verify responsive week/month calendar grids', completed: false },
      ],
    },
    {
      id: 'task-3',
      title: 'Client Sprint Retrospective & Feedback Sync',
      description: 'Prepare discussion notes and sprint deliverables deck.',
      dueDate: tomorrowStr,
      dueTime: '11:00',
      priority: 'high',
      category: 'work',
      completed: false,
      createdAt: new Date().toISOString(),
      tags: ['Client', 'Sprint'],
      estimatedMinutes: 45,
      subtasks: [
        { id: 'st-6', title: 'Export burndown metrics', completed: false },
        { id: 'st-7', title: 'Gather team blockers and highlights', completed: false },
      ],
    },
    {
      id: 'task-4',
      title: 'Mid-Week Database Backup & Security Audit',
      description: 'Run automated snapshot check and verify encrypted backup retention rules.',
      dueDate: in3DaysStr,
      dueTime: '16:00',
      priority: 'medium',
      category: 'work',
      completed: false,
      createdAt: new Date().toISOString(),
      tags: ['Security', 'DevOps'],
      estimatedMinutes: 30,
      subtasks: [],
    },
    {
      id: 'task-5',
      title: 'Monthly Financial Audit & Invoice Reconciliations',
      description: 'Verify all outbound vendor invoices and tax provisions for the current calendar cycle.',
      dueDate: in12DaysStr,
      dueTime: '15:00',
      priority: 'urgent',
      category: 'finance',
      completed: false,
      createdAt: new Date().toISOString(),
      tags: ['Finance', 'Tax'],
      estimatedMinutes: 120,
      subtasks: [
        { id: 'st-8', title: 'Match bank statements with Stripe receipts', completed: false },
        { id: 'st-9', title: 'Categorize operational software subscriptions', completed: false },
      ],
    },
    {
      id: 'task-6',
      title: 'Quarterly Team Roadmap Alignment & Vision Kickoff',
      description: 'Monthly milestones review with department leads and project managers.',
      dueDate: in20DaysStr,
      dueTime: '09:30',
      priority: 'medium',
      category: 'projects',
      completed: false,
      createdAt: new Date().toISOString(),
      tags: ['Roadmap', 'Strategy'],
      estimatedMinutes: 75,
      subtasks: [],
    },
    {
      id: 'task-7',
      title: 'Weekly 10k Cardio & Zone 2 Training Session',
      description: 'High cadence outdoor interval run followed by mobility cool down.',
      dueDate: in5DaysStr,
      dueTime: '07:30',
      priority: 'low',
      category: 'health',
      completed: false,
      createdAt: new Date().toISOString(),
      tags: ['Running', 'Fitness'],
      estimatedMinutes: 60,
      subtasks: [],
    },
  ];

  const nowHours = String(today.getHours()).padStart(2, '0');
  const nowMins = String(Math.min(55, today.getMinutes() + 15)).padStart(2, '0');

  const reminders: Reminder[] = [
    {
      id: 'rem-1',
      title: 'Daily Standup Call with Product Team',
      description: 'Review morning blockers and daily task distribution.',
      dateTime: `${todayStr}T${nowHours}:${nowMins}`,
      completed: false,
      priority: 'high',
      category: 'work',
      recurrence: 'daily',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'rem-2',
      title: 'Drink 500ml Electrolyte Water & Hydrate',
      description: 'Stay hydrated during long deep work blocks.',
      dateTime: `${todayStr}T14:00`,
      completed: false,
      priority: 'low',
      category: 'health',
      recurrence: 'daily',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'rem-3',
      title: 'Follow Up with Legal on MSA Agreement',
      description: 'Verify redlines in clause 4.2 before signature.',
      dateTime: `${tomorrowStr}T09:30`,
      completed: false,
      priority: 'urgent',
      category: 'work',
      recurrence: 'none',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'rem-4',
      title: 'Pay Cloud Infrastructure & Hosting Bill',
      description: 'Review invoice balance before auto-debit.',
      dateTime: `${in12DaysStr}T10:00`,
      completed: false,
      priority: 'high',
      category: 'finance',
      recurrence: 'monthly',
      createdAt: new Date().toISOString(),
    },
  ];

  const notes: Note[] = [
    {
      id: 'note-1',
      title: 'Core Product Principles & Quality Standards',
      content: `# Obsidian & Gold Engineering Philosophy\n\n1. **Zero Slop**: High contrast, razor sharp typography, intentional layout.\n2. **High Density**: Give users clear oversight over their day, week, and month without needless empty spacing.\n3. **Frictionless Capture**: Add notes, create reminders with exact time, and convert thoughts to actionable items in seconds.`,
      category: 'work',
      tags: ['Principles', 'Design', 'Architecture'],
      color: 'gold',
      pinned: true,
      archived: false,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date().toISOString(),
      checklist: [
        { id: 'nc-1', text: 'Fast keyboard shortcut navigation (Ctrl+K)', checked: true },
        { id: 'nc-2', text: 'Daily, weekly, and monthly planner views', checked: true },
        { id: 'nc-3', text: 'Time-accurate reminder alerts with chime', checked: true },
      ],
    },
    {
      id: 'note-2',
      title: 'Sprint Planning Notes — Next Release Milestones',
      content: `### Objectives\n- Seamless offline-first state persistence in LocalStorage\n- Multi-scale time breakdown: Hour-by-hour day view, 7-day weekly planner, and interactive monthly grid\n- Export/Import full productivity archive in clean JSON format\n\n### Key Deliverables\n- Subtask progress meters\n- Quick priority sorting (Urgent, High, Medium, Low)\n- Real-time reminder watcher with chime audio synthesis`,
      category: 'projects',
      tags: ['Sprint', 'Milestones'],
      color: 'amber',
      pinned: true,
      archived: false,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
      checklist: [
        { id: 'nc-4', text: 'Test calendar date picker in all modern browsers', checked: true },
        { id: 'nc-5', text: 'Add Pomodoro Focus Mode with audio chime', checked: true },
      ],
    },
    {
      id: 'note-3',
      title: 'Weekly Grocery & Nutrition Routine',
      content: `Keep meals clean, protein-dense, and ready for busy days:\n- Wild caught salmon & lean cuts\n- Organic greens, avocados, berries\n- Cold brew beans & loose-leaf green tea\n- Almonds and pumpkin seeds for snacking`,
      category: 'health',
      tags: ['Nutrition', 'Routine'],
      color: 'charcoal',
      pinned: false,
      archived: false,
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      updatedAt: new Date().toISOString(),
      checklist: [],
    },
  ];

  return { tasks, reminders, notes };
}

// LocalStorage helpers
export function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load tasks', e);
  }
  const init = generateInitialData();
  saveTasks(init.tasks);
  return init.tasks;
}

export function saveTasks(tasks: Task[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to save tasks', e);
  }
}

export function loadReminders(): Reminder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REMINDERS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load reminders', e);
  }
  const init = generateInitialData();
  saveReminders(init.reminders);
  return init.reminders;
}

export function saveReminders(reminders: Reminder[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
  } catch (e) {
    console.error('Failed to save reminders', e);
  }
}

export function loadNotes(): Note[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load notes', e);
  }
  const init = generateInitialData();
  saveNotes(init.notes);
  return init.notes;
}

export function saveNotes(notes: Note[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  } catch (e) {
    console.error('Failed to save notes', e);
  }
}

export function loadCategories(): Category[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load categories', e);
  }
  saveCategories(DEFAULT_CATEGORIES);
  return DEFAULT_CATEGORIES;
}

export function saveCategories(categories: Category[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  } catch (e) {
    console.error('Failed to save categories', e);
  }
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Failed to load settings', e);
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: AppSettings) {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
}

// Export and Import full application state
export function exportAllData(): string {
  const data = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    tasks: loadTasks(),
    reminders: loadReminders(),
    notes: loadNotes(),
    categories: loadCategories(),
    settings: loadSettings(),
  };
  return JSON.stringify(data, null, 2);
}

export function importAllData(jsonStr: string): boolean {
  try {
    const data = JSON.parse(jsonStr);
    if (data.tasks) saveTasks(data.tasks);
    if (data.reminders) saveReminders(data.reminders);
    if (data.notes) saveNotes(data.notes);
    if (data.categories) saveCategories(data.categories);
    if (data.settings) saveSettings(data.settings);
    return true;
  } catch (err) {
    console.error('Failed to import data', err);
    return false;
  }
}
