import React from 'react';
import type { Task } from '../../../data/workflow.data';

interface FlowCardProps {
    task: Task;
    onDragStart: (e: React.DragEvent, taskId: string) => void;
}

// Priority styles
const priorityStyles: Record<Task['priority'], { bg: string; text: string; label: string }> = {
    low: { bg: '#E5E7EB', text: '#374151', label: 'Thấp' },
    medium: { bg: '#DBEAFE', text: '#1D4ED8', label: 'Trung bình' },
    high: { bg: '#FEF3C7', text: '#D97706', label: 'Cao' },
    urgent: { bg: '#FEE2E2', text: '#DC2626', label: 'Khẩn cấp' },
};

// Calculate blocked duration
const getBlockedDuration = (blockedSince: string): string => {
    const since = new Date(blockedSince);
    const now = new Date();
    const diffMs = now.getTime() - since.getTime();

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) {
        return `${days}n ${hours}g`;
    }
    return `${hours}g`;
};

// Calculate overdue days
const getOverdueDays = (dueDate: string): number | null => {
    if (!dueDate) return null;
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : null;
};

const FlowCard: React.FC<FlowCardProps> = ({ task, onDragStart }) => {
    const priorityStyle = priorityStyles[task.priority];
    const overdueDays = task.dueDate ? getOverdueDays(task.dueDate) : null;

    return (
        <div
            draggable
            onDragStart={(e) => onDragStart(e, task.id)}
            className={`flow-card-simple ${task.isBlocked ? 'flow-card-blocked' : ''}`}
        >

            <div className="flow-card-simple-header">
                <h4 className="flow-card-simple-title">{task.title}</h4>
                <span
                    className="flow-card-simple-priority"
                    style={{ backgroundColor: priorityStyle.bg, color: priorityStyle.text }}
                >
                    {priorityStyle.label}
                </span>
            </div>


            <div className="flow-card-simple-project">
                <span className="flow-card-simple-project-dot"></span>
                <span>{task.project.code}</span>
            </div>


            {task.isBlocked && task.blockedInfo && (
                <div className="flow-card-blocked-info">
                    <div className="flow-card-blocked-duration">
                        🔸 Đang bị chặn: {getBlockedDuration(task.blockedInfo.blockedSince)} chờ {task.blockedInfo.waitingFor}
                    </div>
                    <div className="flow-card-blocked-waiting">
                        📋 Chờ: {task.blockedInfo.waitingFor}
                    </div>
                    <div className="flow-card-blocked-reason">
                        ● {task.blockedInfo.blockedReason}
                    </div>
                </div>
            )}


            {overdueDays && overdueDays > 0 && !task.isBlocked && (
                <div className="flow-card-overdue-badge">
                    🔥 Trễ hạn {overdueDays} ngày
                </div>
            )}
        </div>
    );
};

export default FlowCard;
