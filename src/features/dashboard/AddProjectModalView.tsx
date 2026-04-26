import type { Member } from '../../data/members.data';
import DateInput from '../../components/common/DateInput';
import { mockWorkflowTemplates } from '../../data/workflow-templates.data';

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
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F79E61]/50 focus:border-[#F79E61] transition-all"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 mb-2">Mã Dự Án <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        name="code"
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F79E61]/50 focus:border-[#F79E61] transition-all"
                                    />
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
                            <h2 className="text-xl font-bold text-gray-800">Áp dụng quy trình mẫu</h2>
                        </div>
                        <div className="px-6 py-4 flex-1 overflow-y-auto">
                            <p className="text-sm text-gray-500 mb-4">Các quy trình mẫu:</p>
                            <div className="space-y-3">
                                {mockWorkflowTemplates.map((template) => (
                                    <div
                                        key={template.id}
                                        onClick={() => handleTemplateClick(template.id)}
                                        className={`p-4 border rounded-xl cursor-pointer transition-all hover:shadow-md ${selectedTemplateId === template.id
                                            ? 'border-[#F79E61] bg-[#FFF8F3] ring-2 ring-[#F79E61]/20'
                                            : 'border-gray-200 bg-white hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#1e3a5f] to-[#2d5a87] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                                {template.code}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-gray-800 text-sm">{template.name}</h4>
                                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{template.description}</p>
                                                <div className="flex gap-2 mt-2">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
                                                        {template.stagesCount} giai đoạn
                                                    </span>
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
                                                        {template.tasksCount} công việc mẫu
                                                    </span>
                                                </div>
                                            </div>
                                            {selectedTemplateId === template.id && (
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
