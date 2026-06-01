import React, { useState, useEffect } from 'react';
import type { Task } from '../../../shared/types/task';
import { taskRepository } from '../../task/infrastructure/task.repository';
import TaskDetailView, { type TaskUpdateData } from '../../task/TaskDetailView';
import { useToast } from '../../../ui/toast/useToast';
import ConfirmModal from '../../../components/common/ConfirmModal';

interface TaskDetailPanelProps {
  taskId: string | null;
  onClose: () => void;
  onTaskUpdated?: (task: Task) => void;
  onTaskDeleted?: (taskId: string) => void;
}

const TaskDetailPanel: React.FC<TaskDetailPanelProps> = ({
  taskId,
  onClose,
  onTaskUpdated,
  onTaskDeleted,
}) => {
  const [task, setTask]           = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showUpdateConfirm, setShowUpdateConfirm] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState<TaskUpdateData | null>(null);
  const toast                   = useToast();

  // Load task when taskId changes
  useEffect(() => {
    if (!taskId) { setTask(null); return; }
    setIsLoading(true);
    taskRepository.getTaskById(taskId)
      .then(j => setTask(j ?? null))
      .catch(() => { toast.error('Không thể tải chi tiết công việc'); setTask(null); })
      .finally(() => setIsLoading(false));
  }, [taskId]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleUpdate = (data: TaskUpdateData) => {
    if (!task) return;
    setPendingUpdate(data);
    setShowUpdateConfirm(true);
  };

  const handleUpdateConfirm = async () => {
    if (!task || !pendingUpdate) return;
    setShowUpdateConfirm(false);
    const data = pendingUpdate;
    setPendingUpdate(null);
    try {
      const updated = await taskRepository.updateTask(task.id, {
        description: data.description,
        taskGroupId: data.taskGroupId,
        statusId: data.statusId,
        priorityId: data.priorityId,
      });
      if (updated) {
        const merged: Task = { ...updated, group: data.group, taskGroupId: data.taskGroupId };
        setTask(merged);
        onTaskUpdated?.(merged);
        toast.success('Cập nhật thành công');
      }
    } catch {
      toast.error('Cập nhật thất bại');
    }
  };

  const handleDelete = () => {
    if (!task) return;
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!task) return;
    setShowDeleteConfirm(false);
    try {
      await taskRepository.deleteTask(task.id);
      toast.success('Đã xóa công việc');
      onTaskDeleted?.(task.id);
    } catch {
      toast.error('Xóa thất bại');
    }
  };

  // Not open
  if (!taskId) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-[300] backdrop-blur-[1px]"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-3xl bg-white shadow-2xl z-[301] flex flex-col overflow-hidden animate-slide-in-right">
        {/* Panel header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-white flex-shrink-0">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span>Chi tiết công việc</span>
            {task && <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{task.code}</span>}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            title="Đóng (Esc)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Panel body */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-orange-200 rounded-full animate-spin border-t-[#F79E61]" />
                <span className="text-sm text-gray-500 animate-pulse">Đang tải...</span>
              </div>
            </div>
          ) : task ? (
            <TaskDetailView
              task={task}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">
              Không tìm thấy công việc
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Bạn xác nhận xóa?"
        message="Hành động này không thể hoàn tác."
        confirmLabel="Có"
        cancelLabel="Không"
        confirmVariant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
      />
      <ConfirmModal
        isOpen={showUpdateConfirm}
        title="Bạn xác nhận cập nhật?"
        confirmLabel="Cập nhật"
        cancelLabel="Hủy"
        confirmVariant="primary"
        onConfirm={handleUpdateConfirm}
        onCancel={() => { setShowUpdateConfirm(false); setPendingUpdate(null); }}
      />
    </>
  );
};

export default TaskDetailPanel;
