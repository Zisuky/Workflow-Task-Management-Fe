import React, { useState, useEffect } from 'react';
import type { Task } from '../../../shared/types/task';
import { taskApi } from '../../task/infrastructure/task.client';

interface FlowCardProps {
  task: Task;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
  onPin?: (taskId: string) => void;
  onDelete?: (taskId: string) => void;
  onEdit?: (taskId: string) => void;
  /** Drill-down into subtask board */
  onCardClick?: (taskId: string) => void;
  isFinal?: boolean;
}

// ─── Priority badge ───────────────────────────────────────────────────────────
const priorityConfig: Record<string, { bg: string; text: string; label: string }> = {
  Low:     { bg: '#E5E7EB', text: '#374151',  label: 'THẤP' },
  Medium:  { bg: '#DBEAFE', text: '#1D4ED8',  label: 'TRUNG BÌNH' },
  High:    { bg: '#FEF3C7', text: '#D97706',  label: 'CAO' },
  Highest: { bg: '#FEE2E2', text: '#B91C1C',  label: 'CAO NHẤT' },
};

const getInitials = (name: string): string => {
  if (!name || name === 'Chưa có') return '?';
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

// Avatar color palette — cycles by initials
const AVATAR_COLORS = [
  'bg-orange-400', 'bg-blue-400', 'bg-green-500',
  'bg-purple-400', 'bg-pink-400', 'bg-teal-500',
];
const avatarColor = (initials: string) =>
  AVATAR_COLORS[initials.charCodeAt(0) % AVATAR_COLORS.length];

// ─── FlowCard ─────────────────────────────────────────────────────────────────
const FlowCard: React.FC<FlowCardProps> = ({
  task, onDragStart, onPin, onDelete, onEdit, onCardClick, isFinal = false,
}) => {
  const [isMenuOpen, setIsMenuOpen]     = useState(false);
  const [subtaskCount, setSubtaskCount] = useState<number | null>(null);

  const priority = priorityConfig[task.priority] ?? priorityConfig['Medium'];
  const initials  = getInitials(task.assignee ?? '');
  const avatarBg  = avatarColor(initials);

  // Load subtask count once on mount
  useEffect(() => {
    taskApi.getSubtaskSummary(task.id)
      .then((res: unknown) => {
        const raw = res as { data?: { total?: number } } | { total?: number };
        const total = (raw as { data?: { total?: number } }).data?.total
          ?? (raw as { total?: number }).total
          ?? 0;
        setSubtaskCount(total as number);
      })
      .catch(() => setSubtaskCount(0));
  }, [task.id]);

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger drill-down when clicking menu buttons
    if ((e.target as HTMLElement).closest('[data-no-drill]')) return;
    onCardClick?.(task.id);
  };

  return (
    <div
      draggable={!isFinal}
      onDragStart={e => !isFinal && onDragStart(e, task.id)}
      onClick={handleCardClick}
      className={`bg-white rounded-xl border shadow-sm p-3 mb-2.5 transition-all select-none ${
        isFinal
          ? 'opacity-60 grayscale cursor-default border-gray-100'
          : 'border-gray-100 cursor-pointer hover:shadow-md hover:-translate-y-0.5'
      }`}
    >
      {/* ── Row 1: task name + priority badge ─────────────────────────────── */}
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1 flex-1 min-w-0">
          {task.isPinned && (
            <span className="text-orange-400 flex-shrink-0 text-sm" title="Đã ghim">📌</span>
          )}
          <h4 className="text-sm font-semibold text-gray-800 leading-snug min-w-0 truncate">
            {task.name}
          </h4>
        </div>
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded flex-shrink-0 whitespace-nowrap"
          style={{ backgroundColor: priority.bg, color: priority.text }}
        >
          {priority.label}
        </span>
      </div>

      {/* ── Row 2: project code ────────────────────────────────────────────── */}
      {task.project && (
        <div className="flex items-center gap-1.5 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
          <span className="text-xs text-gray-500 truncate">{task.project}</span>
        </div>
      )}

      {/* ── Row 3: subtask count ───────────────────────────────────────────── */}
      {subtaskCount !== null && subtaskCount > 0 && (
        <div
          data-no-drill
          className="flex items-center gap-2 mb-2 px-2 py-1.5 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
          onClick={e => { e.stopPropagation(); onCardClick?.(task.id); }}
        >
          {/* Checkbox icon */}
          <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <span className="text-xs font-medium text-blue-600">{subtaskCount} subtasks</span>
          <span className="text-xs text-blue-400 ml-auto">Click để xem</span>
        </div>
      )}

      {/* ── Row 4: assignee avatar + name + menu ──────────────────────────── */}
      <div className="flex items-center justify-between gap-2 mt-1">
        {task.assignee && task.assignee !== 'Chưa có' ? (
          <div className="flex items-center gap-1.5 min-w-0">
            <div
              className={`w-6 h-6 rounded-full ${avatarBg} text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0`}
              title={task.assignee}
            >
              {initials}
            </div>
            <span className="text-xs text-gray-600 truncate max-w-[100px]">{task.assignee}</span>
          </div>
        ) : (
          <div />
        )}

        {/* ⋮ menu — hidden when task is in final state */}
        <div className="relative flex-shrink-0" data-no-drill>
          {!isFinal && (
            <>
              <button
                onClick={e => { e.stopPropagation(); setIsMenuOpen(v => !v); }}
                className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors text-base leading-none"
              >
                ⋮
              </button>
              {isMenuOpen && (
                <div
                  className="absolute right-0 top-7 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[130px] py-1"
                  onMouseLeave={() => setIsMenuOpen(false)}
                >
                  <button
                    onClick={e => { e.stopPropagation(); onPin?.(task.id); setIsMenuOpen(false); }}
                    className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    📌 {task.isPinned ? 'Bỏ ghim' : 'Ghim'}
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); onEdit?.(task.id); setIsMenuOpen(false); }}
                    className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    ✏️ Chỉnh sửa
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); onDelete?.(task.id); setIsMenuOpen(false); }}
                    className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    🗑 Xóa
                  </button>
                </div>
              )}
            </>
          )}
          {isFinal && (
            <span className="text-[10px] font-semibold text-green-600 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded">
              ✓ Hoàn thành
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlowCard;
