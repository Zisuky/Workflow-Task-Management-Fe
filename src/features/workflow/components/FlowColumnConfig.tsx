import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { WorkflowStep } from '../domain/workflow.entity';
import { workflowRepository, saveStepColors } from '../infrastructure/workflow.repository';

// ─── Pastel color options ─────────────────────────────────────────────────────
const COLOR_OPTIONS = [
  { hex: '#FEF3C7', label: 'Vàng' },
  { hex: '#D1FAE5', label: 'Xanh lá' },
  { hex: '#DBEAFE', label: 'Xanh dương' },
  { hex: '#FCE7F3', label: 'Hồng' },
  { hex: '#E0E7FF', label: 'Tím' },
  { hex: '#FED7AA', label: 'Cam' },
  { hex: '#F3E8FF', label: 'Tím nhạt' },
  { hex: '#CCFBF1', label: 'Ngọc' },
];

// ─── Sortable step row ────────────────────────────────────────────────────────
interface SortableStepRowProps {
  step: WorkflowStep;
  onColorChange: (statusId: string, color: string) => void;
}

const SortableStepRow: React.FC<SortableStepRowProps> = ({ step, onColorChange }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: step.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg mb-2 shadow-sm"
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing px-1 touch-none"
        title="Kéo để sắp xếp"
      >
        ⠿
      </button>

      {/* Step name */}
      <div
        className="flex-1 px-3 py-1.5 rounded-md text-sm font-medium"
        style={{ backgroundColor: step.color, color: '#374151' }}
      >
        {step.name}
      </div>

      {/* Color picker */}
      <div className="flex items-center gap-1">
        {COLOR_OPTIONS.map(opt => (
          <button
            key={opt.hex}
            title={opt.label}
            onClick={() => onColorChange(step.statusId, opt.hex)}
            className={`w-5 h-5 rounded-full border-2 transition-transform hover:scale-110 ${
              step.color === opt.hex ? 'border-gray-600 scale-110' : 'border-transparent'
            }`}
            style={{ backgroundColor: opt.hex }}
          />
        ))}
      </div>
    </div>
  );
};

// ─── Main config modal ────────────────────────────────────────────────────────
interface FlowColumnConfigProps {
  isOpen: boolean;
  onClose: () => void;
  workflowId: string;
  steps: WorkflowStep[];
  onSave: (steps: WorkflowStep[]) => void;
}

const FlowColumnConfig: React.FC<FlowColumnConfigProps> = ({
  isOpen,
  onClose,
  workflowId,
  steps,
  onSave,
}) => {
  const [localSteps, setLocalSteps] = useState<WorkflowStep[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLocalSteps([...steps].sort((a, b) => a.sortOrder - b.sortOrder));
    }
  }, [isOpen, steps]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setLocalSteps(prev => {
      const oldIndex = prev.findIndex(s => s.id === active.id);
      const newIndex = prev.findIndex(s => s.id === over.id);
      const reordered = arrayMove(prev, oldIndex, newIndex);
      return reordered.map((s, i) => ({ ...s, sortOrder: i }));
    });
  };

  const handleColorChange = (statusId: string, color: string) => {
    setLocalSteps(prev =>
      prev.map(s => (s.statusId === statusId ? { ...s, color } : s))
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Persist colors to localStorage
      const colorConfig: Record<string, string> = {};
      localSteps.forEach(s => { colorConfig[s.statusId] = s.color; });
      saveStepColors(workflowId, colorConfig);

      // Persist sort order to BE (fire-and-forget per step)
      await Promise.allSettled(
        localSteps.map(s =>
          workflowRepository.updateStepSortOrder(workflowId, s.id, s.sortOrder)
        )
      );

      onSave(localSteps);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">⚙️ Cấu hình Workflow</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <p className="text-sm text-gray-500 mb-4">
            Kéo thả để sắp xếp thứ tự cột. Chọn màu pastel cho từng bước.
          </p>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={localSteps.map(s => s.id)}
              strategy={verticalListSortingStrategy}
            >
              {localSteps.map(step => (
                <SortableStepRow
                  key={step.id}
                  step={step}
                  onColorChange={handleColorChange}
                />
              ))}
            </SortableContext>
          </DndContext>

          {localSteps.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              Không có bước nào trong workflow này
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 text-sm"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-gradient-to-r from-[#F79E61] to-[#f0884a] text-white rounded-lg text-sm font-medium hover:from-[#e88d50] hover:to-[#e07d3a] disabled:opacity-50"
          >
            {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlowColumnConfig;
