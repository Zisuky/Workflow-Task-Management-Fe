import { useState, useMemo, useEffect, useCallback } from 'react';
import { jobService } from '../../services/job.service';
import type { Job } from '../../models';
interface TimelineTask {
    id: string;
    memberName: string;
    taskName: string;
    fullTaskName: string;
    status: string;
    startDate: Date;
    endDate: Date;
    color: string;
}
type ViewMode = '15min' | 'day' | 'week';
const TimelinePage: React.FC = () => {
    const [viewMode, setViewMode] = useState<ViewMode>('day');
    const [jobs, setJobs] = useState<Job[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const parseCustomDate = (dateString: string): Date | null => {
        if (!dateString) return null;
        const parts = dateString.split(' ');
        const dateParts = parts[0].split('/');
        if (dateParts.length !== 3) return null;
        const day = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10) - 1; // 0-indexed month
        const year = parseInt(dateParts[2], 10);
        let hours = 0;
        let minutes = 0;
        if (parts[1]) {
            const timeParts = parts[1].split(':');
            hours = parseInt(timeParts[0], 10);
            minutes = parseInt(timeParts[1], 10);
        }
        const date = new Date(year, month, day, hours, minutes);
        return isNaN(date.getTime()) ? null : date;
    };
    const loadJobs = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await jobService.getJobs();
            setJobs(data);
        } catch (error) {
            console.error('Failed to load jobs:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);
    useEffect(() => {
        loadJobs();
    }, [loadJobs]);
    const timelineTasks = useMemo(() => {
        return jobs.map(job => {
            const startDate = parseCustomDate(job.startDate) || new Date();
            const endDate = parseCustomDate(job.endDate) || new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
            let color = '#F79E61'; // Orange for In Progress
            if (job.status === 'To Do') color = '#3B82F6'; // Blue
            if (job.status === 'Done') color = '#10B981'; // Green
            if (job.status === 'In Review') color = '#8B5CF6'; // Purple
            if (job.status === 'Blocked') color = '#EF4444'; // Red
            return {
                id: job.id,
                memberName: job.assignee,
                taskName: 'Công việc được giao...',
                fullTaskName: job.name,
                status: job.status,
                startDate,
                endDate,
                color,
            };
        });
    }, [jobs]);
    const { dateColumns, columnWidth, timelineStartDate } = useMemo(() => {
        let anchorDate = new Date(2025, 10, 20); // Nov 20, 2025 (matching mock data start)
        if (jobs.length > 0) {
            const jobDates = jobs.map(j => parseCustomDate(j.startDate)).filter(d => d !== null) as Date[];
            if (jobDates.length > 0) {
                anchorDate = new Date(Math.min(...jobDates.map(d => d.getTime())));
                anchorDate.setHours(0, 0, 0, 0);
            }
        }
        const columns: Date[] = [];
        let width = 120;
        if (viewMode === 'day') {
            width = 120;
            for (let i = 0; i < 14; i++) {
                const date = new Date(anchorDate);
                date.setDate(anchorDate.getDate() + i);
                columns.push(date);
            }
        } else if (viewMode === 'week') {
            width = 200;
            for (let i = 0; i < 8; i++) {
                const date = new Date(anchorDate);
                date.setDate(anchorDate.getDate() + i * 7);
                columns.push(date);
            }
        } else {
            width = 80;
            for (let i = 0; i < 24; i++) {
                const date = new Date(anchorDate);
                date.setHours(anchorDate.getHours() + i);
                columns.push(date);
            }
        }
        return { dateColumns: columns, columnWidth: width, timelineStartDate: anchorDate };
    }, [viewMode, jobs]);
    const formatDateHeader = (date: Date) => {
        if (viewMode === '15min') {
            return `${date.getHours().toString().padStart(2, '0')}:00`;
        }
        return `${date.getDate()}/${date.getMonth() + 1}`;
    };
    const calculateBarPosition = (task: TimelineTask) => {
        const msPerDay = 24 * 60 * 60 * 1000;
        const msPerHour = 60 * 60 * 1000;
        let diffMs = task.startDate.getTime() - timelineStartDate.getTime();
        let durationMs = task.endDate.getTime() - task.startDate.getTime();
        if (viewMode === 'day' || viewMode === 'week') {
            const left = (diffMs / msPerDay) * columnWidth;
            const width = (durationMs / msPerDay) * columnWidth;
            return { left, width };
        } else {
            const left = (diffMs / msPerHour) * columnWidth;
            const width = (durationMs / msPerHour) * columnWidth;
            return { left, width };
        }
    };
    const getStatusBadge = (status: string) => {
        const baseClasses = "px-3 py-1 rounded-md text-[11px] font-bold whitespace-nowrap uppercase tracking-wider shadow-sm";
        switch (status) {
            case 'In Progress':
                return <span className={`${baseClasses} bg-orange-500 text-white`}>In Progress</span>;
            case 'To Do':
                return <span className={`${baseClasses} bg-blue-500 text-white`}>To Do</span>;
            case 'Done':
                return <span className={`${baseClasses} bg-green-500 text-white`}>Done</span>;
            case 'In Review':
                return <span className={`${baseClasses} bg-purple-500 text-white`}>In Review</span>;
            case 'Blocked':
                return <span className={`${baseClasses} bg-red-500 text-white`}>Blocked</span>;
            default:
                return <span className={`${baseClasses} bg-gray-500 text-white`}>{status}</span>;
        }
    };
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }
    return (
        <div className="animate-fadeIn pt-1 px-2 pb-4 md:pt-2 md:px-4 md:pb-4">
            {/* View Mode Toggle */}
            <div className="flex justify-end mb-3">
                <div className="flex items-center bg-gray-100 rounded-lg p-1 border border-gray-200">
                    {(['15min', 'day', 'week'] as ViewMode[]).map((mode) => (
                        <button
                            key={mode}
                            onClick={() => setViewMode(mode)}
                            className={`px-5 py-2 rounded-md text-xs font-bold transition-all ${viewMode === mode
                                ? 'bg-white text-gray-900 shadow-md ring-1 ring-gray-200/50'
                                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200/50'
                                }`}
                        >
                            {mode === '15min' ? '15 phút' : mode === 'day' ? 'Ngày' : 'Tuần'}
                        </button>
                    ))}
                </div>
            </div>
            {/* Timeline Grid */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full border-collapse" style={{ minWidth: `${450 + dateColumns.length * columnWidth}px` }}>
                        {/* Header Row */}
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="text-left px-6 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest w-[160px] sticky left-0 bg-white z-20 border-b border-gray-100 shadow-[2px_0_10px_-4px_rgba(0,0,0,0.05)]">
                                    Thành viên
                                </th>
                                <th className="text-left px-6 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest w-[180px] sticky left-[160px] bg-white z-20 border-b border-gray-100 shadow-[2px_0_10px_-4px_rgba(0,0,0,0.05)]">
                                    Nhiệm vụ
                                </th>
                                <th className="text-left px-6 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest w-[110px] sticky left-[340px] bg-white z-20 border-b border-gray-100 border-r border-gray-100 shadow-[2px_0_10px_-4px_rgba(0,0,0,0.05)]">
                                    Trạng thái
                                </th>
                                {dateColumns.map((date, index) => (
                                    <th
                                        key={index}
                                        className="text-center px-2 py-5 text-sm font-semibold text-gray-500 border-b border-l border-gray-50"
                                        style={{ width: `${columnWidth}px`, minWidth: `${columnWidth}px` }}
                                    >
                                        <span className="opacity-80 font-medium">{formatDateHeader(date)}</span>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        {/* Body Rows */}
                        <tbody className="divide-y divide-gray-50">
                            {timelineTasks.map((task) => {
                                const { left, width } = calculateBarPosition(task);
                                return (
                                    <tr key={task.id} className="group hover:bg-gray-50/30 transition-colors">
                                        <td className="px-6 py-6 text-sm font-bold text-gray-800 sticky left-0 bg-white z-10 group-hover:bg-gray-50/30 transition-colors shadow-[2px_0_10px_-4px_rgba(0,0,0,0.05)]">
                                            {task.memberName}
                                        </td>
                                        <td className="px-6 py-6 text-sm text-gray-600 sticky left-[160px] bg-white z-10 group-hover:bg-gray-50/30 transition-colors shadow-[2px_0_10px_-4px_rgba(0,0,0,0.05)]">
                                            <div className="truncate max-w-[150px]" title={task.taskName}>
                                                {task.taskName}
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 sticky left-[340px] bg-white z-10 border-r border-gray-100 group-hover:bg-gray-50/30 transition-colors shadow-[2px_0_10px_-4px_rgba(0,0,0,0.05)] text-center">
                                            {getStatusBadge(task.status)}
                                        </td>
                                        <td
                                            colSpan={dateColumns.length}
                                            className="p-0 relative h-20 bg-transparent overflow-hidden"
                                        >
                                            {/* Grid vertical lines */}
                                            <div className="absolute inset-0 flex pointer-events-none">
                                                {dateColumns.map((_, index) => (
                                                    <div
                                                        key={index}
                                                        className="border-l border-gray-50 h-full flex-shrink-0"
                                                        style={{ width: `${columnWidth}px` }}
                                                    />
                                                ))}
                                            </div>
                                            {/* Task Bar */}
                                            {left >= 0 && (
                                                <div
                                                    className="absolute top-1/2 -translate-y-1/2 h-9 rounded-xl flex items-center justify-center text-white text-[11px] font-bold px-4 cursor-pointer hover:brightness-105 active:scale-[0.98] transition-all shadow-lg hover:shadow-xl z-10"
                                                    style={{
                                                        left: `${left + 4}px`,
                                                        width: `${Math.max(width - 8, 40)}px`,
                                                        backgroundColor: task.color,
                                                        border: `2px solid rgba(255,255,255,0.2)`
                                                    }}
                                                    title={task.fullTaskName}
                                                >
                                                    <span className="truncate drop-shadow-sm">{task.fullTaskName}</span>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    height: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
            `}</style>
        </div>
    );
};
export default TimelinePage;
