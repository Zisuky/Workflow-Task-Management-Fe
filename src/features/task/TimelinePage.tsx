import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { taskRepository as taskService } from '../task/infrastructure/task.repository';
import { projectApi, type ProjectResponse } from '../task/infrastructure/project.client';
import type { Task } from '../../shared/types/task';

type ViewMode = 'day' | 'month' | 'year';

// ── Date parser: ISO + DD/MM/YYYY ──
const parseDate = (dateString: string): Date | null => {
    if (!dateString) return null;
    if (dateString.includes('T') || /^\d{4}-\d{2}-\d{2}/.test(dateString)) {
        const d = new Date(dateString);
        return isNaN(d.getTime()) ? null : d;
    }
    const parts = dateString.split(' ');
    const dateParts = parts[0].split('/');
    if (dateParts.length !== 3) return null;
    const day = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1;
    const year = parseInt(dateParts[2], 10);
    let hours = 0, minutes = 0;
    if (parts[1]) {
        const timeParts = parts[1].split(':');
        hours = parseInt(timeParts[0], 10) || 0;
        minutes = parseInt(timeParts[1], 10) || 0;
    }
    const d = new Date(year, month, day, hours, minutes);
    return isNaN(d.getTime()) ? null : d;
};

// ── Helpers ──
const daysBetween = (a: Date, b: Date): number =>
    (b.getTime() - a.getTime()) / (86400000);
const daysInMonth = (d: Date): number =>
    new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
const monthsBetween = (a: Date, b: Date): number =>
    (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth()) + (b.getDate() - 1) / daysInMonth(b);
const yearsBetween = (a: Date, b: Date): number => {
    const diffYears = b.getFullYear() - a.getFullYear();
    const soy = new Date(b.getFullYear(), 0, 1);
    const eoy = new Date(b.getFullYear() + 1, 0, 1);
    return diffYears + (b.getTime() - soy.getTime()) / (eoy.getTime() - soy.getTime());
};

// ── Status gradient themes ──
const STATUS_THEME: Record<string, { from: string; to: string; badge: string }> = {
    'In Progress': { from: '#F59E0B', to: '#F97316', badge: 'bg-gradient-to-r from-amber-400 to-orange-500 text-white' },
    'To Do': { from: '#3B82F6', to: '#6366F1', badge: 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white' },
    'Done': { from: '#10B981', to: '#059669', badge: 'bg-gradient-to-r from-emerald-400 to-green-600 text-white' },
    'In Review': { from: '#8B5CF6', to: '#7C3AED', badge: 'bg-gradient-to-r from-violet-400 to-purple-600 text-white' },
    'Blocked': { from: '#EF4444', to: '#DC2626', badge: 'bg-gradient-to-r from-red-400 to-rose-600 text-white' },
    'default': { from: '#6B7280', to: '#4B5563', badge: 'bg-gradient-to-r from-gray-400 to-gray-600 text-white' },
};
const getTheme = (status: string) => STATUS_THEME[status] || STATUS_THEME['default'];

// ── Project row colors ──
const PROJECT_DOTS = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500', 'bg-teal-500'];

interface ParsedTask {
    id: string;
    name: string;
    status: string;
    assignee: string;
    startDate: Date;
    endDate: Date;
    gradientFrom: string;
    gradientTo: string;
}

interface ProjectRow {
    project: ProjectResponse;
    tasks: ParsedTask[];
    isExpanded: boolean;
}

const TASK_BAR_HEIGHT = 28;
const TASK_BAR_GAP = 4;
const ROW_PADDING_Y = 12;

const TimelinePage: React.FC = () => {
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState<ViewMode>('day');
    const [customWidth, setCustomWidth] = useState<number>(120);
    const [projects, setProjects] = useState<ProjectResponse[]>([]);
    const [projectTasks, setProjectTasks] = useState<Map<string, Task[]>>(new Map());
    const [isLoading, setIsLoading] = useState(true);
    const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());

    // Load all projects, then tasks per project
    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const projectsRes = await projectApi.getAll();
            const allProjects: ProjectResponse[] = projectsRes.data?.content ?? projectsRes.data ?? [];
            setProjects(allProjects);

            // Expand all by default
            setExpandedProjects(new Set(allProjects.map(p => p.id)));

            // Load tasks for each project in parallel
            const taskMap = new Map<string, Task[]>();
            await Promise.all(
                allProjects.map(async (proj) => {
                    try {
                        const tasks = await taskService.getTasksByProject(proj.id);
                        taskMap.set(proj.id, tasks);
                    } catch {
                        taskMap.set(proj.id, []);
                    }
                })
            );
            setProjectTasks(taskMap);
        } catch (error) {
            console.error('Failed to load timeline data:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    useEffect(() => {
        if (viewMode === 'day') setCustomWidth(120);
        else if (viewMode === 'month') setCustomWidth(160);
        else setCustomWidth(200);
    }, [viewMode]);

    const toggleProject = (projectId: string) => {
        setExpandedProjects(prev => {
            const next = new Set(prev);
            if (next.has(projectId)) next.delete(projectId);
            else next.add(projectId);
            return next;
        });
    };

    // ── Build project rows ──
    const projectRows: ProjectRow[] = useMemo(() => {
        return projects.map(proj => {
            const rawTasks = projectTasks.get(proj.id) || [];
            const tasks: ParsedTask[] = rawTasks.map(t => {
                const startDate = parseDate(t.startDate) || new Date(2026, 4, 1);
                const endDate = parseDate(t.endDate) || new Date(startDate.getTime() + 86400000);
                const theme = getTheme(t.status);
                return {
                    id: t.id,
                    name: t.name,
                    status: t.status,
                    assignee: t.assignee || 'Chưa có',
                    startDate,
                    endDate,
                    gradientFrom: theme.from,
                    gradientTo: theme.to,
                };
            });
            return {
                project: proj,
                tasks,
                isExpanded: expandedProjects.has(proj.id),
            };
        });
    }, [projects, projectTasks, expandedProjects]);

    // ── Generate columns ──
    const { dateColumns, columnWidth, timelineStartDate } = useMemo(() => {
        const anchor = new Date(2026, 4, 1);
        anchor.setHours(0, 0, 0, 0);
        const columns: { date: Date; label: string; subLabel?: string }[] = [];

        if (viewMode === 'day') {
            for (let i = 0; i < 30; i++) {
                const d = new Date(anchor);
                d.setDate(anchor.getDate() + i);
                const weekday = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][d.getDay()];
                columns.push({ date: d, label: `${d.getDate()}`, subLabel: weekday });
            }
        } else if (viewMode === 'month') {
            const monthNames = ['Th.1', 'Th.2', 'Th.3', 'Th.4', 'Th.5', 'Th.6', 'Th.7', 'Th.8', 'Th.9', 'Th.10', 'Th.11', 'Th.12'];
            for (let i = 0; i < 12; i++) {
                const d = new Date(anchor.getFullYear(), anchor.getMonth() + i, 1);
                columns.push({ date: d, label: monthNames[d.getMonth()], subLabel: `${d.getFullYear()}` });
            }
        } else {
            for (let i = 0; i < 5; i++) {
                const d = new Date(anchor.getFullYear() + i, 0, 1);
                columns.push({ date: d, label: `${d.getFullYear()}` });
            }
        }
        return { dateColumns: columns, columnWidth: customWidth, timelineStartDate: anchor };
    }, [viewMode, customWidth]);

    // ── Bar position calc ──
    const calcBar = (task: ParsedTask) => {
        let left: number, width: number;
        if (viewMode === 'day') {
            const sd = daysBetween(timelineStartDate, task.startDate);
            const dur = Math.max(daysBetween(task.startDate, task.endDate), 0.5);
            left = sd * columnWidth;
            width = dur * columnWidth;
        } else if (viewMode === 'month') {
            const sd = monthsBetween(timelineStartDate, task.startDate);
            const ed = monthsBetween(timelineStartDate, task.endDate);
            left = sd * columnWidth;
            width = Math.max((ed - sd) * columnWidth, columnWidth * 0.3);
        } else {
            const sd = yearsBetween(timelineStartDate, task.startDate);
            const ed = yearsBetween(timelineStartDate, task.endDate);
            left = sd * columnWidth;
            width = Math.max((ed - sd) * columnWidth, columnWidth * 0.2);
        }
        return { left, width: Math.max(width, 40) };
    };

    const isToday = (d: Date) => {
        const now = new Date();
        return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
                <div className="w-14 h-14 rounded-full border-4 border-orange-100 border-t-orange-500 animate-spin"></div>
                <span className="text-sm text-gray-400 font-medium">Đang tải timeline...</span>
            </div>
        );
    }

    const totalTimelineWidth = dateColumns.length * columnWidth;
    const stickyColWidth = 280;

    return (
        <div className="animate-fadeIn pt-1 px-2 pb-4 md:pt-2 md:px-4 md:pb-4">
            {/* ── Toolbar ── */}
            <div className="flex justify-between items-center mb-4 gap-4 flex-wrap relative z-0">
                {/* Left: title + count */}
                <div className="flex items-center gap-3">
                    <h2 className="text-lg font-bold text-gray-800">Timeline</h2>
                    <div className="px-3 py-1 rounded-full bg-orange-50 border border-orange-100">
                        <span className="text-xs font-bold text-orange-600">
                            {projects.length} dự án • {projectRows.reduce((s, r) => s + r.tasks.length, 0)} công việc
                        </span>
                    </div>
                </div>
                {/* Right: controls */}
                <div className="flex items-center gap-3">
                    {/* Column width */}
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-sm">
                        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                        <input
                            type="range" min="60" max="300" value={customWidth}
                            onChange={(e) => setCustomWidth(Number(e.target.value))}
                            className="timeline-slider w-16 h-1 bg-gray-200 rounded-full appearance-none cursor-pointer"
                        />
                        <span className="text-[10px] font-mono text-gray-400 w-6 text-right">{customWidth}</span>
                    </div>
                    {/* View mode */}
                    <div className="flex items-center bg-white rounded-xl p-1 border border-gray-200 shadow-sm">
                        {(['day', 'month', 'year'] as ViewMode[]).map((mode) => (
                            <button
                                key={mode}
                                onClick={() => setViewMode(mode)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${viewMode === mode
                                    ? 'bg-gradient-to-r from-orange-400 to-amber-500 text-white shadow-md shadow-orange-200/50'
                                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                                    }`}
                            >
                                {mode === 'day' ? 'Ngày' : mode === 'month' ? 'Tháng' : 'Năm'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Timeline Grid ── */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto timeline-scrollbar">
                    <div className="relative" style={{ minWidth: `${stickyColWidth + totalTimelineWidth}px` }}>
                        {/* ── HEADER ── */}
                        <div className="flex border-b-2 border-gray-100 bg-gray-50/80">
                            {/* Sticky project col header */}
                            <div
                                className="sticky left-0 z-30 bg-gray-50 border-r border-gray-200 flex items-center px-5 py-3"
                                style={{ width: `${stickyColWidth}px`, minWidth: `${stickyColWidth}px` }}
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-4 rounded-full bg-orange-400"></div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Dự án</span>
                                </div>
                            </div>
                            {/* Date columns */}
                            <div className="flex flex-1">
                                {dateColumns.map((col, i) => {
                                    const today = isToday(col.date);
                                    const isWeekend = viewMode === 'day' && (col.date.getDay() === 0 || col.date.getDay() === 6);
                                    return (
                                        <div
                                            key={i}
                                            className={`flex-shrink-0 text-center py-3 border-l ${today ? 'bg-orange-50 border-orange-200' : isWeekend ? 'bg-gray-50/50 border-gray-100' : 'border-gray-100'}`}
                                            style={{ width: `${columnWidth}px`, minWidth: `${columnWidth}px` }}
                                        >
                                            <div className={`text-sm font-bold ${today ? 'text-orange-600' : 'text-gray-700'}`}>{col.label}</div>
                                            {col.subLabel && (
                                                <div className={`text-[10px] font-medium mt-0.5 ${today ? 'text-orange-400' : isWeekend ? 'text-red-300' : 'text-gray-300'}`}>{col.subLabel}</div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ── BODY: Project rows ── */}
                        {projectRows.length === 0 && (
                            <div className="text-center py-20 text-gray-400 text-sm">Chưa có dự án nào</div>
                        )}
                        {projectRows.map((row, projIndex) => {
                            const taskCount = row.tasks.length;
                            const isExpanded = row.isExpanded;
                            const dotColor = PROJECT_DOTS[projIndex % PROJECT_DOTS.length];
                            // Row height when expanded: enough for stacked bars
                            const expandedHeight = Math.max(
                                60,
                                taskCount * (TASK_BAR_HEIGHT + TASK_BAR_GAP) + ROW_PADDING_Y * 2
                            );
                            const rowHeight = isExpanded ? expandedHeight : 52;

                            return (
                                <div
                                    key={row.project.id}
                                    className={`flex border-b border-gray-100 transition-all duration-200 ${projIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'} hover:bg-orange-50/20`}
                                    style={{ height: `${rowHeight}px` }}
                                >
                                    {/* ── Sticky project info ── */}
                                    <div
                                        className={`sticky left-0 z-20 border-r border-gray-200 flex items-start px-4 pt-3 ${projIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'} hover:bg-orange-50/20 transition-colors`}
                                        style={{ width: `${stickyColWidth}px`, minWidth: `${stickyColWidth}px` }}
                                    >
                                        <div className="flex items-start gap-3 w-full">
                                            {/* Expand toggle */}
                                            <button
                                                onClick={() => toggleProject(row.project.id)}
                                                className="mt-0.5 flex-shrink-0 w-5 h-5 rounded flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
                                            >
                                                <svg
                                                    className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                                                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                                                >
                                                    <path d="M9 5l7 7-7 7" />
                                                </svg>
                                            </button>
                                            {/* Project info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className={`w-2.5 h-2.5 rounded-full ${dotColor} flex-shrink-0`}></div>
                                                    <span className="text-sm font-bold text-gray-800 truncate" title={row.project.name}>
                                                        {row.project.name}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${taskCount > 0
                                                        ? 'bg-blue-50 text-blue-600 border border-blue-100'
                                                        : 'bg-gray-50 text-gray-400 border border-gray-100'
                                                        }`}>
                                                        {taskCount} việc
                                                    </span>
                                                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${row.project.status === 'ACTIVE'
                                                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                                        : 'bg-gray-50 text-gray-400 border border-gray-100'
                                                        }`}>
                                                        {row.project.status === 'ACTIVE' ? 'Hoạt động' : row.project.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ── Timeline area ── */}
                                    <div className="flex-1 relative overflow-hidden">
                                        {/* Grid lines */}
                                        <div className="absolute inset-0 flex pointer-events-none">
                                            {dateColumns.map((col, i) => {
                                                const today = isToday(col.date);
                                                const isWeekend = viewMode === 'day' && (col.date.getDay() === 0 || col.date.getDay() === 6);
                                                return (
                                                    <div
                                                        key={i}
                                                        className={`h-full flex-shrink-0 border-l ${today ? 'border-orange-200 bg-orange-50/20' : isWeekend ? 'border-gray-100 bg-gray-50/30' : 'border-gray-50'}`}
                                                        style={{ width: `${columnWidth}px` }}
                                                    />
                                                );
                                            })}
                                        </div>

                                        {/* Task bars — stacked vertically */}
                                        {isExpanded && row.tasks.map((task, taskIndex) => {
                                            const { left, width } = calcBar(task);
                                            const top = ROW_PADDING_Y + taskIndex * (TASK_BAR_HEIGHT + TASK_BAR_GAP);
                                            return (
                                                <div
                                                    key={task.id}
                                                    onClick={() => navigate(`/task/${task.id}`)}
                                                    className="absolute rounded-md flex items-center text-white text-[10px] font-semibold px-2.5 cursor-pointer transition-all duration-150 shadow-sm hover:shadow-md hover:brightness-110 hover:scale-y-105 active:scale-95"
                                                    style={{
                                                        left: `${left}px`,
                                                        top: `${top}px`,
                                                        width: `${Math.max(width, 40)}px`,
                                                        height: `${TASK_BAR_HEIGHT}px`,
                                                        background: `linear-gradient(135deg, ${task.gradientFrom}, ${task.gradientTo})`,
                                                        border: '1px solid rgba(255,255,255,0.25)',
                                                        zIndex: 5,
                                                    }}
                                                    title={`${task.name} — ${task.assignee} — Click để xem chi tiết`}
                                                >
                                                    <span className="truncate drop-shadow-sm">{task.name}</span>
                                                </div>
                                            );
                                        })}

                                        {/* Collapsed: show summary line */}
                                        {!isExpanded && taskCount > 0 && (
                                            <div
                                                className="absolute top-1/2 -translate-y-1/2 h-2 rounded-full bg-gray-200/80"
                                                style={{
                                                    left: '8px',
                                                    width: `${Math.min(taskCount * 30, totalTimelineWidth - 16)}px`,
                                                    zIndex: 2,
                                                }}
                                            />
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <style>{`
                .timeline-scrollbar::-webkit-scrollbar { height: 6px; }
                .timeline-scrollbar::-webkit-scrollbar-track { background: transparent; border-radius: 10px; margin: 0 12px; }
                .timeline-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .timeline-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
                .timeline-slider::-webkit-slider-thumb {
                    -webkit-appearance: none; appearance: none;
                    width: 12px; height: 12px; border-radius: 50%;
                    background: #f97316; border: 2px solid white;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.15); cursor: pointer;
                }
            `}</style>
        </div>
    );
};

export default TimelinePage;
