import React, { useState, useEffect } from 'react';
import { ActiveView, ThemePreset } from '../types';
import { 
  Menu, 
  Search, 
  Plus, 
  CheckSquare, 
  Bell, 
  FileText, 
  ChevronDown,
  Palette,
  Check
} from 'lucide-react';

interface HeaderProps {
  activeView: ActiveView;
  currentTheme: ThemePreset;
  onSelectTheme: (theme: ThemePreset) => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onOpenCommandPalette: () => void;
  onOpenTaskModal: () => void;
  onOpenReminderModal: () => void;
  onOpenNoteModal: () => void;
  onOpenFocusTimer: () => void;
}

export const THEME_OPTIONS: { id: ThemePreset; name: string; tag: string; swatches: [string, string, string] }[] = [
  {
    id: 'burgundy-rose-mint',
    name: 'Velvet Burgundy & Matcha Rose',
    tag: 'Burgundy / Matcha Green / Blush Pink',
    swatches: ['#3f122c', '#a3e635', '#f472b6'],
  },
  {
    id: 'obsidian-gold',
    name: 'Obsidian & Pure Canary Gold',
    tag: 'Pitch Black / Radiant Canary Gold',
    swatches: ['#13151b', '#facc15', '#fef08a'],
  },
  {
    id: 'cyber-amber',
    name: 'Espresso Mocha & Caramel',
    tag: 'Rich Mocha / Warm Caramel Toffee',
    swatches: ['#36221a', '#f59e0b', '#fed7aa'],
  },
  {
    id: 'emerald-midnight',
    name: 'Emerald Sage & Almond Gold',
    tag: 'Botanical Pine / Eucalyptus / Almond',
    swatches: ['#163d2f', '#6ee7b7', '#fde68a'],
  },
  {
    id: 'royal-amethyst',
    name: 'Midnight Lavender & Sakura',
    tag: 'Plum Velvet / Misty Lavender / Rose',
    swatches: ['#2d224d', '#c4b5fd', '#f472b6'],
  },
  {
    id: 'nordic-frost',
    name: 'Nordic Slate & Ice Aqua',
    tag: 'Arctic Fjord / Ice Cyan / Glacial White',
    swatches: ['#1e3856', '#38bdf8', '#e0f2fe'],
  },
  {
    id: 'crimson-noir',
    name: 'Crimson Noir & Rose Gold',
    tag: 'Dark Gothic Ruby / Scarlet / Warm Ivory',
    swatches: ['#3c111a', '#f87171', '#fef08a'],
  },
];

export const Header: React.FC<HeaderProps> = ({
  activeView,
  currentTheme,
  onSelectTheme,
  isSidebarOpen,
  onToggleSidebar,
  onOpenCommandPalette,
  onOpenTaskModal,
  onOpenReminderModal,
  onOpenNoteModal,
}) => {
  const [isNewMenuOpen, setIsNewMenuOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

  // Close menus on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsNewMenuOpen(false);
        setIsThemeMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const viewTitles: Record<ActiveView, string> = {
    overview: 'Executive Dashboard',
    daily: 'Daily Schedule & Timeline',
    weekly: 'Weekly 7-Day Planner',
    monthly: 'Monthly Calendar Grid',
    reminders: 'Time-Based Reminders',
    notes: 'Notes & Idea Capture',
    organize: 'Categories & Organization',
  };

  const activeThemeMeta = THEME_OPTIONS.find((t) => t.id === currentTheme) || THEME_OPTIONS[0];

  return (
    <header className="h-16 bg-[var(--app-header)]/95 backdrop-blur-md border-b border-[var(--app-border)] px-4 lg:px-6 flex items-center justify-between gap-3 sticky top-0 z-30 transition-colors shrink-0">
      {/* Zone 1: Brand & View Context with Sidebar Toggle */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          onClick={onToggleSidebar}
          className="p-2 text-neutral-300 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          title={isSidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
          aria-label="Toggle sidebar"
        >
          <Menu size={19} />
        </button>

        <div className="flex items-center gap-2 text-sm whitespace-nowrap">
          <span className="font-bold text-white tracking-tight">AURATASK</span>
          <span className="text-neutral-500">/</span>
          <span className="text-[var(--app-accent)] font-medium">{viewTitles[activeView]}</span>
        </div>
      </div>

      {/* Zone 2: Search Bar & Command Palette Trigger */}
      <div className="hidden sm:flex items-center flex-1 max-w-md mx-auto">
        <button
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between px-3.5 py-1.5 bg-[var(--app-surface)] hover:bg-[var(--app-surface-hover)] border border-[var(--app-border)] rounded-xl text-xs text-neutral-300 transition-colors group cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Search size={14} className="text-[var(--app-accent)] group-hover:scale-105 transition-transform" />
            <span>Search tasks, reminders, notes...</span>
          </span>
          <kbd className="font-mono text-[10px] text-neutral-400 bg-white/5 px-1.5 py-0.5 rounded border border-white/10">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Zone 3: Theme Selector & Primary Action */}
      <div className="flex items-center gap-2.5 shrink-0 relative">
        {/* Theme Picker Dropdown Button */}
        <div className="relative">
          <button
            onClick={() => {
              setIsThemeMenuOpen(!isThemeMenuOpen);
              setIsNewMenuOpen(false);
            }}
            className="px-3 py-1.5 text-xs font-medium text-neutral-200 bg-[var(--app-surface)] hover:bg-[var(--app-surface-hover)] border border-[var(--app-border)] rounded-xl transition-all flex items-center gap-2 cursor-pointer"
            title="Choose Theme Palette"
          >
            <Palette size={14} className="text-[var(--app-accent)]" />
            <span className="hidden md:inline font-sans">{activeThemeMeta.name}</span>
            <div className="flex items-center gap-1">
              {activeThemeMeta.swatches.map((color, idx) => (
                <span
                  key={idx}
                  className="w-2 h-2 rounded-full border border-black/40"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <ChevronDown size={12} className={`transition-transform duration-200 ${isThemeMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Theme Options Dropdown Popover */}
          {isThemeMenuOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsThemeMenuOpen(false)} 
              />
              <div className="absolute right-0 mt-2 w-72 bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 text-[10px] font-mono tracking-wider uppercase text-neutral-400 font-semibold border-b border-[var(--app-border)] mb-1">
                  Select Visual Theme
                </div>
                <div className="space-y-1 max-h-72 overflow-y-auto">
                  {THEME_OPTIONS.map((theme) => {
                    const isSelected = currentTheme === theme.id;
                    return (
                      <button
                        key={theme.id}
                        onClick={() => {
                          onSelectTheme(theme.id);
                          setIsThemeMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors text-left cursor-pointer ${
                          isSelected
                            ? 'bg-white/10 text-white font-semibold'
                            : 'text-neutral-300 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="flex items-center -space-x-1">
                            {theme.swatches.map((swatch, idx) => (
                              <span
                                key={idx}
                                className="w-3.5 h-3.5 rounded-full border border-black/60 shadow-xs"
                                style={{ backgroundColor: swatch }}
                              />
                            ))}
                          </div>
                          <div>
                            <div className="font-medium text-white">{theme.name}</div>
                            <div className="text-[10px] text-neutral-400">{theme.tag}</div>
                          </div>
                        </div>

                        {isSelected && (
                          <Check size={14} className="text-[var(--app-accent)]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* New Item Action Button */}
        <div className="relative">
          <button
            onClick={() => {
              setIsNewMenuOpen(!isNewMenuOpen);
              setIsThemeMenuOpen(false);
            }}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl shadow-md transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            style={{
              backgroundColor: 'var(--app-accent)',
              color: 'var(--app-accent-text)',
            }}
          >
            <Plus size={15} />
            <span>New Item</span>
            <ChevronDown size={13} className={`transition-transform duration-200 ${isNewMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* New Item Dropdown */}
          {isNewMenuOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsNewMenuOpen(false)} 
              />
              <div className="absolute right-0 mt-2 w-56 bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <button
                  onClick={() => {
                    setIsNewMenuOpen(false);
                    onOpenTaskModal();
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-neutral-200 hover:bg-white/10 hover:text-[var(--app-accent)] transition-colors text-left"
                >
                  <CheckSquare size={14} className="text-[var(--app-accent)]" />
                  <div>
                    <div className="font-medium">Scheduled Task</div>
                    <div className="text-[10px] text-neutral-400">Add to daily or weekly plan</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsNewMenuOpen(false);
                    onOpenReminderModal();
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-neutral-200 hover:bg-white/10 hover:text-[var(--app-accent)] transition-colors text-left"
                >
                  <Bell size={14} className="text-[var(--app-accent)]" />
                  <div>
                    <div className="font-medium">Time Reminder</div>
                    <div className="text-[10px] text-neutral-400">Audio-visual alert at exact time</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsNewMenuOpen(false);
                    onOpenNoteModal();
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-neutral-200 hover:bg-white/10 hover:text-[var(--app-accent)] transition-colors text-left border-t border-[var(--app-border)]"
                >
                  <FileText size={14} className="text-[var(--app-accent)]" />
                  <div>
                    <div className="font-medium">New Note</div>
                    <div className="text-[10px] text-neutral-400">Ideas, meeting minutes, specs</div>
                  </div>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
