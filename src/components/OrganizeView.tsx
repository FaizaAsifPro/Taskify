import React, { useState } from 'react';
import { Category, Task, Reminder, Note, AppSettings, ThemePreset } from '../types';
import { 
  Folders, 
  Plus, 
  Trash2, 
  Palette, 
  Download, 
  Upload, 
  RotateCcw, 
  Check, 
  Layers, 
  FileJson,
  Sparkles,
  BarChart3,
  ShieldCheck
} from 'lucide-react';
import { exportAllData, importAllData, generateInitialData } from '../utils/storage';

interface OrganizeViewProps {
  categories: Category[];
  tasks: Task[];
  reminders: Reminder[];
  notes: Note[];
  settings: AppSettings;
  onUpdateCategories: (categories: Category[]) => void;
  onUpdateSettings: (settings: AppSettings) => void;
  onResetData: () => void;
  onReloadAllData: () => void;
}

export const OrganizeView: React.FC<OrganizeViewProps> = ({
  categories,
  tasks,
  reminders,
  notes,
  settings,
  onUpdateCategories,
  onUpdateSettings,
  onResetData,
  onReloadAllData,
}) => {
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#FACC15');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const availableColors = [
    '#FACC15', // Gold
    '#F59E0B', // Amber
    '#38BDF8', // Cyan
    '#34D399', // Emerald
    '#A855F7', // Purple
    '#FB7185', // Rose
    '#E2E8F0', // Platinum
    '#F97316', // Orange
  ];

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: newCatName.trim(),
      colorHex: newCatColor,
      icon: 'Folder',
    };

    onUpdateCategories([...categories, newCat]);
    setNewCatName('');
  };

  const handleDeleteCategory = (catId: string) => {
    if (categories.length <= 1) {
      alert('You must keep at least one category.');
      return;
    }
    onUpdateCategories(categories.filter((c) => c.id !== catId));
  };

  const handleExport = () => {
    const json = exportAllData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auratask-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importAllData(content);
      if (success) {
        setImportStatus('Data successfully imported and restored!');
        onReloadAllData();
        setTimeout(() => setImportStatus(null), 3500);
      } else {
        setImportStatus('Import failed. Invalid JSON format.');
        setTimeout(() => setImportStatus(null), 3500);
      }
    };
    reader.readAsText(file);
  };

  // Lifetime Stats
  const completedTasks = tasks.filter((t) => t.completed).length;
  const taskCompletionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
  const totalSubtasks = tasks.reduce((acc, t) => acc + t.subtasks.length, 0);
  const completedSubtasks = tasks.reduce(
    (acc, t) => acc + t.subtasks.filter((s) => s.completed).length,
    0
  );

  const themePresets: { id: ThemePreset; name: string; desc: string; preview: string }[] = [
    {
      id: 'burgundy-rose-mint',
      name: 'Burgundy & Mint Rose',
      desc: 'Deep wine burgundy velvet with fresh light green and blush pink highlights (Default)',
      preview: 'from-[#14040c] via-[#3b1226] to-[#86efac]',
    },
    {
      id: 'obsidian-gold',
      name: 'Obsidian & Gold',
      desc: 'Deepest luxury black with electric radiant gold highlights',
      preview: 'from-black via-[#101217] to-amber-400',
    },
    {
      id: 'cyber-amber',
      name: 'Cyber Amber',
      desc: 'Pitch charcoal matte with warm energetic amber tones',
      preview: 'from-black via-[#141416] to-amber-500',
    },
    {
      id: 'emerald-midnight',
      name: 'Emerald & Midnight',
      desc: 'Deep midnight pine with crisp mint and light sage accents',
      preview: 'from-[#040c09] via-[#0f2c22] to-[#34d399]',
    },
    {
      id: 'royal-amethyst',
      name: 'Royal Amethyst',
      desc: 'Imperial plum velvet with lavender and soft pastel rose',
      preview: 'from-[#0d0615] via-[#2f1a48] to-[#c084fc]',
    },
    {
      id: 'nordic-frost',
      name: 'Nordic Frost',
      desc: 'Deep arctic slate with luminous ice blue and cyan',
      preview: 'from-[#050c14] via-[#173352] to-[#38bdf8]',
    },
    {
      id: 'crimson-noir',
      name: 'Crimson Noir',
      desc: 'Gothic ruby black with vivid scarlet and warm ivory gold',
      preview: 'from-[#100406] via-[#391119] to-[#f87171]',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="text-xs font-mono text-[var(--app-accent)] font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Folders size={13} />
            Organization &amp; System Configuration
          </div>
          <h1 className="text-xl font-bold font-display text-white">
            Categories, Data &amp; Theme Studio
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Customize workspaces, theme nuances, backup your data, or analyze productivity velocity
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="px-3.5 py-2 bg-[var(--app-elevated)] hover:bg-[var(--app-surface-hover)] text-white border border-[var(--app-border)] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download size={14} className="text-[var(--app-accent)]" /> Export JSON
          </button>
        </div>
      </div>

      {importStatus && (
        <div className="p-3 bg-[var(--app-accent)]/10 border border-[var(--app-accent)]/40 rounded-xl text-xs font-medium text-[var(--app-accent)] flex items-center gap-2">
          <ShieldCheck size={16} />
          <span>{importStatus}</span>
        </div>
      )}

      {/* Productivity Aggregate Analytics */}
      <div className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl p-5 transition-colors">
        <div className="flex items-center gap-2 pb-3 border-b border-[var(--app-border)] mb-4 text-white font-bold text-xs font-display">
          <BarChart3 size={15} className="text-[var(--app-accent)]" />
          Aggregate Productivity Output
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-[var(--app-elevated)] border border-[var(--app-border)] rounded-xl">
            <div className="text-xs text-neutral-400 mb-1">Total Scheduled Tasks</div>
            <div className="text-2xl font-bold font-mono text-white tabular-nums">{tasks.length}</div>
            <div className="text-[11px] text-[var(--app-accent)] font-mono mt-1">
              {completedTasks} completed ({taskCompletionRate}%)
            </div>
          </div>

          <div className="p-4 bg-[var(--app-elevated)] border border-[var(--app-border)] rounded-xl">
            <div className="text-xs text-neutral-400 mb-1">Subtasks Executed</div>
            <div className="text-2xl font-bold font-mono text-white tabular-nums">
              {completedSubtasks}/{totalSubtasks}
            </div>
            <div className="text-[11px] text-neutral-400 mt-1">Granular step progress</div>
          </div>

          <div className="p-4 bg-[var(--app-elevated)] border border-[var(--app-border)] rounded-xl">
            <div className="text-xs text-neutral-400 mb-1">Time Reminders</div>
            <div className="text-2xl font-bold font-mono text-white tabular-nums">{reminders.length}</div>
            <div className="text-[11px] text-neutral-400 mt-1">
              {reminders.filter((r) => !r.completed).length} active alerts
            </div>
          </div>

          <div className="p-4 bg-[var(--app-elevated)] border border-[var(--app-border)] rounded-xl">
            <div className="text-xs text-neutral-400 mb-1">Captured Notes</div>
            <div className="text-2xl font-bold font-mono text-white tabular-nums">{notes.length}</div>
            <div className="text-[11px] text-neutral-400 mt-1">
              {notes.filter((n) => n.pinned).length} pinned to desktop
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Split: Categories Manager + Theme Presets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Categories Manager */}
        <div className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl p-5 flex flex-col transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--app-border)] mb-4">
            <div>
              <h3 className="text-sm font-bold font-display text-white flex items-center gap-2">
                <Layers size={16} className="text-[var(--app-accent)]" />
                Workspaces &amp; Categories
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Organize all tasks, notes, and reminders by life &amp; work domain
              </p>
            </div>
          </div>

          {/* Categories List */}
          <div className="flex-1 space-y-2 mb-4">
            {categories.map((cat) => {
              const catTasksCount = tasks.filter((t) => t.category === cat.id).length;
              const catNotesCount = notes.filter((n) => n.category === cat.id).length;

              return (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-3 bg-[var(--app-elevated)] border border-[var(--app-border)] rounded-xl"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0"
                      style={{ backgroundColor: cat.colorHex }}
                    />
                    <div>
                      <h4 className="text-xs font-semibold text-white">{cat.name}</h4>
                      <p className="text-[10px] text-neutral-400 font-mono mt-0.5">
                        {catTasksCount} tasks · {catNotesCount} notes
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="p-1.5 text-neutral-400 hover:text-red-400 rounded hover:bg-white/10 transition-colors cursor-pointer"
                    title="Delete Category"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Add Category Form */}
          <form onSubmit={handleAddCategory} className="p-3 bg-[var(--app-elevated)] border border-[var(--app-border)] rounded-xl space-y-3">
            <div className="text-xs font-semibold text-neutral-300">Add New Category</div>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Category name (e.g. Research, Client Alpha)..."
                className="flex-1 px-3 py-1.5 bg-[var(--app-surface)] border border-[var(--app-border)] rounded-lg text-xs text-white placeholder-neutral-400 focus:outline-hidden focus:border-[var(--app-accent)]"
              />
              <button
                type="submit"
                className="px-3.5 py-1.5 font-semibold text-xs rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                style={{
                  backgroundColor: 'var(--app-accent)',
                  color: 'var(--app-accent-text)',
                }}
              >
                <Plus size={13} /> Add
              </button>
            </div>

            {/* Color Swatches */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[11px] text-neutral-400">Color Dot:</span>
              {availableColors.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  onClick={() => setNewCatColor(hex)}
                  className={`w-5 h-5 rounded-full transition-transform cursor-pointer ${
                    newCatColor === hex ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-black' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
          </form>
        </div>

        {/* Theme Variations */}
        <div className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl p-5 flex flex-col transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--app-border)] mb-4">
            <div>
              <h3 className="text-sm font-bold font-display text-white flex items-center gap-2">
                <Palette size={16} className="text-[var(--app-accent)]" />
                Theme &amp; Accent Nuances
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Curated designer palettes for executive and creative focus
              </p>
            </div>
          </div>

          <div className="space-y-3 flex-1">
            {themePresets.map((preset) => {
              const isSelected = settings.themePreset === preset.id;
              return (
                <div
                  key={preset.id}
                  onClick={() => onUpdateSettings({ ...settings, themePreset: preset.id })}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-[var(--app-elevated)] border-[var(--app-accent)] shadow-md shadow-black/20'
                      : 'bg-[var(--app-elevated)]/60 border-[var(--app-border)] hover:border-[var(--app-accent)]/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg bg-linear-to-tr ${preset.preview} border border-[var(--app-border)] shrink-0`}
                    />
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-2">
                        {preset.name}
                        {isSelected && (
                          <span 
                            className="text-[9px] font-mono px-1.5 py-0.2 font-semibold rounded"
                            style={{
                              backgroundColor: 'var(--app-accent)',
                              color: 'var(--app-accent-text)',
                            }}
                          >
                            ACTIVE
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] text-neutral-400 mt-0.5">{preset.desc}</p>
                    </div>
                  </div>

                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    isSelected ? 'border-[var(--app-accent)] text-black' : 'border-neutral-600'
                  }`} style={isSelected ? { backgroundColor: 'var(--app-accent)', color: 'var(--app-accent-text)' } : {}}>
                    {isSelected && <Check size={10} strokeWidth={3} />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sound & Preference Switches */}
          <div className="mt-4 pt-3 border-t border-[var(--app-border)] flex items-center justify-between text-xs">
            <span className="text-neutral-300">Bell Chimes &amp; Interaction Audio</span>
            <button
              onClick={() => onUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
              className="px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer"
              style={
                settings.soundEnabled
                  ? {
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      color: 'var(--app-accent)',
                      border: '1px solid var(--app-border)',
                    }
                  : {
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      color: '#94a3b8',
                    }
              }
            >
              {settings.soundEnabled ? 'Enabled' : 'Muted'}
            </button>
          </div>
        </div>
      </div>

      {/* Data Backup, Import & Reset Studio */}
      <div className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl p-5 transition-colors">
        <div className="flex items-center gap-2 pb-3 border-b border-[var(--app-border)] mb-4 text-white font-bold text-xs font-display">
          <FileJson size={15} className="text-[var(--app-accent)]" />
          Persistence, Backup &amp; Disaster Recovery
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-[var(--app-elevated)] border border-[var(--app-border)] rounded-xl flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-white mb-1">Export Full Database</h4>
              <p className="text-[11px] text-neutral-400 mb-4">
                Download all your scheduled tasks, notes, checklists, and time reminders as a portable JSON file.
              </p>
            </div>
            <button
              onClick={handleExport}
              className="w-full py-2 bg-[var(--app-surface)] hover:bg-[var(--app-surface-hover)] text-neutral-200 hover:text-white border border-[var(--app-border)] rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download size={13} className="text-[var(--app-accent)]" /> Export Backup
            </button>
          </div>

          <div className="p-4 bg-[var(--app-elevated)] border border-[var(--app-border)] rounded-xl flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-white mb-1">Restore from Backup</h4>
              <p className="text-[11px] text-neutral-400 mb-4">
                Import an existing AuraTask JSON backup file to instantly restore your workspace state.
              </p>
            </div>
            <label className="w-full py-2 bg-[var(--app-surface)] hover:bg-[var(--app-surface-hover)] text-neutral-200 hover:text-white border border-[var(--app-border)] rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
              <Upload size={13} className="text-[var(--app-accent)]" /> Import JSON
              <input
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
            </label>
          </div>

          <div className="p-4 bg-[var(--app-elevated)] border border-[var(--app-border)] rounded-xl flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-white mb-1">Demo State Reset</h4>
              <p className="text-[11px] text-neutral-400 mb-4">
                Reset database back to the pristine sample tasks, reminders, and notes.
              </p>
            </div>
            <button
              onClick={() => {
                if (window.confirm('Reset workspace back to original sample data? Any unsaved changes will be replaced.')) {
                  onResetData();
                }
              }}
              className="w-full py-2 bg-[var(--app-surface)] hover:bg-red-950/40 text-neutral-300 hover:text-red-400 border border-[var(--app-border)] hover:border-red-900/50 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw size={13} /> Reset to Demo Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
