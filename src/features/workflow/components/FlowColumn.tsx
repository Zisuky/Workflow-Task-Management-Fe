import React from 'react';
import type { FlowStep, Task } from '../../../data/workflow.data';
import { getTasksByStep } from '../../../data/workflow.data';
import FlowCard from './FlowCard';

interface FlowColumnProps {
    step: FlowStep;
    tasks: Task[];
    onDragStart: (e: React.DragEvent, taskId: string) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent, stepId: string) => void;
    isDropDisabled?: boolean;
}

type WipStatus = 'normal' | 'at-limit' | 'exceeded';

const FlowColumn: React.FC<FlowColumnProps> = ({
    step,
    tasks,
    onDragStart,
    onDragOver,
    onDrop,
    isDropDisabled = false,
}) => {
    const stepTasks = getTasksByStep(tasks, step.id);
    const taskCount = stepTasks.length;

    // Determine WIP status
    const getWipStatus = (): WipStatus => {
        if (step.wipMax && taskCount >= step.wipMax) {
            return taskCount > step.wipMax ? 'exceeded' : 'at-limit';
        }
        return 'normal';
    };

    const wipStatus = getWipStatus();
    const isAtLimit = wipStatus === 'at-limit' || wipStatus === 'exceeded';

    // Handle drop with WIP check
    const handleDrop = (e: React.DragEvent) => {
        if (isDropDisabled || wipStatus === 'exceeded') {
            e.preventDefault();
            return;
        }
        onDrop(e, step.id);
    };

    // Handle drag over with WIP check
    const handleDragOver = (e: React.DragEvent) => {
        if (isDropDisabled || wipStatus === 'exceeded') {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'none';
            return;
        }
        onDragOver(e);
    };

    return (
        <div
            className={`flow-column ${wipStatus === 'exceeded' ? 'flow-column-exceeded' : ''}`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            {/* Column Header - Simplified */}
            <div className="flow-column-header-simple" style={{ backgroundColor: step.color }}>
                <div className="flow-column-header-left">
                    <h3 className="flow-column-title-simple">{step.name}</h3>
                    <span className={`flow-column-wip-badge ${wipStatus}`}>
                        {taskCount} / {step.wipMax ?? '∞'}
                    </span>
                </div>
                <button className="flow-column-menu-btn">⋮</button>
            </div>

            {/* WIP Warning Message */}
            {isAtLimit && (
                <div className="flow-wip-warning">
                    <span className="flow-wip-warning-icon">⚠️</span>
                    <div>
                        <span className="flow-wip-warning-text">Đạt giới hạn công việc (WIP)!</span>
                        <br />
                        <span className="flow-wip-warning-desc">Không thể kéo thêm task vào cột này</span>
                    </div>
                </div>
            )}

            {/* Tasks */}
            <div className="flow-column-tasks">
                {stepTasks.map((task) => (
                    <FlowCard
                        key={task.id}
                        task={task}
                        onDragStart={onDragStart}
                    />
                ))}

                {stepTasks.length === 0 && (
                    <div className="flow-column-empty">
                        Kéo thả task vào đây
                    </div>
                )}
            </div>
        </div>
    );
};

export default FlowColumn;
