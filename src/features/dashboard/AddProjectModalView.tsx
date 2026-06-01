import { useState, useEffect } from 'react';
import type { Member } from '../../data/members.data';
import DateInput from '../../components/common/DateInput';
import { workflowApi } from '../workflow/infrastructure/workflow.client';

interface WorkflowOption {
    id: string;
    name: string;
    description: string | null;
    isDefault: boolean;
}

interface AddProjectModalViewProps {
    isOpen: boolean;
    isFormValid: boolean;
    manager: string;
    startDate: string;
    endDate: string;
    today: string;
    selectedMembers: Member[];
    selectedTemplateId: string | null;
    onClose: () => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    onManagerChange: (name: string, id?: string) => void;
    onMembersChange: (members: Member[]) => void;
    onStartDateChange: (date: string) => void;
    onEndDateChange: (date: string) => void;
    onTemplateChange: (templateId: string | null) => void;
}

const AddProjectModalView: React.FC<AddProjectModalViewProps> = ({
    isOpen,
    isFormValid,
    manager,
    startDate,
    endDate,
    today,
    selectedMembers,
    selectedTemplateId,
    onClose,
    onSubmit,
    onManagerChange,
    onMembersChange,
    onStartDateChange,
    onEndDateChange,
    onTemplateChange,
}) => {
    const [workflows, setWorkflows] = useState<WorkflowOption[]>([]);
    const [isLoadingWorkflows, setIsLoadingWorkflows] = useState(false);
    const [projectName, setProjectName] = useState('');

    // Preview project code — mirrors BE logic: initials of each word + 6 random digits
    const previewProjectCode = (name: string): string => {
        if (!name.trim()) return '—';
        const initials = name.trim().split(/\s+/).map(w => w[0]?.toUpperCase() ?? '').join('');
        return `${initials}-XXXXXX`;
    };

    useEffect(() => {
        if (!isOpen) return;
        const fetchWorkflows = async () => {
            setIsLoadingWorkflows(true);
            try {
                const response = await workflowApi.getAll();
                const list = Array.isArray(response) ? response : (response.data ?? []);
                const mapped: WorkflowOption[] = list.map((w: { id: string; name: string; description?: string | null; isDefault?: boolean }) => ({
                    id: w.id,
                    name: w.name,
                    description: w.description || null,
                    isDefault: w.isDefault ?? false,
                }));
                setWorkflows(mapped);
                if (!selectedTemplateId) {
                    const defaultWf = mapped.find(w => w.isDefault);
                    if (defaultWf) {
                        onTemplateChange(defaultWf.id);
                    }
                }
            } catch (err) {
                console.error('Failed to load workflows:', err);
                setWorkflows([]);
            } finally {
                setIsLoadingWorkflows(false);
            }
        };
        fetchWorkflows();
    }, [isOpen]);

    if (!isOpen) return null;

    const handleTemplateClick = (templateId: string) => {
        if (selectedTemplateId === templateId) {
            onTemplateChange(null);
        } else {
            onTemplateChange(templateId);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center animate-fadeIn">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl mx-4 animate-scaleIn max-h-[90vh] overflow-y-auto">
                <div className="flex">
                    {/* Left Column - Project Form */}
                    <div className="flex-1 border-r border-gray-100">
                        <div className="px-8 py-6 border-b border-gray-100 sticky top-0 bg-white z-10">
                            <h2 className="text-xl font-bold text-gray-800">Thêm Dự Án</h2>
                        </div>
                        <form onSubmit={onSubmit} id="add-project-form" className="px-8 py-6 space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-600 mb-2">Tên Dự Án <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={projectName}
                                        onChange={e => setProjectName(e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F79E61]/50 focus:border-[#F79E61] transition-all"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 mb-2">Mã Dự Án</label>
                                    <input
                                        type="text"
                                        value={previewProjectCode(projectName)}
                                        disabled
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed font-mono text-sm"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">Tự động tạo từ tên dự án</p>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-2">Mô Tả:</label>
                                <textarea
                                    name="description"
                                    rows={3}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F79E61]/50 focus:border-[#F79E61] transition-all resize-none"
                                ></textarea>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-2">Trưởng Dự Án:</label>
                                <ManagerSearchView
                                    value={manager}
                                    onChange={onManagerChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-2">Thành Viên:</label>
                                <MemberSelectView
                                    selectedMembers={selectedMembers}
                                    onChange={onMembersChange}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm text-gray-600 mb-2">Thời Gian Thực Hiện:</label>
                                    <DateInput
                                        name="startDate"
                                        value={startDate}
                                        min={today}
                                        onChange={onStartDateChange}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F79E61]/50 focus:border-[#F79E61] transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 mb-2">Thời Gian Kết Thúc:</label>
                                    <DateInput
                                        name="endDate"
                                        value={endDate}
                                        min={startDate}
                                        onChange={onEndDateChange}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F79E61]/50 focus:border-[#F79E61] transition-all"
                                    />
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Right Column - Workflow Templates */}
                    <div className="w-[360px] flex flex-col">
                        <div className="px-6 py-6 border-b border-gray-100 sticky top-0 bg-white z-10">
                            <h2 className="text-xl font-bold text-gray-800">Áp dụng quy trình</h2>
                        </div>
                        <div className="px-6 py-4 flex-1 overflow-y-auto">
                            <p className="text-sm text-gray-500 mb-4">Chọn quy trình làm việc cho dự án:</p>
                            {isLoadingWorkflows ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="w-8 h-8 border-3 border-orange-200 rounded-full animate-spin border-t-[#F79E61]"></div>
                                </div>
                            ) : workflows.length === 0 ? (
                                <div className="text-center py-8 text-gray-400 text-sm">
                                    Chưa có quy trình nào. Vui lòng tạo workflow trước.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {workflows.map((wf) => (
                                        <div
                                            key={wf.id}
                                            onClick={() => handleTemplateClick(wf.id)}
                                            className={`p-4 border rounded-xl cursor-pointer transition-all hover:shadow-md ${selectedTemplateId === wf.id
                                                ? 'border-[#F79E61] bg-[#FFF8F3] ring-2 ring-[#F79E61]/20'
                                                : 'border-gray-200 bg-white hover:border-gray-300'
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#1e3a5f] to-[#2d5a87] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                                    {wf.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-semibold text-gray-800 text-sm">{wf.name}</h4>
                                                    {wf.description && (
                                                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{wf.description}</p>
                                                    )}
                                                    <div className="flex gap-2 mt-2">
                                                        {wf.isDefault && (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700 font-medium">
                                                                Mặc định
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                {selectedTemplateId === wf.id && (
                                                    <div className="flex-shrink-0">
                                                        <svg className="w-5 h-5 text-[#F79E61]" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer with buttons */}
                <div className="flex justify-end gap-3 px-8 py-4 border-t border-gray-100 bg-gray-50/50">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-all"
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        form="add-project-form"
                        disabled={!isFormValid}
                        className={`px-6 py-2.5 rounded-lg transition-all shadow-md ${isFormValid
                            ? 'bg-gradient-to-r from-[#F79E61] to-[#f0884a] text-white hover:from-[#e88d50] hover:to-[#e07d3a] hover:shadow-lg'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                    >
                        Thêm
                    </button>
                </div>
            </div>
        </div>
    );
};

import ManagerSearchView from '../../components/dashboard/ManagerSearch';
import MemberSelectView from '../../components/dashboard/MemberSelect';
export default AddProjectModalView;
