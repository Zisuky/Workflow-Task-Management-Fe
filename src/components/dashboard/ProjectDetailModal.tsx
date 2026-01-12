import type { Project } from '../../models';

interface ProjectDetailModalProps {
    isOpen: boolean;
    project: Project | null;
    onClose: () => void;
}

const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
    isOpen,
    project,
    onClose,
}) => {
    if (!isOpen || !project) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center animate-fadeIn">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 animate-scaleIn">
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-100">
                    <span className="text-sm text-[#F79E61] font-medium">{project.code}</span>
                    <h2 className="text-xl font-bold text-gray-800 mt-1">{project.name}</h2>
                </div>

                {/* Content */}
                <div className="px-8 py-6 space-y-6">
                    {/* Description */}
                    {project.description && (
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-2">Mô tả</label>
                            <p className="text-gray-700">{project.description}</p>
                        </div>
                    )}

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-6">
                        {/* Manager */}
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-2">Người phụ trách</label>
                            <span className="text-gray-800 font-medium">{project.manager || 'Chưa có'}</span>
                        </div>

                        {/* Assignee */}
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-2">Người thực hiện</label>
                            <span className="text-gray-800 font-medium">{project.assignee || 'Chưa có'}</span>
                        </div>

                        {/* Group */}
                        {project.group && (
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-2">Nhóm</label>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-700">
                                    {project.group}
                                </span>
                            </div>
                        )}

                        {/* Pin Status */}
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-2">Trạng thái ghim</label>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${project.isPinned
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-600'
                                }`}>
                                {project.isPinned ? '📌 Đã ghim' : 'Chưa ghim'}
                            </span>
                        </div>

                        {/* Start Date */}
                        {project.startDate && (
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-2">Ngày bắt đầu</label>
                                <span className="text-gray-800">{new Date(project.startDate).toLocaleDateString('vi-VN')}</span>
                            </div>
                        )}

                        {/* End Date */}
                        {project.endDate && (
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-2">Ngày kết thúc</label>
                                <span className="text-gray-800">{new Date(project.endDate).toLocaleDateString('vi-VN')}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-4 border-t border-gray-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-lg transition-all shadow-md bg-gradient-to-r from-[#F79E61] to-[#f0884a] text-white hover:from-[#e88d50] hover:to-[#e07d3a] hover:shadow-lg"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProjectDetailModal;
