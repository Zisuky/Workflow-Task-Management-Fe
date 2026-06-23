import React, { useState, useEffect } from 'react';
import type { Project } from '../../shared/types/project';
import { projectRepository } from '../../features/project/infrastructure/project.api';
import { projectStatusApi, type ProjectStatusResponse, PROJECT_STATUS_COLORS } from '../../features/project/infrastructure/projectStatus.client';
import { useToast } from '../../ui/toast/useToast';
import { userApi } from '../../features/user/infrastructure/user.api';
import type { Member } from '../../data/members.data';
import ManagerSearch from './ManagerSearch';
import MemberSelect from './MemberSelect';

interface ProjectDetailModalProps {
    isOpen: boolean;
    project: Project | null;
    onClose: () => void;
    onRefresh?: () => void;
}

const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
    isOpen,
    project,
    onClose,
    onRefresh,
}) => {
    const toast = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [statusId, setStatusId] = useState('');
    const [leaderId, setLeaderId] = useState('');
    const [editMemberIds, setEditMemberIds] = useState<string[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [statuses, setStatuses] = useState<ProjectStatusResponse[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Initialize state when project or modal open state changes
    useEffect(() => {
        if (project) {
            setName(project.name);
            setDescription(project.description || '');
            setStatusId(project.statusId || '');
            setLeaderId(project.leaderId || '');
            setEditMemberIds(project.memberIds || []);
            setIsEditing(false);
            setShowDeleteConfirm(false);
        }
    }, [project, isOpen]);

    // Fetch active statuses and users when modal is opened
    useEffect(() => {
        if (isOpen) {
            projectStatusApi.getActive()
                .then((res) => {
                    const list = (res as any).data ?? res;
                    setStatuses(list);
                })
                .catch((err) => {
                    console.error('Failed to load project statuses:', err);
                });

            userApi.getAll()
                .then((res) => {
                    setUsers(res);
                })
                .catch((err) => {
                    console.error('Failed to load users:', err);
                });
        }
    }, [isOpen]);

    if (!isOpen || !project) return null;

    // Handle immediate status update in View Mode
    const handleStatusChange = async (newStatusId: string) => {
        try {
            setStatusId(newStatusId);
            await projectStatusApi.updateProjectStatus(project.id, newStatusId);
            toast.success('Cập nhật trạng thái dự án thành công');
            onRefresh?.();
        } catch (err: any) {
            console.error('Failed to update project status:', err);
            const errMsg = err.response?.data?.message ?? 'Cập nhật trạng thái thất bại';
            toast.error(errMsg);
            // Revert local select value to previous state
            setStatusId(project.statusId || '');
        }
    };

    // Save modifications in Edit Mode
    const handleSave = async () => {
        if (!name.trim()) {
            toast.error('Tên dự án không được để trống');
            return;
        }
        if (!leaderId) {
            toast.error('Vui lòng chọn người phụ trách');
            return;
        }
        setIsSaving(true);
        try {
            // Find leader and members display names to update local state nicely
            const leaderUser = users.find(u => u.id === leaderId);
            const managerName = leaderUser ? leaderUser.name : 'Chưa có';

            const memberNames = editMemberIds
                .map(id => users.find(u => u.id === id)?.name)
                .filter(Boolean)
                .join(', ');

            // 1. Update text details, leader, and members
            await projectRepository.updateProject(project.id, {
                name,
                description,
                leaderId,
                memberIds: editMemberIds,
                manager: managerName,
                assignee: memberNames || 'Chưa có',
            });

            // 2. Update status if it was changed during edit mode
            if (statusId !== project.statusId) {
                await projectStatusApi.updateProjectStatus(project.id, statusId);
            }

            toast.success('Cập nhật thông tin dự án thành công');
            setIsEditing(false);
            onRefresh?.();
        } catch (err: any) {
            console.error('Failed to save project:', err);
            const errMsg = err.response?.data?.message ?? 'Cập nhật thông tin dự án thất bại';
            toast.error(errMsg);
        } finally {
            setIsSaving(false);
        }
    };

    // Delete project
    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const success = await projectRepository.deleteProject(project.id);
            if (success) {
                toast.success('Xóa dự án thành công');
                onClose();
                onRefresh?.();
            } else {
                toast.error('Xóa dự án thất bại');
            }
        } catch (err: any) {
            console.error('Failed to delete project:', err);
            const errMsg = err.response?.data?.message ?? 'Xóa dự án thất bại';
            toast.error(errMsg);
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    const currentStatus = statuses.find(s => s.id === statusId);
    const statusColor = PROJECT_STATUS_COLORS[currentStatus?.code || ''] || '#9CA3AF';

    // Map edited member ids to Member interface objects for MemberSelect
    const selectedMembersMapped: Member[] = editMemberIds
        .map(id => users.find(u => u.id === id))
        .filter(Boolean)
        .map(u => ({
            id: u.id,
            name: u.name,
            role: 'Member' as const,
            avatar: u.avatarUrl || undefined,
            status: 'Đã đăng ký' as const,
            createdAt: new Date().toLocaleDateString('vi-VN'),
        }));

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center animate-fadeIn">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 animate-scaleIn overflow-hidden">
                
                {/* Delete Confirmation Overlay */}
                {showDeleteConfirm && (
                    <div className="absolute inset-0 bg-black/45 backdrop-blur-sm z-50 flex items-center justify-center animate-fadeIn">
                        <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-gray-100 animate-scaleIn">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Xác nhận xóa dự án</h3>
                            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                                Bạn có chắc chắn muốn xóa dự án <strong className="text-gray-800">{project.name}</strong>?<br />
                                Hành động này sẽ xóa vĩnh viễn dự án cùng toàn bộ các công việc và dữ liệu liên quan. Hành động này không thể hoàn tác.
                            </p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    disabled={isDeleting}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all cursor-pointer"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all shadow-sm hover:shadow-md cursor-pointer disabled:opacity-50"
                                >
                                    {isDeleting ? 'Đang xóa...' : 'Xác nhận xóa'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50">
                    <span className="text-sm text-[#F79E61] font-semibold tracking-wide">{project.code}</span>
                    {isEditing ? (
                        <div className="mt-2">
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#F79E61]/20 focus:border-[#F79E61] outline-none text-gray-800 font-bold text-xl transition-all"
                                placeholder="Tên dự án"
                            />
                        </div>
                    ) : (
                        <h2 className="text-xl font-bold text-gray-800 mt-1">{project.name}</h2>
                    )}
                </div>

                {/* Content */}
                <div className="px-8 py-6 space-y-6 max-h-[60vh] overflow-y-auto">
                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-500 mb-2">Mô tả</label>
                        {isEditing ? (
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={4}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#F79E61]/20 focus:border-[#F79E61] outline-none text-gray-700 transition-all resize-none"
                                placeholder="Mô tả dự án..."
                            />
                        ) : (
                            <p className="text-gray-700 whitespace-pre-wrap">{project.description || 'Chưa có mô tả'}</p>
                        )}
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-6">
                        {/* Status Dropdown */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-500 mb-2">Trạng thái dự án</label>
                            <div className="flex items-center gap-3">
                                <span className={`w-3.5 h-3.5 rounded-full shadow-sm border border-white ${isEditing ? 'animate-pulse' : ''}`} style={{ backgroundColor: statusColor }} />
                                <div className="relative inline-block">
                                    <select
                                        value={statusId}
                                        onChange={(e) => isEditing ? setStatusId(e.target.value) : handleStatusChange(e.target.value)}
                                        className="bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-lg focus:ring-1 focus:ring-[#F79E61] focus:border-[#F79E61] p-2 py-1.5 cursor-pointer font-medium hover:bg-gray-100 transition-colors outline-none"
                                    >
                                        {statuses.map((status) => (
                                            <option key={status.id} value={status.id}>
                                                {status.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Manager */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-500 mb-2">Người phụ trách</label>
                            {isEditing ? (
                                <ManagerSearch
                                    value={users.find(u => u.id === leaderId)?.name || ''}
                                    onChange={(_, id) => {
                                        if (id) {
                                            setLeaderId(id);
                                        }
                                    }}
                                />
                            ) : (
                                <span className="text-gray-800 font-medium">{project.manager || 'Chưa có'}</span>
                            )}
                        </div>

                        {/* Assignee */}
                        <div className="col-span-2">
                            <label className="block text-sm font-semibold text-gray-500 mb-2">Người thực hiện</label>
                            {isEditing ? (
                                <MemberSelect
                                    selectedMembers={selectedMembersMapped}
                                    onChange={(members) => {
                                        setEditMemberIds(members.map(m => m.id));
                                    }}
                                />
                            ) : (
                                <span className="text-gray-800 font-medium break-all">{project.assignee || 'Chưa có'}</span>
                            )}
                        </div>

                        {/* Pin Status */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-500 mb-2">Trạng thái ghim</label>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${project.isPinned
                                ? 'bg-green-50 text-green-700 border border-green-200'
                                : 'bg-gray-50 text-gray-600 border border-gray-200'
                                }`}>
                                {project.isPinned ? '📌 Đã ghim' : 'Chưa ghim'}
                            </span>
                        </div>

                        {/* Start Date */}
                        {project.startDate && (
                            <div>
                                <label className="block text-sm font-semibold text-gray-500 mb-2">Ngày bắt đầu</label>
                                <span className="text-gray-800 font-medium">{new Date(project.startDate).toLocaleDateString('vi-VN')}</span>
                            </div>
                        )}

                        {/* End Date */}
                        {project.endDate && (
                            <div>
                                <label className="block text-sm font-semibold text-gray-500 mb-2">Ngày kết thúc</label>
                                <span className="text-gray-800 font-medium">{new Date(project.endDate).toLocaleDateString('vi-VN')}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-4 border-t border-gray-100 flex justify-between items-center bg-gray-50 rounded-b-2xl">
                    {isEditing ? (
                        <>
                            <div />
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        setName(project.name);
                                        setDescription(project.description || '');
                                        setStatusId(project.statusId || '');
                                        setLeaderId(project.leaderId || '');
                                        setEditMemberIds(project.memberIds || []);
                                    }}
                                    disabled={isSaving}
                                    className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all cursor-pointer"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#F79E61] to-[#f0884a] hover:from-[#e88d50] hover:to-[#e07d3a] rounded-lg transition-all shadow-sm hover:shadow-lg cursor-pointer disabled:opacity-50"
                                >
                                    {isSaving ? 'Đang lưu...' : 'Lưu'}
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-all cursor-pointer"
                            >
                                Xóa dự án
                            </button>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-5 py-2 text-sm font-medium text-[#F79E61] border border-[#F79E61] hover:bg-[#FFF9F5] rounded-lg transition-all cursor-pointer"
                                >
                                    Chỉnh sửa
                                </button>
                                <button
                                    onClick={onClose}
                                    className="px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#F79E61] to-[#f0884a] hover:from-[#e88d50] hover:to-[#e07d3a] rounded-lg transition-all shadow-sm hover:shadow-lg cursor-pointer"
                                >
                                    Đóng
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProjectDetailModal;
