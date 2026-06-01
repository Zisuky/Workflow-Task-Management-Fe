import React, { useState, useCallback, useEffect } from 'react';
import type { Task } from '../../../shared/types/task';
import { taskApi, type TaskResponse } from '../../task/infrastructure/task.client';
import { userApi } from '../../user/infrastructure/user.api';
import { useToast } from '../../../ui/toast/useToast';

// ─── Types ────────────────────────────────────────────────────────────────────
interface SubtaskColumn {
  id: string;       // TaskStatus.id
  code: string;     // e.g. TO_DO
  name: string;     // e.g. "To Do"
  sortOrder: number;
}

interface SubtaskSummary {
  total: number;
  byStatus: Record<string, number>;
}

interface SubtaskBoardProps {
  /** The parent task being drilled into */
  parentTask: Task;
  /** Project name for breadcrumb */
  projectName: string;
  /** Called when user clicks "Quay lại" to go back to Level 1 */
  onBack: () => void;
}

// ─── Priority badge ───────────────────────────────────────────────────────────
const priorityConfig: Record<string, { bg: string; text: string; label: string }> = {
  Low:     { bg: '#E5E7EB', text: '#374151', label: 'Thấp' },
  Medium:  { bg: '#DBEAFE', text: '#1D4ED8', label: 'Trung bình' },
  High:    { bg: '#FEF3C7', text: '#D97706', label: 'Cao' },
  Highest: { bg: '#FEE2E2', text: '#B91C1C', label: 'Cao nhất' },
};

const getInitials = (name: string): string => {
  if (!name) return '?';
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

// ─── Subtask Card ─────────────────────────────────────────────────────────────
interface SubtaskCardProps {
  subtask: Task;
  onDragStart: (e: React.DragEvent, id: string) => void;
}

const SubtaskCard: React.FC<SubtaskCardProps> = ({ subtask, onDragStart }) => {
  const priority = priorityConfig[subtask.priority] ?? priorityConfig['Medium'];
  return (
    <div
      draggable
      onDragStart={e => onDragStart(e, subtask.id)}
      className="bg-white rounded-lg border border-gray-100 shadow-sm p-3 mb-2 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <h4 className="text-sm font-medium text-gray-800 leading-snug">{subtask.name}</h4>
        <span
          className="text-[10px] font-semibold px-1.5 py-0.5 rounded flex-shrink-0"
          style={{ backgroundColor: priority.bg, color: priority.text }}
        >
          {priority.label}
        </span>
      </div>
      {subtask.assignee && subtask.assignee !== 'Chưa có' && (
        <div className="flex items-center gap-1.5 mt-2">
          <div
            className="w-5 h-5 rounded-full bg-orange-400 text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0"
            title={subtask.assignee}
          >
            {getInitials(subtask.assignee)}
          </div>
          <span className="text-xs text-gray-500 truncate">{subtask.assignee}</span>
        </div>
      )}
    </div>
  );
};

// ─── Column ───────────────────────────────────────────────────────────────────
const COLUMN_COLORS: Record<string, string> = {
  TO_DO:       '#FEF3C7',
  IN_PROGRESS: '#DBEAFE',
  PAUSED:      '#FED7AA',
  DONE:        '#D1FAE5',
};

interface SubtaskColumnViewProps {
  column: SubtaskColumn;
  subtasks: Task[];
  wipTotal: number;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDrop: (e: React.DragEvent, columnId: string) => void;
}

const SubtaskColumnView: React.FC<SubtaskColumnViewProps> = ({
  column, subtasks, wipTotal, onDragStart, onDrop,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const color = COLUMN_COLORS[column.code] ?? '#F3F4F6';
  const count = subtasks.length;

  return (
    <div
      className={`flex-shrink-0 w-[280px] flex flex-col rounded-xl overflow-hidden border ${
        isDragOver ? 'border-orange-400 shadow-md' : 'border-gray-100'
      } bg-white`}
      onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragOver(false); }}
      onDrop={e => { setIsDragOver(false); onDrop(e, column.id); }}
    >
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between" style={{ backgroundColor: color }}>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">{column.name}</span>
          <span className="text-xs font-semibold text-gray-500">
            {count}{wipTotal > 0 ? `/${wipTotal}` : ''}
          </span>
        </div>
        <span className="text-gray-400 text-sm">⋮</span>
      </div>

      {/* Cards */}
      <div className={`flex-1 p-3 min-h-[120px] ${isDragOver ? 'bg-orange-50/40' : ''}`}>
        {subtasks.map(st => (
          <SubtaskCard key={st.id} subtask={st} onDragStart={onDragStart} />
        ))}
        {subtasks.length === 0 && (
          <div className={`flex items-center justify-center h-20 text-xs rounded-lg border-2 border-dashed ${
            isDragOver ? 'border-orange-400 text-orange-500 font-semibold' : 'border-gray-200 text-gray-400'
          }`}>
            {isDragOver ? '⬇ Thả vào đây' : 'Kéo thả task vào đây'}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main SubtaskBoard ────────────────────────────────────────────────────────
const SubtaskBoard: React.FC<SubtaskBoardProps> = ({ parentTask, projectName, onBack }) => {
  const [columns, setColumns]       = useState<SubtaskColumn[]>([]);
  const [subtasks, setSubtasks]     = useState<Task[]>([]);
  const [summary, setSummary]       = useState<SubtaskSummary | null>(null);
  const [isLoading, setIsLoading]   = useState(true);
  const [draggedId, setDraggedId]   = useState<string | null>(null);
  const toast                       = useToast();

  // ── Load columns + subtasks + summary ──────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [colsRes, subtasksRes, summaryRes] = await Promise.all([
          taskApi.getSubtaskWorkflowStatuses(),
          taskApi.getSubtasks(parentTask.id),
          taskApi.getSubtaskSummary(parentTask.id),
        ]);

        // Parse columns
        const rawCols = (colsRes as any)?.data ?? colsRes ?? [];
        const parsedCols: SubtaskColumn[] = (rawCols as Array<{
          id: string; code: string; name: string; sortOrder: number | null;
        }>).map((c, i) => ({
          id: c.id,
          code: c.code,
          name: c.name,
          sortOrder: c.sortOrder ?? i,
        })).sort((a, b) => a.sortOrder - b.sortOrder);
        setColumns(parsedCols);

        // Parse subtasks — resolve assignee names
        const rawSubs: TaskResponse[] = (subtasksRes as { data?: TaskResponse[] })?.data ?? [];
        const mappedSubs = await Promise.all(rawSubs.map(async (t) => {
          let assigneeName = '';
          try {
            const membersRes = await taskApi.getMembers(t.id);
            const members: Array<{ userId: string }> = (membersRes as { data?: Array<{ userId: string }> })?.data ?? [];
            if (members.length > 0) {
              const user = await userApi.getById(members[0].userId);
              assigneeName = user?.name ?? '';
            }
          } catch { /* ignore */ }

          return {
            id: t.id,
            code: t.code ?? t.id.substring(0, 6).toUpperCase(),
            name: t.name,
            group: 'Backend' as const,
            status: '',
            priority: 'Medium' as const,
            manager: '',
            assignee: assigneeName,
            startDate: t.startDate ?? '',
            endDate: t.endDate ?? '',
            statusId: t.statusId,
            priorityId: t.priorityId,
            projectId: t.projectId,
            taskGroupId: t.taskGroupId,
            isPinned: t.isPinned,
            parentTaskId: t.parentTaskId,
          } satisfies Task;
        }));
        setSubtasks(mappedSubs);

        // Parse summary
        const rawSummary = (summaryRes as { data?: SubtaskSummary })?.data ?? null;
        setSummary(rawSummary);

      } catch {
        toast.error('Không thể tải subtasks');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [parentTask.id]);

  // ── Drag handlers ──────────────────────────────────────────────────────────
  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    if (!draggedId) return;

    const targetCol = columns.find(c => c.id === targetColumnId);
    if (!targetCol) return;

    const subtask = subtasks.find(s => s.id === draggedId);
    if (!subtask || subtask.statusId === targetCol.id) { setDraggedId(null); return; }

    // Optimistic update
    const prev = subtasks;
    setSubtasks(s => s.map(st => st.id === draggedId ? { ...st, statusId: targetCol.id } : st));
    setDraggedId(null);

    try {
      await taskApi.updateStatus(draggedId, targetCol.id);
      // Refresh summary
      const summaryRes = await taskApi.getSubtaskSummary(parentTask.id);
      const rawSummary = (summaryRes as { data?: SubtaskSummary })?.data ?? null;
      setSummary(rawSummary);

      if (targetCol.code === 'DONE') {
        toast.success(`✅ Subtask chuyển sang "${targetCol.name}"`);
      } else {
        toast.success(`Đã chuyển sang "${targetCol.name}"`);
      }
    } catch (err: unknown) {
      setSubtasks(prev);
      const axiosErr = err as { response?: { status?: number; data?: { message?: string } } };
      const msg = axiosErr?.response?.data?.message ?? 'Cập nhật trạng thái thất bại';
      toast.error(msg);
    }
  }, [draggedId, columns, subtasks, parentTask.id, toast]);

  // ── Render ─────────────────────────────────────────────────────────────────
  const noSubtasks = !isLoading && subtasks.length === 0;

  return (
    <div className="flex flex-col h-full">
      {/* Breadcrumb */}
      <div className="px-4 pt-2 pb-1 flex items-center gap-1.5 text-sm">
        <button onClick={onBack} className="text-gray-500 hover:text-[#F79E61] transition-colors">
          Tất cả
        </button>
        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <button onClick={onBack} className="text-gray-500 hover:text-[#F79E61] transition-colors">
          {projectName}
        </button>
        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="font-semibold text-[#F79E61] truncate max-w-[200px]">{parentTask.name}</span>
      </div>

      {/* Task banner */}
      <div className="mx-4 mt-1 mb-2 px-4 py-3 bg-white border border-gray-100 rounded-xl shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 h-8 px-3 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors flex-shrink-0 mt-0.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Quay lại
            </button>
            <div>
              <h2 className="font-bold text-gray-800 text-base leading-tight">{parentTask.name}</h2>
              {parentTask.description && (
                <p className="text-xs text-gray-500 mt-0.5">{parentTask.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 flex-shrink-0 text-sm">
            {/* Project badge */}
            <div className="flex items-center gap-1.5 text-gray-600">
              <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
              </svg>
              <span className="font-medium">{projectName}</span>
            </div>

            {/* Manager */}
            {parentTask.manager && parentTask.manager !== 'Chưa có' && (
              <div className="flex items-center gap-1.5 text-gray-600">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>{parentTask.manager}</span>
              </div>
            )}

            {/* Status badge */}
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
              🔄 Đang thực hiện
            </span>

            {/* Summary pill */}
            {summary && summary.total > 0 && (
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                {summary.byStatus['DONE'] ?? 0}/{summary.total} subtasks done
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Board */}
      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-10 h-10 border-4 border-orange-200 rounded-full animate-spin border-t-[#F79E61]" />
        </div>
      ) : noSubtasks ? (
        <div className="mx-4 mt-2 px-6 py-8 bg-green-50 border border-green-200 rounded-xl text-center">
          <div className="text-2xl mb-2">✅</div>
          <p className="text-sm font-semibold text-green-700">Task này không có subtask</p>
          <p className="text-xs text-green-600 mt-1">Mặc định task đã ở trạng thái hoàn thành</p>
        </div>
      ) : (
        <div className="flex gap-4 px-4 pt-2 pb-4 overflow-x-auto flex-1">
          {columns.map(col => (
            <SubtaskColumnView
              key={col.id}
              column={col}
              subtasks={subtasks.filter(s => s.statusId === col.id)}
              wipTotal={summary?.total ?? 0}
              onDragStart={handleDragStart}
              onDrop={handleDrop}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SubtaskBoard;
