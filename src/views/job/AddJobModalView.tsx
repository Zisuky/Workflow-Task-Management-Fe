import ManagerSearch from '../../components/dashboard/ManagerSearch';
import MemberSelectView from '../../components/dashboard/MemberSelect';
import type { Member } from '../../data/members.data';
interface AddJobModalViewProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    manager: string;
    onManagerChange: (value: string) => void;
    selectedMembers: Member[];
    onMembersChange: (members: Member[]) => void;
    startDate: string;
    endDate: string;
    estimatedHours: number;
    onStartDateChange: (date: string) => void;
    onEndDateChange: (date: string) => void;
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
}) => {
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
                        <label className="block text-sm text-gray-600 mb-2">Tên Công Việc: *</label>
                        <input
                            type="text"
                            name="name"
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
                            <label className="block text-sm text-gray-600 mb-2">Dự án:</label>
                            <input
                                type="text"
                                name="project"
                                defaultValue="Dự án"
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F79E61]/50 focus:border-[#F79E61] transition-all"
                            />
                        </div>
                    </div>
                    {/* Row 3: Mô Tả */}
                    <div>
                        <label className="block text-sm text-gray-600 mb-2">Mô Tả:</label>
                        <textarea
                            name="description"
                            rows={3}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F79E61]/50 focus:border-[#F79E61] transition-all resize-none"
                        ></textarea>
                    </div>
                    {/* Row 4: Người giao | Người được giao */}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm text-gray-600 mb-2">Người giao:</label>
                            <ManagerSearch
                                value={manager}
                                onChange={onManagerChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-2">Người được giao:</label>
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
                            <input
                                type="date"
                                name="startDate"
                                value={startDate}
                                min={today}
                                onChange={(e) => onStartDateChange(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F79E61]/50 focus:border-[#F79E61] transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-2">Thời Gian Kết Thúc:</label>
                            <input
                                type="date"
                                name="endDate"
                                value={endDate}
                                min={startDate}
                                onChange={(e) => onEndDateChange(e.target.value)}
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
                            className="px-6 py-2.5 rounded-lg transition-all shadow-md bg-gradient-to-r from-[#F79E61] to-[#f0884a] text-white hover:from-[#e88d50] hover:to-[#e07d3a] hover:shadow-lg"
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
