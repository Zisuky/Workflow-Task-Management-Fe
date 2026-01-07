import type { Member } from '../../data/members.data';
interface AddProjectModalViewProps {
    isOpen: boolean;
    isFormValid: boolean;
    manager: string;
    startDate: string;
    endDate: string;
    today: string;
    selectedMembers: Member[];
    onClose: () => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    onManagerChange: (name: string, id?: string) => void;
    onMembersChange: (members: Member[]) => void;
    onStartDateChange: (date: string) => void;
    onEndDateChange: (date: string) => void;
}
const AddProjectModalView: React.FC<AddProjectModalViewProps> = ({
    isOpen,
    isFormValid,
    manager,
    startDate,
    endDate,
    today,
    selectedMembers,
    onClose,
    onSubmit,
    onManagerChange,
    onMembersChange,
    onStartDateChange,
    onEndDateChange,
}) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center animate-fadeIn">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 animate-scaleIn max-h-[90vh] overflow-y-auto">
                <div className="px-8 py-6 border-b border-gray-100 sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-bold text-gray-800">Thêm Dự Án</h2>
                </div>
                <form onSubmit={onSubmit} className="px-8 py-6 space-y-5">
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label className="block text-sm text-gray-600 mb-2">Tên Dự Án: *</label>
                            <input
                                type="text"
                                name="name"
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F79E61]/50 focus:border-[#F79E61] transition-all"
                                required
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
                            className={`px-6 py-2.5 rounded-lg transition-all shadow-md ${isFormValid
                                ? 'bg-gradient-to-r from-[#F79E61] to-[#f0884a] text-white hover:from-[#e88d50] hover:to-[#e07d3a] hover:shadow-lg'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                        >
                            Thêm
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
import ManagerSearchView from '../../components/dashboard/ManagerSearch';
import MemberSelectView from '../../components/dashboard/MemberSelect';
export default AddProjectModalView;
