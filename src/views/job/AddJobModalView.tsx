import { useState, useEffect } from 'react';
import ManagerSearch from '../../components/dashboard/ManagerSearch';
import MemberSelectView from '../../components/dashboard/MemberSelect';
import ProjectSearchDropdown from '../../components/job/ProjectSearchDropdown';
import DateInput from '../../components/common/DateInput';
import type { Member } from '../../data/members.data';
import { projectApi, type ProjectResponse } from '../../api/projectApi';

interface AddJobModalViewProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    manager: string;
    onManagerChange: (name: string, id?: string) => void;
    selectedMembers: Member[];

    onMembersChange: (members: Member[]) => void;
    startDate: string;
    endDate: string;
    estimatedHours: number;
    onStartDateChange: (date: string) => void;
    onEndDateChange: (date: string) => void;
    defaultProjectId?: string;
}
const AddJobModalView: React.FC<AddJobModalViewProps> = ({
    isOpen,
    onClose,
    onSubmit,
    manager,
    onManagerChange,
    selectedMembers,
    onMembersChange,
    startDate,
    endDate,
    estimatedHours,
    onStartDateChange,
    onEndDateChange,
    defaultProjectId,
}) => {
    const [projects, setProjects] = useState<ProjectResponse[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState(defaultProjectId || '');
    const [isLoadingProjects, setIsLoadingProjects] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsLoadingProjects(true);
            projectApi.getAll()
                .then(res => {
                    setProjects(res.data || []);
                    if (defaultProjectId) {
                        setSelectedProjectId(defaultProjectId);
                    }
                })
                .catch(err => console.error('Failed to load projects:', err))
                .finally(() => setIsLoadingProjects(false));
        }
    }, [isOpen, defaultProjectId]);

    useEffect(() => {
        if (isOpen) {
            setSelectedProjectId(defaultProjectId || '');
        }
    }, [isOpen, defaultProjectId]);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isFormValid, setIsFormValid] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Reset form when opened
            setName('');
            setDescription('');
        }
    }, [isOpen]);

    useEffect(() => {
        const isValid =
            name.trim() !== '' &&
            selectedProjectId !== '' &&
            description.trim() !== '' &&
            manager !== '' &&
            selectedMembers.length > 0;
        setIsFormValid(isValid);
    }, [name, selectedProjectId, description, manager, selectedMembers]);

    if (!isOpen) return null;
    const today = new Date().toISOString().split('T')[0];
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center animate-fadeIn">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 animate-scaleIn max-h-[90vh] overflow-y-auto">
                <div className="px-8 py-6 border-b border-gray-100 sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-bold text-gray-800">Thêm Công Việc</h2>
                </div>
                <form onSubmit={onSubmit} className="px-8 py-6 space-y-5">
                    {/* Row 1: Tên Công Việc */}
                    <div>
                        <label className="block text-sm text-gray-600 mb-2">Tên Công Việc: <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            name="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F79E61]/50 focus:border-[#F79E61] transition-all"
                        />
                    </div>
                    {/* Row 2: Loại công việc | Nhóm công việc | Dự án */}
                    <div className="grid grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm text-gray-600 mb-2">Loại công việc:</label>
                            <select
                                name="type"
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F79E61]/50 focus:border-[#F79E61] transition-all"
                            >
                                <option value="Task">Task</option>
                                <option value="Bug">Bug</option>
                                <option value="Feature">Feature</option>
                                <option value="Improvement">Improvement</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-2">Nhóm công việc:</label>
                            <select
                                name="group"
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F79E61]/50 focus:border-[#F79E61] transition-all"
                            >
                                <option value="Backend">Backend</option>
                                <option value="Frontend">Frontend</option>
                                <option value="Design">Design</option>
                                <option value="Testing">Testing</option>
                                <option value="UI/UX">UI/UX</option>
                                <option value="Database">Database</option>
                                <option value="Documentation">Documentation</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-2">Dự án: <span className="text-red-500">*</span></label>
                            <ProjectSearchDropdown
                                projects={projects}
                                selectedProjectId={selectedProjectId}
                                onSelect={setSelectedProjectId}
                                isLoading={isLoadingProjects}
                            />
                            <input type="hidden" name="projectId" value={selectedProjectId} />
                        </div>
                    </div>
                    {/* Row 3: Mô Tả */}
                    <div>
                        <label className="block text-sm text-gray-600 mb-2">Mô Tả: <span className="text-red-500">*</span></label>
                        <textarea
                            name="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F79E61]/50 focus:border-[#F79E61] transition-all resize-none"
                        ></textarea>
                    </div>
                    {/* Row 4: Người giao | Người được giao */}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm text-gray-600 mb-2">Người giao: <span className="text-red-500">*</span></label>
                            <ManagerSearch
                                value={manager}
                                onChange={onManagerChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-2">Người được giao: <span className="text-red-500">*</span></label>
                            <MemberSelectView
                                selectedMembers={selectedMembers}
                                onChange={onMembersChange}
                            />
                        </div>
                    </div>
                    {/* Row 5: Thời Gian Thực Hiện | Thời Gian Kết Thúc */}
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
                    {/* Row 6: Thời Gian Dự Kiến | Mức độ ưu tiên */}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm text-gray-600 mb-2">Thời Gian Dự Kiến:</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    name="estimatedHours"
                                    value={estimatedHours}
                                    readOnly
                                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                                />
                                <span className="text-sm text-gray-600">giờ</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Tự động tính toán: {Math.ceil(estimatedHours / 8)} ngày làm việc (8 giờ/ngày, không tính cuối tuần)
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-2">Mức độ ưu tiên:</label>
                            <select
                                name="priority"
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F79E61]/50 focus:border-[#F79E61] transition-all"
                            >
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                                <option value="Highest">Highest</option>
                            </select>
                        </div>
                    </div>
                    {/* Buttons */}
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-all"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={!isFormValid}
                            className={`px-6 py-2.5 rounded-lg transition-all shadow-md text-white ${isFormValid
                                ? 'bg-gradient-to-r from-[#F79E61] to-[#f0884a] hover:from-[#e88d50] hover:to-[#e07d3a] hover:shadow-lg cursor-pointer'
                                : 'bg-gray-300 cursor-not-allowed shadow-none'
                                }`}
                        >
                            Thêm
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default AddJobModalView;
