import React, { useEffect } from 'react';
import { ActiveView, Category } from '../types';
import { 
  LayoutDashboard, 
  CalendarDays, 
  CalendarRange, 
  Calendar as CalendarIcon, 
  Bell, 
  FileText, 
  Folders, 
  Timer, 
  Flame, 
  Layers,
  ChevronLeft
} from 'lucide-react';

interface SidebarProps {
  activeView: ActiveView;
  onSelectView: (view: ActiveView) => void;
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  onOpenFocusTimer: () => void;
  todayTasksCount: number;
  dueRemindersCount: number;
  notesCount: number;
  streakDays: number;
  isOpen: boolean;
  onToggleSidebar: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onSelectView,
  categories,
  selectedCategory,
  onSelectCategory,
  onOpenFocusTimer,
  todayTasksCount,
  dueRemindersCount,
  notesCount,
  streakDays,
  isOpen,
  onToggleSidebar,
}) => {
  // Close sidebar on Escape if desired
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onToggleSidebar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onToggleSidebar]);

  const navItems = [
    { id: 'overview' as ActiveView, label: 'Overview', icon: LayoutDashboard },
    { 
      id: 'daily' as ActiveView, 
      label: 'Daily Schedule', 
      icon: CalendarDays, 
      badge: todayTasksCount > 0 ? todayTasksCount : undefined 
    },
    { id: 'weekly' as ActiveView, label: 'Weekly Planner', icon: CalendarRange },
    { id: 'monthly' as ActiveView, label: 'Monthly Calendar', icon: CalendarIcon },
    { 
      id: 'reminders' as ActiveView, 
      label: 'Reminders with Time', 
      icon: Bell, 
      badge: dueRemindersCount > 0 ? dueRemindersCount : undefined,
    },
    { 
      id: 'notes' as ActiveView, 
      label: 'Notes & Ideas', 
      icon: FileText, 
      badge: notesCount > 0 ? notesCount : undefined 
    },
    { id: 'organize' as ActiveView, label: 'Categories & Data', icon: Folders },
  ];

  return (
    <aside 
      className={`
        bg-[var(--app-sidebar)] border-r border-[var(--app-border)] flex flex-col shrink-0 transition-all duration-300 ease-in-out z-20 h-screen sticky top-0
        ${isOpen ? 'w-64 opacity-100' : 'w-0 opacity-0 overflow-hidden border-r-0'}
      `}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-4 border-b border-[var(--app-border)] justify-between shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div 
            className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm shadow-md shrink-0"
            style={{
              backgroundColor: 'var(--app-accent)',
              color: 'var(--app-accent-text)',
            }}
          >
            A
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold font-display tracking-tight text-white flex items-center gap-1.5 truncate">
              Taskify
              <span 
                className="text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold shrink-0"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'var(--app-accent)',
                }}
              >
                PRO
              </span>
            </div>
            <div className="text-[10px] text-[var(--app-text-muted)] font-mono truncate">Plan · Remind · Organize</div>
          </div>
        </div>

        {/* Collapse sidebar button */}
        <button
          onClick={onToggleSidebar}
          className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer shrink-0"
          title="Collapse sidebar"
        >
          <ChevronLeft size={18} />
        </button>
      </div>

      {/* Focus Sprint Launcher Banner */}
      <div className="px-3 pt-3 pb-2 shrink-0">
        <button
          onClick={onOpenFocusTimer}
          className="w-full py-2 px-2.5 bg-[var(--app-surface)] hover:bg-[var(--app-surface-hover)] border border-[var(--app-border)] hover:border-[var(--app-accent)]/50 rounded-xl text-left flex items-center justify-between group transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div 
              className="w-7 h-7 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform shrink-0"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                color: 'var(--app-accent)',
              }}
            >
              <Timer size={15} />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-white group-hover:text-[var(--app-accent)] transition-colors truncate">
                Focus Chamber
              </div>
              <div className="text-[10px] text-[var(--app-text-muted)] truncate">Pomodoro Deep Work</div>
            </div>
          </div>
          <span 
            className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-black/40 shrink-0"
            style={{ color: 'var(--app-accent)' }}
          >
            25m
          </span>
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1">
        <div className="px-2.5 py-1 text-[10px] font-mono tracking-wider uppercase text-[var(--app-text-muted)] font-semibold">
          Workspaces
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? 'font-semibold shadow-md'
                  : 'text-neutral-300 hover:text-white hover:bg-white/5'
              }`}
              style={
                isActive
                  ? {
                      backgroundColor: 'var(--app-accent)',
                      color: 'var(--app-accent-text)',
                    }
                  : {}
              }
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon size={16} className={isActive ? 'text-current' : 'text-neutral-400'} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className="text-[10px] font-mono px-1.5 py-0.2 rounded-full font-semibold shrink-0"
                  style={
                    isActive
                      ? {
                          backgroundColor: 'rgba(0, 0, 0, 0.3)',
                          color: 'inherit',
                        }
                      : {
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          color: 'var(--app-accent)',
                        }
                  }
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Categories Quick Filter */}
        <div className="pt-4 pb-1">
          <div className="px-2.5 py-1 text-[10px] font-mono tracking-wider uppercase text-[var(--app-text-muted)] font-semibold flex items-center justify-between">
            <span>Categories</span>
            {selectedCategory && (
              <button
                onClick={() => onSelectCategory(null)}
                className="hover:underline text-[10px] font-mono lowercase"
                style={{ color: 'var(--app-accent)' }}
              >
                clear
              </button>
            )}
          </div>

          <div className="space-y-0.5 mt-1">
            <button
              onClick={() => onSelectCategory(null)}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                selectedCategory === null
                  ? 'font-semibold bg-white/10'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
              }`}
              style={selectedCategory === null ? { color: 'var(--app-accent)' } : {}}
            >
              <span className="flex items-center gap-2 truncate">
                <Layers size={13} className="text-neutral-400 shrink-0" />
                All Items
              </span>
            </button>

            {categories.map((cat) => {
              const isCatSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(isCatSelected ? null : cat.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                    isCatSelected
                      ? 'text-white font-semibold bg-white/15'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: cat.colorHex }}
                    />
                    <span className="truncate">{cat.name}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer momentum stats */}
      <div className="p-3 border-t border-[var(--app-border)] bg-[var(--app-canvas)] shrink-0">
        <div className="flex items-center justify-between text-xs">
          <div 
            className="flex items-center gap-1.5 font-semibold font-display truncate"
            style={{ color: 'var(--app-accent)' }}
          >
            <Flame size={15} className="fill-current shrink-0" />
            <span className="truncate">{streakDays} Day Momentum</span>
          </div>
          <span className="text-[10px] font-mono text-[var(--app-text-muted)] shrink-0">100% Target</span>
        </div>
      </div>
    </aside>
  );
};
