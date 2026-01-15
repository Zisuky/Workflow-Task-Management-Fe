import { useState } from 'react';
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
    const [searchQuery, setSearchQuery] = useState('');

    if (!isOpen) return null;

    const handleTemplateClick = (templateId: string) => {
        if (selectedTemplateId === templateId) {
            onTemplateChange(null);
        } else {
            onTemplateChange(templateId);
        }
    };

    const filteredTemplates = mockWorkflowTemplates.filter(template =>
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                    <div className="w-[360px] flex flex-col max-h-[80vh]">
                        <div className="px-6 py-6 border-b border-gray-100 sticky top-0 bg-white z-10">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Áp dụng quy trình mẫu</h2>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Tìm kiếm quy trình..."
                                    className="w-full px-4 py-2.5 pl-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F79E61]/50 focus:border-[#F79E61] transition-all text-sm"
                                />
                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="px-6 py-4 flex-1 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 180px)' }}>
                            <p className="text-sm text-gray-500 mb-4">Các quy trình mẫu ({filteredTemplates.length}):</p>
                            <div className="space-y-3">
                                {filteredTemplates.length === 0 ? (
                                    <div className="text-center py-8 text-gray-400">
                                        <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="text-sm">Không tìm thấy quy trình phù hợp</p>
                                    </div>
                                ) : (
                                    filteredTemplates.map((template) => (
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
                                            </div>
                                        </div>
                                    ))
                                )}
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
