import React, { useState, useEffect } from 'react';
import { Note, NoteColor, Category, NoteChecklistItem } from '../types';
import { X, Pin, Tag, Folder, Plus, Trash2, CheckSquare, Type, Bold, Italic, List, Code, Quote, ArrowLeft } from 'lucide-react';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: Note) => void;
  initialNote?: Note | null;
  categories: Category[];
  onConvertToTasks?: (note: Note) => void;
}

export const NoteModal: React.FC<NoteModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialNote,
  categories,
  onConvertToTasks,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(categories[0]?.id || 'work');
  const [color, setColor] = useState<NoteColor>('gold');
  const [pinned, setPinned] = useState(false);
  const [tagsInput, setTagsInput] = useState('');
  const [checklist, setChecklist] = useState<NoteChecklistItem[]>([]);
  const [newChecklistText, setNewChecklistText] = useState('');

  // Reset fields when opening a new note or editing an existing one
  useEffect(() => {
    if (isOpen) {
      if (initialNote) {
        setTitle(initialNote.title || '');
        setContent(initialNote.content || '');
        setCategory(initialNote.category || categories[0]?.id || 'work');
        setColor(initialNote.color || 'gold');
        setPinned(initialNote.pinned || false);
        setTagsInput(initialNote.tags?.join(', ') || '');
        setChecklist(initialNote.checklist ? [...initialNote.checklist] : []);
      } else {
        // Completely fresh and empty for new note
        setTitle('');
        setContent('');
        setCategory(categories[0]?.id || 'work');
        setColor('gold');
        setPinned(false);
        setTagsInput('');
        setChecklist([]);
      }
      setNewChecklistText('');
    }
  }, [isOpen, initialNote, categories]);

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

  const handleAddChecklistItem = () => {
    if (!newChecklistText.trim()) return;
    setChecklist([
      ...checklist,
      {
        id: `nc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        text: newChecklistText.trim(),
        checked: false,
      },
    ]);
    setNewChecklistText('');
  };

  const handleToggleChecklistItem = (id: string) => {
    setChecklist(
      checklist.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const handleRemoveChecklistItem = (id: string) => {
    setChecklist(checklist.filter((item) => item.id !== id));
  };

  const insertMarkdownSnippet = (prefix: string, suffix: string = '') => {
    setContent((prev) => `${prev}\n${prefix} ${suffix}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const noteToSave: Note = {
      id: initialNote?.id || `note-${Date.now()}`,
      title: title.trim() || 'Untitled Note',
      content: content.trim(),
      category,
      tags,
      color,
      pinned,
      archived: initialNote?.archived || false,
      checklist,
      createdAt: initialNote?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(noteToSave);
    onClose();
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overscroll-contain"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl max-h-[calc(100dvh-2rem)] flex flex-col bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl shadow-2xl overflow-hidden text-white my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Header with Back Arrow - Pinned */}
          <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-[var(--app-border)] bg-[var(--app-surface)]">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                title="Back (Esc)"
                aria-label="Back"
              >
                <ArrowLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() => setPinned(!pinned)}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  pinned
                    ? 'bg-[var(--app-accent)]/20 text-[var(--app-accent)] border border-[var(--app-accent)]/40'
                    : 'text-neutral-400 hover:text-white bg-white/5'
                }`}
                title={pinned ? 'Unpin note' : 'Pin note to top'}
              >
                <Pin size={16} className={pinned ? 'fill-current' : ''} />
              </button>
              <h2 className="text-base sm:text-lg font-bold font-display text-white">
                {initialNote ? 'Edit Note' : 'Create Note'}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              {initialNote && onConvertToTasks && (
                <button
                  type="button"
                  onClick={() => {
                    onConvertToTasks(initialNote);
                    onClose();
                  }}
                  className="px-2.5 py-1 text-xs text-[var(--app-accent)] hover:underline bg-white/5 border border-[var(--app-border)] rounded-md transition-colors cursor-pointer"
                  title="Convert checklist items or lines to scheduled tasks"
                >
                  Convert to Tasks
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Note Form Body - Scrollable */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 overscroll-contain">
            {/* Title */}
            <div>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Note Title..."
                className="w-full px-3.5 py-2.5 bg-[var(--app-elevated)] border border-[var(--app-border)] rounded-xl text-base font-semibold text-white placeholder-neutral-400 focus:outline-hidden focus:border-[var(--app-accent)] transition-colors"
              />
            </div>

            {/* Quick Markdown Formatting Bar */}
            <div className="flex flex-wrap items-center gap-1 p-1 bg-[var(--app-elevated)] border border-[var(--app-border)] rounded-xl text-neutral-400">
              <button
                type="button"
                onClick={() => insertMarkdownSnippet('## Heading')}
                className="p-1.5 hover:text-[var(--app-accent)] hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                title="Add Heading"
              >
                <Type size={14} />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdownSnippet('**Bold Text**')}
                className="p-1.5 hover:text-[var(--app-accent)] hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                title="Add Bold"
              >
                <Bold size={14} />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdownSnippet('*Italic Text*')}
                className="p-1.5 hover:text-[var(--app-accent)] hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                title="Add Italic"
              >
                <Italic size={14} />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdownSnippet('- ')}
                className="p-1.5 hover:text-[var(--app-accent)] hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                title="Add Bullet List"
              >
                <List size={14} />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdownSnippet('> ')}
                className="p-1.5 hover:text-[var(--app-accent)] hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                title="Add Blockquote"
              >
                <Quote size={14} />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdownSnippet('```\ncode block\n```')}
                className="p-1.5 hover:text-[var(--app-accent)] hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                title="Add Code Block"
              >
                <Code size={14} />
              </button>
              <span className="text-neutral-500 px-1">|</span>
              <span className="text-[11px] text-neutral-400 ml-auto font-mono">
                {wordCount} words · {charCount} chars
              </span>
            </div>

            {/* Content Body */}
            <div>
              <textarea
                rows={6}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Capture strategic thoughts, meeting notes, project specs, or key references..."
                className="w-full px-3.5 py-3 bg-[var(--app-elevated)] border border-[var(--app-border)] rounded-xl text-sm leading-relaxed text-white placeholder-neutral-400 focus:outline-hidden focus:border-[var(--app-accent)] transition-colors font-sans resize-y min-h-[140px]"
              />
            </div>

            {/* In-Note Checklist Section */}
            <div className="p-3 bg-[var(--app-elevated)] border border-[var(--app-border)] rounded-xl">
              <div className="text-xs font-semibold text-neutral-300 flex items-center justify-between mb-2">
                <span className="flex items-center gap-1.5">
                  <CheckSquare size={13} className="text-[var(--app-accent)]" />
                  Action Checklist Inside Note
                </span>
                <span className="text-[11px] text-neutral-400 font-mono">
                  {checklist.filter((i) => i.checked).length}/{checklist.length} done
                </span>
              </div>

              {checklist.length > 0 && (
                <div className="space-y-1.5 mb-2.5 max-h-36 overflow-y-auto pr-1">
                  {checklist.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between px-2.5 py-1.5 bg-[var(--app-surface)] border border-[var(--app-border)] rounded-lg text-xs group"
                    >
                      <label className="flex items-center gap-2 cursor-pointer flex-1 mr-2">
                        <input
                          type="checkbox"
                          checked={item.checked}
                          onChange={() => handleToggleChecklistItem(item.id)}
                          className="rounded border-[var(--app-border)] focus:ring-0 focus:ring-offset-0 bg-[var(--app-canvas)] cursor-pointer"
                          style={{ accentColor: 'var(--app-accent)' }}
                        />
                        <span className={item.checked ? 'line-through text-neutral-500' : 'text-neutral-200'}>
                          {item.text}
                        </span>
                      </label>
                      <button
                        type="button"
                        onClick={() => handleRemoveChecklistItem(item.id)}
                        className="text-neutral-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newChecklistText}
                  onChange={(e) => setNewChecklistText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddChecklistItem();
                    }
                  }}
                  placeholder="Add actionable checklist step..."
                  className="flex-1 px-3 py-1.5 bg-[var(--app-surface)] border border-[var(--app-border)] rounded-lg text-xs text-white placeholder-neutral-400 focus:outline-hidden focus:border-[var(--app-accent)]"
                />
                <button
                  type="button"
                  onClick={handleAddChecklistItem}
                  className="px-3 py-1.5 bg-[var(--app-surface)] hover:bg-[var(--app-surface-hover)] text-[var(--app-accent)] border border-[var(--app-border)] rounded-lg text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus size={13} /> Add Item
                </button>
              </div>
            </div>

            {/* Category & Tags */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1 flex items-center gap-1.5">
                  <Folder size={13} className="text-[var(--app-accent)]" />
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--app-elevated)] border border-[var(--app-border)] rounded-lg text-xs text-white focus:outline-hidden focus:border-[var(--app-accent)] transition-colors"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[var(--app-surface)] text-white">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1 flex items-center gap-1.5">
                  <Tag size={13} className="text-[var(--app-accent)]" />
                  Tags (Comma separated)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="Design, Architecture, Ideas"
                  className="w-full px-3 py-2 bg-[var(--app-elevated)] border border-[var(--app-border)] rounded-lg text-xs text-white placeholder-neutral-400 focus:outline-hidden focus:border-[var(--app-accent)] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Footer buttons - Pinned */}
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
              {initialNote ? 'Update Note' : 'Save Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
