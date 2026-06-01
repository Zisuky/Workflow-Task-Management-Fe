import { useState, useEffect } from 'react';
import type { Member } from '../../data/members.data';
import DateInput from '../common/DateInput';
import ManagerSearch from './ManagerSearch';
import MemberSelect from './MemberSelect';
import { workflowApi } from '../../features/workflow/infrastructure/workflow.client';

export interface ProjectFormData {
    name: string;
    description: string;
    manager: string;
    members: string;
    leaderId: string;
    memberIds: string[];
    workflowId?: string;
    startDate?: string;
    endDate?: string;
}

interface WorkflowOption {
    id: string;
    name: string;
    description: string | null;
    isDefault: boolean;
}

interface AddProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: ProjectFormData) => void;
    defaultManager?: string;
    defaultManagerId?: string;
}

const previewProjectCode = (name: string): string => {
    if (!name.trim()) return '—';
    const initials = name.trim().split(/\s+/).map(w => w[0]?.toUpperCase() ?? '').join('');
    return `${initials}-XXXXXX`;
};

const AddProjectModal: React.FC<AddProjectModalProps> = ({ 
    isOpen, 
    onClose, 
    onSubmit,
    defaultManager = '',
    defaultManagerId = ''
}) => {
    const today = new Date().toISOString().split('T')[0];

    // Form state — all in one place
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [manager, setManager] = useState(defaultManager);
    const [managerId, setManagerId] = useState(defaultManagerId);
    const [selectedMembers, setSelectedMembers] = useState<Member[]>([]);
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);

    // Workflow list
    const [workflows, setWorkflows] = useState<WorkflowOption[]>([]);
    const [isLoadingWorkflows, setIsLoadingWorkflows] = useState(false);

    // Reset toàn bộ form mỗi khi modal mở
    useEffect(() => {
        if (!isOpen) return;
        const t = new Date().toISOString().split('T')[0];
        setName('');
        setDescription('');
        setManager(defaultManager);
        setManagerId(defaultManagerId);
        setSelectedMembers([]);
        setStartDate(t);
        setEndDate(t);
        setSelectedWorkflowId(null);

        // Load workflows và set default
        setIsLoadingWorkflows(true);
        workflowApi.getAll()
            .then((res: any) => {
                const list: WorkflowOption[] = (Array.isArray(res) ? res : (res.data ?? [])).map(
                    (w: any) => ({ id: w.id, name: w.name, description: w.description || null, isDefault: w.isDefault ?? false })
                );
                setWorkflows(list);
                const defaultWf = list.find(w => w.isDefault);
                if (defaultWf) setSelectedWorkflowId(defaultWf.id);
            })
            .catch(() => setWorkflows([]))
            .finally(() => setIsLoadingWorkflows(false));
    }, [isOpen]);

    if (!isOpen) return null;

    const isFormValid = name.trim() !== '' && managerId.trim() !== '' && selectedMembers.length > 0 && selectedWorkflowId !== null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) return;
        onSubmit({
            name,
            description,
            manager,
            members: selectedMembers.map(m => m.name).join(', '),
            leaderId: managerId,
            memberIds: selectedMembers.map(m => m.id),
            workflowId: selectedWorkflowId || undefined,
            startDate,
            endDate,
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center animate-fadeIn">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl mx-4 animate-scaleIn max-h-[90vh] overflow-y-auto">
                <div className="flex">
                    {/* ── Left: Project Form ─────────────────────────────────── */}
                    <div className="flex-1 border-r border-gray-100">
                        <div className="px-8 py-6 border-b border-gray-100 sticky top-0 bg-white z-10">
                            <h2 className="text-xl font-bold text-gray-800">Thêm Dự Án</h2>
                        </div>
                        <form onSubmit={handleSubmit} id="add-project-form" className="px-8 py-6 space-y-5">
                            {/* Tên + Mã */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-600 mb-2">Tên Dự Án <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F79E61]/50 focus:border-[#F79E61] transition-all"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 mb-2">Mã Dự Án</label>
                                    <input
                                        type="text"
                                        value={previewProjectCode(name)}
                                        disabled
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed font-mono text-sm"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">Tự động tạo từ tên dự án</p>
                                </div>
                            </div>

                            {/* Mô tả */}
                            <div>
                                <label className="block text-sm text-gray-600 mb-2">Mô Tả:</label>
                                <textarea
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F79E61]/50 focus:border-[#F79E61] transition-all resize-none"
                                />
                            </div>

                            {/* Trưởng dự án */}
                            <div>
                                <label className="block text-sm text-gray-600 mb-2">Trưởng Dự Án:</label>
                                <ManagerSearch
                                    value={manager}
                                    onChange={(n, id) => { setManager(n); setManagerId(id || ''); }}
                                />
                            </div>

                            {/* Thành viên */}
                            <div>
                                <label className="block text-sm text-gray-600 mb-2">Thành Viên:</label>
                                <MemberSelect
                                    selectedMembers={selectedMembers}
                                    onChange={setSelectedMembers}
                                />
                            </div>

                            {/* Ngày */}
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm text-gray-600 mb-2">Thời Gian Thực Hiện:</label>
                                    <DateInput
                                        name="startDate"
                                        value={startDate}
                                        min={today}
                                        onChange={setStartDate}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F79E61]/50 focus:border-[#F79E61] transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 mb-2">Thời Gian Kết Thúc:</label>
                                    <DateInput
                                        name="endDate"
                                        value={endDate}
                                        min={startDate}
                                        onChange={setEndDate}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F79E61]/50 focus:border-[#F79E61] transition-all"
                                    />
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* ── Right: Workflow ────────────────────────────────────── */}
                    <div className="w-[360px] flex flex-col">
                        <div className="px-6 py-6 border-b border-gray-100 sticky top-0 bg-white z-10">
                            <h2 className="text-xl font-bold text-gray-800">Áp dụng quy trình</h2>
                        </div>
                        <div className="px-6 py-4 flex-1 overflow-y-auto">
                            <p className="text-sm text-gray-500 mb-4">Chọn quy trình làm việc cho dự án:</p>
                            {isLoadingWorkflows ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="w-8 h-8 border-3 border-orange-200 rounded-full animate-spin border-t-[#F79E61]" />
                                </div>
                            ) : workflows.length === 0 ? (
                                <div className="text-center py-8 text-gray-400 text-sm">
                                    Chưa có quy trình nào. Vui lòng tạo workflow trước.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {workflows.map(wf => (
                                        <div
                                            key={wf.id}
                                            onClick={() => setSelectedWorkflowId(wf.id)}
                                            className={`p-4 border rounded-xl cursor-pointer transition-all hover:shadow-md ${
                                                selectedWorkflowId === wf.id
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
                                                    {wf.isDefault && (
                                                        <span className="inline-flex items-center mt-2 px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700 font-medium">
                                                            Mặc định
                                                        </span>
                                                    )}
                                                </div>
                                                {selectedWorkflowId === wf.id && (
                                                    <svg className="w-5 h-5 text-[#F79E61] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Footer ────────────────────────────────────────────────── */}
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
                        className={`px-6 py-2.5 rounded-lg transition-all shadow-md ${
                            isFormValid
                                ? 'bg-gradient-to-r from-[#F79E61] to-[#f0884a] text-white hover:from-[#e88d50] hover:to-[#e07d3a] hover:shadow-lg'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                    >
                        Thêm
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddProjectModal;
