import React, { useState, useEffect, useRef } from 'react';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { taskStatusApi } from '../../workflow/infrastructure/workflow.client';
import type { TaskStatusItem, SelectedStage } from './types';
import SortableStageRow from './SortableStageRow';

interface Props {
  selectedStages: SelectedStage[];
  isStatusSelected: (id: string) => boolean;
  onToggle: (id: string, name: string) => void;
  onAddNew: (name: string) => void;
  onRename: (key: string, name: string) => void;
  onRemove: (key: string) => void;
  onReorder: (stages: SelectedStage[]) => void;
  allowCreate?: boolean;
}

const StepStages: React.FC<Props> = ({
  selectedStages, isStatusSelected, onToggle, onAddNew, onRename, onRemove, onReorder, allowCreate = true
}) => {
  const [available, setAvailable] = useState<TaskStatusItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState('');
  const newInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    setLoading(true);
    taskStatusApi.getActive()
      .then((res: unknown) => {
        const raw = res as { data?: TaskStatusItem[] } | TaskStatusItem[];
        const list: TaskStatusItem[] = Array.isArray(raw) ? raw
          : Array.isArray((raw as { data?: TaskStatusItem[] }).data)
          ? (raw as { data: TaskStatusItem[] }).data : [];
        setAvailable(list);
      })
      .catch(() => setAvailable([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { if (showNewForm) newInputRef.current?.focus(); }, [showNewForm]);

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = selectedStages.findIndex(s => s.key === active.id);
    const newIdx = selectedStages.findIndex(s => s.key === over.id);
    onReorder(arrayMove(selectedStages, oldIdx, newIdx));
  };

  const submitNew = () => {
    const t = newName.trim();
    if (!t) return;
    onAddNew(t);
    setNewName('');
    setShowNewForm(false);
  };

  const filtered = available.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex gap-4" style={{ height: 420 }}>
      {/* Left panel */}
      <div className="flex flex-col border border-gray-200 rounded-xl overflow-hidden" style={{ width: '45%' }}>
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Trạng thái có sẵn</p>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm kiếm..."
            className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F79E61]/40 focus:border-[#F79E61]" />
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-6 h-6 border-2 border-orange-200 rounded-full animate-spin border-t-[#F79E61]" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-6">Không tìm thấy</p>
          ) : filtered.map(s => {
            const sel = isStatusSelected(s.id);
            return (
              <button key={s.id} type="button" onClick={() => onToggle(s.id, s.name)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg mb-1 text-left text-sm transition-all ${
                  sel ? 'bg-orange-50 border border-[#F79E61]/40 text-[#F79E61]'
                      : 'hover:bg-gray-50 border border-transparent text-gray-700'}`}>
                <span className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  sel ? 'bg-[#F79E61] border-[#F79E61]' : 'border-gray-300'}`}>
                  {sel && <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                </span>
                <span className="flex-1 font-medium">{s.name}</span>
                <span className="text-xs text-gray-400 font-mono">{s.code}</span>
              </button>
            );
          })}
        </div>

        {allowCreate && (
          <div className="border-t border-gray-100 p-2">
            {!showNewForm ? (
              <button type="button" onClick={() => setShowNewForm(true)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#F79E61] hover:bg-orange-50 rounded-lg transition-colors font-medium">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Thêm giai đoạn mới
              </button>
            ) : (
              <div className="flex gap-1.5">
                <input ref={newInputRef} type="text" value={newName} onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') submitNew(); if (e.key === 'Escape') { setShowNewForm(false); setNewName(''); } }}
                  placeholder="Tên giai đoạn..."
                  className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F79E61]/40 focus:border-[#F79E61]" />
                <button type="button" onClick={submitNew} disabled={!newName.trim()}
                  className="px-3 py-1.5 bg-[#F79E61] text-white text-sm rounded-lg hover:bg-[#e88d50] disabled:opacity-40 disabled:cursor-not-allowed">Thêm</button>
                <button type="button" onClick={() => { setShowNewForm(false); setNewName(''); }}
                  className="px-2 py-1.5 border border-gray-200 text-gray-500 text-sm rounded-lg hover:bg-gray-50">✕</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Giai đoạn đã chọn</p>
          <span className="text-xs text-gray-400 bg-white border border-gray-200 rounded-full px-2 py-0.5">
            {selectedStages.length} giai đoạn
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {selectedStages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
              <svg className="w-10 h-10 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              <p className="text-sm">Chọn giai đoạn từ danh sách bên trái</p>
              <p className="text-xs">hoặc thêm giai đoạn mới</p>
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={selectedStages.map(s => s.key)} strategy={verticalListSortingStrategy}>
                {selectedStages.map((stage, i) => (
                  <SortableStageRow key={stage.key} stage={stage} index={i}
                    onRename={onRename} onRemove={onRemove} />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>

        {selectedStages.length > 0 && (
          <div className="px-3 py-2 border-t border-gray-100 bg-orange-50/40">
            <p className="text-xs text-gray-500">💡 Nhấn vào tên để đổi tên · Kéo để sắp xếp thứ tự</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StepStages;
