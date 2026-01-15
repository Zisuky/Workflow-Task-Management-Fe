import React, { useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { FlowStep, Task } from '../../data/workflow.data';
import { defaultFlowSteps, mockTasks } from '../../data/workflow.data';
import { FlowColumn, FlowColumnConfig, BoardMinimap } from './components';
import { useToast } from '../../ui/toast/useToast';

// Mock projects for selector
const mockProjects = [
    { id: 'proj-all', name: 'Tất cả dự án' },
    { id: 'proj-1', name: 'HR Platform', code: 'HRPCC' },
    { id: 'proj-2', name: 'Finance System', code: 'FIN' },
    { id: 'proj-3', name: 'PMCC Core', code: 'PMCC' },
];

// Mock flows for selector
const mockFlows = [
    { id: 'flow-default', name: 'Default Workflow' },
    { id: 'flow-dev', name: 'Development Flow' },
    { id: 'flow-hr', name: 'HR Process Flow' },
];

// Mock current user
const currentUser = { id: 'user-1', name: 'Admin', role: 'admin' };

const FlowBoard: React.FC = () => {
    const [steps, setSteps] = useState<FlowStep[]>(defaultFlowSteps);
    const [tasks, setTasks] = useState<Task[]>(mockTasks);
    const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
    const toast = useToast();
    const boardContainerRef = useRef<HTMLDivElement>(null);

    const [selectedProject, setSelectedProject] = useState<string>('proj-all');
    const [selectedFlow, setSelectedFlow] = useState<string>('flow-default');

    useEffect(() => {
        const target = document.getElementById('header-right-actions');
        setPortalTarget(target);
    }, []);

    const filteredTasks = selectedProject === 'proj-all'
        ? tasks
        : tasks.filter(task => task.project.id === selectedProject);

    const handleDragStart = useCallback((e: React.DragEvent, taskId: string) => {
        setDraggedTaskId(taskId);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', taskId);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }, []);

    const handleDrop = useCallback((e: React.DragEvent, stepId: string) => {
        e.preventDefault();
        if (!draggedTaskId) return;

        const targetStep = steps.find(s => s.id === stepId);
        if (!targetStep) return;

        const targetStepTasks = tasks.filter(t => t.flowStepId === stepId);
        if (targetStep.wipMax && targetStepTasks.length >= targetStep.wipMax) {
            toast.error(`Cột ${targetStep.name} đã quá tải (Max WIP: ${targetStep.wipMax}). Không thể thêm task mới.`);
            setDraggedTaskId(null);
            return;
        }

        if (targetStep.allowedRoles && targetStep.allowedRoles.length > 0) {
            if (!targetStep.allowedRoles.includes(currentUser.role)) {
                toast.error(`Bạn không có quyền chuyển task vào cột ${targetStep.name}.`);
                setDraggedTaskId(null);
                return;
            }
        }

        const droppedTask = tasks.find(t => t.id === draggedTaskId);
        if (droppedTask && targetStep.requiredFields.length > 0) {
            const missingFields = targetStep.requiredFields.filter(field => {
                if (field === 'assignee') return !droppedTask.assignee;
                if (field === 'priority') return !droppedTask.priority;
                if (field === 'dueDate') return !droppedTask.dueDate;
                if (field === 'tags') return droppedTask.tags.length === 0;
                return !droppedTask[field as keyof Task];
            });

            if (missingFields.length > 0) {
                toast.error(`Task thiếu thông tin bắt buộc cho cột ${targetStep.name}: ${missingFields.join(', ')}`);
                setDraggedTaskId(null);
                return;
            }
        }

        setTasks(prevTasks =>
            prevTasks.map(task =>
                task.id === draggedTaskId ? { ...task, flowStepId: stepId } : task
            )
        );
        setDraggedTaskId(null);
    }, [draggedTaskId, steps, tasks, toast]);

    const handleSaveSteps = useCallback((newSteps: FlowStep[]) => {
        setSteps(newSteps);
        toast.success('Cấu hình quy trình đã được cập nhật thành công');
    }, [toast]);

    const sortedSteps = [...steps].sort((a, b) => a.order - b.order);

    const toolbarContent = (
        <>
            <div className="flex items-center gap-2 mr-4 border-r border-gray-200 pr-4">
                {/* Project Selector */}
                <div className="flow-selector">
                    <select
                        value={selectedProject}
                        onChange={(e) => setSelectedProject(e.target.value)}
                        className="flow-selector-select h-9 py-1 px-2 text-sm min-w-[140px]"
                    >
                        {mockProjects.map(proj => (
                            <option key={proj.id} value={proj.id}>
                                {proj.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Flow Selector */}
                <div className="flow-selector">
                    <select
                        value={selectedFlow}
                        onChange={(e) => setSelectedFlow(e.target.value)}
                        className="flow-selector-select h-9 py-1 px-2 text-sm min-w-[140px]"
                    >
                        {mockFlows.map(flow => (
                            <option key={flow.id} value={flow.id}>
                                {flow.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <button
                onClick={() => setIsConfigOpen(true)}
                className="flow-toolbar-config h-9 py-1 px-3 text-sm"
            >
                ⚙️ Settings
            </button>
        </>
    );

    return (
        <div className="flow-board-container relative">
            {/* Portal Toolbar to Header */}
            {portalTarget && createPortal(toolbarContent, portalTarget)}

            {/* Board */}
            <div ref={boardContainerRef} className="flow-board pt-4">
                {sortedSteps.map((step) => (
                    <FlowColumn
                        key={step.id}
                        step={step}
                        tasks={filteredTasks}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                    />
                ))}
            </div>

            {/* Board Minimap for horizontal scroll navigation */}
            <BoardMinimap
                containerRef={boardContainerRef}
                columnCount={sortedSteps.length}
            />

            {/* Config Modal */}
            <FlowColumnConfig
                isOpen={isConfigOpen}
                onClose={() => setIsConfigOpen(false)}
                steps={steps}
                onSave={handleSaveSteps}
            />
        </div>
    );
};

export default FlowBoard;
