import React, { useState, useEffect, useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { SelectedStage } from './types';
import { getColor } from './types';

interface Props {
  stage: SelectedStage;
  index: number;
  onRename: (key: string, name: string) => void;
  onRemove: (key: string) => void;
}

const SortableStageRow: React.FC<Props> = ({ stage, index, onRename, onRemove }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: stage.key });
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(stage.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  const commit = () => {
    const t = draft.trim();
    if (t) onRename(stage.key, t); else setDraft(stage.name);
    setEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.45 : 1, zIndex: isDragging ? 50 : undefined }}
      className="flex items-center gap-2 p-2.5 bg-white border border-gray-200 rounded-lg mb-2 shadow-sm group"
    >
      <button {...attributes} {...listeners} tabIndex={-1}
        className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing touch-none flex-shrink-0">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-6 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
        </svg>
      </button>

      <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
        style={{ backgroundColor: getColor(index) }}>
        <span style={{ color: '#374151' }}>{index + 1}</span>
      </span>

      {editing ? (
        <input ref={inputRef} value={draft} onChange={e => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setDraft(stage.name); setEditing(false); } }}
          className="flex-1 px-2 py-1 text-sm border border-[#F79E61] rounded-md focus:outline-none focus:ring-2 focus:ring-[#F79E61]/40" />
      ) : (
        <span onClick={() => { setDraft(stage.name); setEditing(true); }}
          className="flex-1 text-sm text-gray-700 font-medium px-2 py-1 rounded-md hover:bg-orange-50 cursor-text transition-colors">
          {stage.name}
          {stage.isNew && <span className="ml-1.5 text-xs text-[#F79E61] font-normal">(mới)</span>}
        </span>
      )}

      <button onClick={() => { setDraft(stage.name); setEditing(true); }}
        className="p-1 text-gray-300 hover:text-[#F79E61] transition-colors opacity-0 group-hover:opacity-100">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      </button>

      <button onClick={() => onRemove(stage.key)}
        className="p-1 text-gray-300 hover:text-red-500 transition-colors flex-shrink-0">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default SortableStageRow;
