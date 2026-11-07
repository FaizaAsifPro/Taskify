export type Priority = 'urgent' | 'high' | 'medium' | 'low';

export type Recurrence = 'none' | 'daily' | 'weekly' | 'monthly';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm (24h)
  priority: Priority;
  category: string;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  subtasks: SubTask[];
  tags: string[];
  estimatedMinutes?: number;
  recurrence?: Recurrence;
  reminderTime?: string; // ISO or HH:mm
}

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  dateTime: string; // YYYY-MM-DDTHH:mm
  completed: boolean;
  completedAt?: string;
  priority: Priority;
  category: string;
  recurrence: Recurrence;
  snoozedUntil?: string; // ISO
  linkedTaskId?: string;
  linkedNoteId?: string;
  createdAt: string;
}

export interface NoteChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

export type NoteColor = 'gold' | 'amber' | 'obsidian' | 'charcoal' | 'bronze';

export interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  color: NoteColor;
  pinned: boolean;
  archived: boolean;
  checklist?: NoteChecklistItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  colorHex: string;
  icon: string;
}

export type ActiveView = 
  | 'overview' 
  | 'daily' 
  | 'weekly' 
  | 'monthly' 
  | 'reminders' 
  | 'notes' 
  | 'organize';

export type ThemePreset = 
  | 'burgundy-rose-mint' 
  | 'obsidian-gold' 
  | 'cyber-amber' 
  | 'emerald-midnight' 
  | 'royal-amethyst' 
  | 'nordic-frost' 
  | 'crimson-noir';

export interface AppSettings {
  soundEnabled: boolean;
  themePreset: ThemePreset;
  startOfWeek: 0 | 1; // 0 = Sunday, 1 = Monday
  defaultCategory: string;
}
