import React, { useState } from 'react';
import type { WorkflowStep } from '../domain/workflow.entity';
import type { Task } from '../../../shared/types/task';
import FlowCard from './FlowCard';

interface FlowColumnProps {
  step: WorkflowStep;
  tasks: Task[];
  onDragStart: (e: React.DragEvent, taskId: string) => void;
  onDrop: (e: React.DragEvent, stepId: string) => void;
  onPin?: (taskId: string) => void;
  onDelete?: (taskId: string) => void;
  onEdit?: (taskId: string) => void;
  onCardClick?: (taskId: string) => void;
  highlightIncomplete?: boolean;
}

const FlowColumn: React.FC<FlowColumnProps> = ({
  step,
  tasks,
  onDragStart,
  onDrop,
  onPin,
  onDelete,
  onEdit,
  onCardClick,
  highlightIncomplete = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const stepTasks = tasks.filter(t => t.statusId === step.statusId);
  const count = stepTasks.length;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    setIsDragOver(false);
    onDrop(e, step.id);
  };

  return (
    <div
      className={`flow-column flex flex-col rounded-xl overflow-hidden border transition-all ${
        isDragOver
          ? 'border-orange-400 shadow-md'
          : highlightIncomplete && count > 0
          ? 'border-orange-300 ring-2 ring-orange-300 ring-offset-1'
          : 'border-gray-100'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* ── Column Header ─────────────────────────────────────────────────── */}
      <div
        className="px-4 py-3 flex items-center justify-between flex-shrink-0"
        style={{ backgroundColor: step.color }}
      >
        <div className="flex items-center gap-2">
          {/* Stage name in CAPS */}
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">
            {step.name}
          </span>
          {/* Count badge */}
          <span className="text-xs font-semibold text-gray-500 bg-white/60 px-1.5 py-0.5 rounded-full">
            {count}
          </span>
          {/* FINAL badge */}
          {step.isFinal && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-green-100 text-green-700 border border-green-200">
              FINAL
            </span>
          )}
        </div>
        {/* ⋮ menu placeholder */}
        <button className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-gray-600 hover:bg-white/50 transition-colors text-base">
          ⋮
        </button>
      </div>

      {/* ── Cards area ────────────────────────────────────────────────────── */}
      <div
        className={`flex-1 p-3 overflow-y-auto min-h-[120px] ${
          isDragOver ? 'bg-orange-50/40' : 'bg-white'
        }`}
      >
        {stepTasks.map(task => (
          <FlowCard
            key={task.id}
            task={task}
            onDragStart={onDragStart}
            onPin={onPin}
            onDelete={onDelete}
            onEdit={onEdit}
            onCardClick={onCardClick}
            isFinal={step.isFinal}
          />
        ))}

        {stepTasks.length === 0 && (
          <div
            className={`flex items-center justify-center h-20 rounded-lg border-2 border-dashed text-xs transition-colors ${
              isDragOver
                ? 'border-orange-400 text-orange-500 font-semibold bg-orange-50'
                : 'border-gray-200 text-gray-400'
            }`}
          >
            {isDragOver ? '⬇ Thả vào đây' : 'Kéo thả task vào đây'}
          </div>
        )}
      </div>
    </div>
  );
};

export default FlowColumn;
