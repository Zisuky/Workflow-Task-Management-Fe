import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { taskRepository as taskService } from '../task/infrastructure/task.repository';
import type { Task } from '../../shared/types/task';
import TaskDetailView, { type TaskUpdateData } from './TaskDetailView';
import { useToast } from '../../ui/toast';
import ConfirmModal from '../../components/common/ConfirmModal';

const TaskDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const toast = useToast();
    const [task, setTask] = useState<Task | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showUpdateConfirm, setShowUpdateConfirm] = useState(false);
    const [pendingUpdate, setPendingUpdate] = useState<TaskUpdateData | null>(null);
    useEffect(() => {
        const loadTask = async () => {
            if (!id) {
                navigate('/task');
                return;
            }
            setIsLoading(true);
            try {
                const taskData = await taskService.getTaskById(id);
                setTask(taskData || null);
            } catch (error) {
                console.error('Failed to load task:', error);
                navigate('/task');
            } finally {
                setIsLoading(false);
            }
        };
        loadTask();
    }, [id, navigate]);
    const handleBack = () => {
        navigate('/task');
    };
    const handleUpdate = (data: TaskUpdateData) => {
        setPendingUpdate(data);
        setShowUpdateConfirm(true);
    };

    const handleUpdateConfirm = async () => {
        if (!task || !pendingUpdate) return;
        setShowUpdateConfirm(false);
        const data = pendingUpdate;
        setPendingUpdate(null);
        try {
            const updatedTask = await taskService.updateTask(task.id, {
                priority: data.priority,
                status: data.status,
                description: data.description,
                taskGroupId: data.taskGroupId,
                statusId: data.statusId,
                priorityId: data.priorityId,
            });
            if (updatedTask) {
                setTask({
                    ...updatedTask,
                    group: data.group,
                    taskGroupId: data.taskGroupId,
                });
                toast.success('Cập nhật thành công');
            }
        } catch (error) {
            console.error('Failed to update task:', error);
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
            await taskService.deleteTask(task.id);
            toast.success('Xóa thành công');
            navigate('/task');
        } catch (error) {
            console.error('Failed to delete task:', error);
            toast.error('Xóa thất bại');
        }
    };
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-orange-200 rounded-full animate-spin border-t-[#F79E61]"></div>
                    <span className="text-gray-500 animate-pulse">Đang tải...</span>
                </div>
            </div>
        );
    }
    if (!task) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Không tìm thấy công việc</h2>
                    <button
                        onClick={handleBack}
                        className="text-[#F79E61] hover:text-[#e88d50] transition-colors"
                    >
                        Quay lại danh sách
                    </button>
                </div>
            </div>
        );
    }
    return (
        <>
        <TaskDetailView
            task={task}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
        />
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
export default TaskDetailPage;
