import React, { useState } from 'react';
import { Note, Category } from '../types';
import { 
  FileText, 
  Plus, 
  Pin, 
  Trash2, 
  Edit3, 
  Copy, 
  Check, 
  CheckSquare, 
  Archive, 
  Tag, 
  Grid, 
  List, 
  Search,
  ArrowUpRight
} from 'lucide-react';

interface NotesViewProps {
  notes: Note[];
  categories: Category[];
  selectedCategory: string | null;
  onSelectNote: (note: Note) => void;
  onTogglePinNote: (noteId: string) => void;
  onToggleArchiveNote: (noteId: string) => void;
  onDeleteNote: (noteId: string) => void;
  onToggleNoteChecklist: (noteId: string, itemId: string) => void;
  onConvertToTasks: (note: Note) => void;
  onOpenNoteModal: () => void;
}

export const NotesView: React.FC<NotesViewProps> = ({
  notes,
  categories,
  selectedCategory,
  onSelectNote,
  onTogglePinNote,
  onToggleArchiveNote,
  onDeleteNote,
  onToggleNoteChecklist,
  onConvertToTasks,
  onOpenNoteModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [copiedNoteId, setCopiedNoteId] = useState<string | null>(null);

  // Extract all unique tags
  const allTags = Array.from(
    new Set(notes.flatMap((n) => n.tags.filter((t) => t.trim().length > 0)))
  );

  // Filter notes
  const filteredNotes = notes.filter((n) => {
    if (n.archived) return false;
    const matchesCat = selectedCategory ? n.category === selectedCategory : true;
    const matchesTag = selectedTag ? n.tags.includes(selectedTag) : true;
    const matchesSearch =
      searchQuery === ''
        ? true
        : n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesTag && matchesSearch;
  });

  const pinnedNotes = filteredNotes.filter((n) => n.pinned);
  const otherNotes = filteredNotes.filter((n) => !n.pinned);

  const getCategory = (catId: string) => categories.find((c) => c.id === catId);

  const handleCopyNote = (note: Note, e: React.MouseEvent) => {
    e.stopPropagation();
    const textToCopy = `# ${note.title}\n\n${note.content}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedNoteId(note.id);
    setTimeout(() => setCopiedNoteId(null), 1800);
  };

  const renderNoteCard = (note: Note) => {
    const cat = getCategory(note.category);
    const checklistCompleted = (note.checklist || []).filter((i) => i.checked).length;
    const totalChecklist = (note.checklist || []).length;

    // Accent styling based on color
    const borderStyle =
      note.color === 'gold'
        ? 'border-amber-400/40 hover:border-amber-400'
        : note.color === 'amber'
        ? 'border-amber-600/40 hover:border-amber-500'
        : note.color === 'charcoal'
        ? 'border-[#2d3444] hover:border-neutral-400'
        : 'border-[#232732] hover:border-amber-400/50';

    return (
      <div
        key={note.id}
        onClick={() => onSelectNote(note)}
        className="p-5 rounded-2xl bg-[var(--app-surface)] border border-[var(--app-border)] hover:border-[var(--app-accent)]/50 transition-all cursor-pointer flex flex-col justify-between group shadow-sm"
      >
        <div>
          {/* Top row: Category, Pin, Copy */}
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
              {cat && (
                <>
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: cat.colorHex }}
                  />
                  <span className="font-medium truncate max-w-[120px]">{cat.name}</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePinNote(note.id);
                }}
                className={`p-1 rounded hover:bg-white/10 transition-colors cursor-pointer ${
                  note.pinned ? 'text-[var(--app-accent)]' : 'text-neutral-500 hover:text-white'
                }`}
                title={note.pinned ? 'Unpin' : 'Pin to top'}
              >
                <Pin size={14} className={note.pinned ? 'fill-current' : ''} />
              </button>
              <button
                type="button"
                onClick={(e) => handleCopyNote(note, e)}
                className="p-1 text-neutral-400 hover:text-white rounded hover:bg-white/10 transition-colors cursor-pointer"
                title="Copy markdown text"
              >
                {copiedNoteId === note.id ? <Check size={14} className="text-[var(--app-accent)]" /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-sm font-bold font-display text-white group-hover:text-[var(--app-accent)] transition-colors line-clamp-2">
            {note.title}
          </h3>

          {/* Excerpt */}
          <p className="text-xs text-neutral-300 mt-2 line-clamp-4 leading-relaxed whitespace-pre-line font-sans">
            {note.content.replace(/[#*`>-]/g, '')}
          </p>

          {/* In-Note Checklist Preview */}
          {totalChecklist > 0 && (
            <div 
              className="mt-3.5 pt-3 border-t border-[var(--app-border)] space-y-1.5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-[10px] font-mono font-semibold uppercase text-[var(--app-accent)] flex items-center justify-between">
                <span>Action Checklist</span>
                <span>{checklistCompleted}/{totalChecklist}</span>
              </div>
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {note.checklist?.slice(0, 3).map((item) => (
                  <label
                    key={item.id}
                    className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => onToggleNoteChecklist(note.id, item.id)}
                      className="rounded border-[var(--app-border)] focus:ring-0 bg-[var(--app-canvas)] cursor-pointer"
                      style={{ accentColor: 'var(--app-accent)' }}
                    />
                    <span className={`text-[11px] truncate ${item.checked ? 'line-through text-neutral-500' : ''}`}>
                      {item.text}
                    </span>
                  </label>
                ))}
                {totalChecklist > 3 && (
                  <div className="text-[10px] text-neutral-400 pl-4 font-mono">
                    +{totalChecklist - 3} more items
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tags */}
          {note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {note.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] text-[var(--app-accent)] font-mono"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Card Footer */}
        <div className="mt-4 pt-3 border-t border-[var(--app-border)] flex items-center justify-between text-[11px] text-neutral-400">
          <span className="font-mono text-[10px]">
            {new Date(note.updatedAt).toLocaleDateString()}
          </span>

          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onConvertToTasks(note)}
              className="text-[10px] font-semibold text-neutral-300 hover:text-[var(--app-accent)] px-2 py-0.5 rounded bg-[var(--app-elevated)] hover:bg-[var(--app-surface-hover)] transition-colors cursor-pointer"
              title="Convert checklist or points to tasks"
            >
              To Tasks
            </button>
            <button
              onClick={() => onToggleArchiveNote(note.id)}
              className="p-1 text-neutral-400 hover:text-white rounded hover:bg-white/10 transition-colors cursor-pointer"
              title="Archive note"
            >
              <Archive size={13} />
            </button>
            <button
              onClick={() => onDeleteNote(note.id)}
              className="p-1 text-neutral-400 hover:text-red-400 rounded hover:bg-white/10 transition-colors cursor-pointer"
              title="Delete note"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="text-xs font-mono text-[var(--app-accent)] font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <FileText size={13} />
            Knowledge &amp; Strategy Hub
          </div>
          <h1 className="text-xl font-bold font-display text-white">
            Notes, Specs &amp; Meeting Briefs
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Capture rich markdown notes, in-note checklists, and convert thoughts to scheduled tasks
          </p>
        </div>

        <button
          onClick={onOpenNoteModal}
          className="px-4 py-2 font-semibold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all self-start md:self-auto cursor-pointer"
          style={{
            backgroundColor: 'var(--app-accent)',
            color: 'var(--app-accent-text)',
          }}
        >
          <Plus size={15} /> Create Note
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Tag filter items */}
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              selectedTag === null
                ? 'shadow-xs'
                : 'bg-[var(--app-surface)] text-neutral-400 hover:text-white border border-[var(--app-border)]'
            }`}
            style={
              selectedTag === null
                ? {
                    backgroundColor: 'var(--app-accent)',
                    color: 'var(--app-accent-text)',
                  }
                : {}
            }
          >
            All Tags
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-colors cursor-pointer ${
                selectedTag === tag
                  ? 'font-bold shadow-xs'
                  : 'bg-[var(--app-surface)] text-neutral-400 hover:text-white border border-[var(--app-border)]'
              }`}
              style={
                selectedTag === tag
                  ? {
                      backgroundColor: 'var(--app-accent)',
                      color: 'var(--app-accent-text)',
                    }
                  : {}
              }
            >
              #{tag}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-2.5 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes content..."
              className="pl-9 pr-3 py-1.5 bg-[var(--app-surface)] border border-[var(--app-border)] rounded-xl text-xs text-white placeholder-neutral-400 focus:outline-hidden focus:border-[var(--app-accent)] w-56"
            />
          </div>

          <div className="flex items-center bg-[var(--app-surface)] border border-[var(--app-border)] rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-[var(--app-elevated)] text-[var(--app-accent)]' : 'text-neutral-400 hover:text-white'
              }`}
              title="Grid View"
            >
              <Grid size={15} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'list' ? 'bg-[var(--app-elevated)] text-[var(--app-accent)]' : 'text-neutral-400 hover:text-white'
              }`}
              title="List View"
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Pinned Section */}
      {pinnedNotes.length > 0 && (
        <div>
          <div className="text-xs font-bold font-display text-[var(--app-accent)] flex items-center gap-1.5 mb-3">
            <Pin size={14} className="fill-current" />
            Pinned Notes ({pinnedNotes.length})
          </div>
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                : 'space-y-3'
            }
          >
            {pinnedNotes.map((n) => renderNoteCard(n))}
          </div>
        </div>
      )}

      {/* Other Notes Section */}
      <div>
        {pinnedNotes.length > 0 && otherNotes.length > 0 && (
          <div className="text-xs font-bold font-display text-neutral-400 mb-3">
            All Notes ({otherNotes.length})
          </div>
        )}
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'space-y-3'
          }
        >
          {otherNotes.map((n) => renderNoteCard(n))}
        </div>
      </div>

      {/* Empty State */}
      {filteredNotes.length === 0 && (
        <div className="text-center py-16 bg-[var(--app-surface)] border border-dashed border-[var(--app-border)] rounded-2xl">
          <FileText size={36} className="mx-auto text-neutral-500 mb-3" />
          <h3 className="text-sm font-semibold text-neutral-200">No Notes Found</h3>
          <p className="text-xs text-neutral-400 mt-1 mb-4">
            Capture thoughts, meeting briefs, ideas, or specs with ease.
          </p>
          <button
            onClick={onOpenNoteModal}
            className="px-4 py-2 font-semibold text-xs rounded-xl cursor-pointer"
            style={{
              backgroundColor: 'var(--app-accent)',
              color: 'var(--app-accent-text)',
            }}
          >
            + Create First Note
          </button>
        </div>
      )}
    </div>
  );
};
