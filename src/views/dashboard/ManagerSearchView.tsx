import type { Member } from '../../data/members.data';
interface ManagerSearchViewProps {
    isOpen: boolean;
    searchTerm: string;
    filteredMembers: Member[];
    placeholder?: string;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onFocus: () => void;
    onSelect: (member: Member) => void;
    containerRef: React.RefObject<HTMLDivElement | null>;
}
export const ManagerSearchView: React.FC<ManagerSearchViewProps> = ({
    isOpen,
    searchTerm,
    filteredMembers,
    placeholder = 'Nhập tên trưởng dự án...',
    onInputChange,
    onFocus,
    onSelect,
    containerRef,
}) => {
    return (
        <div ref={containerRef} className="relative">
            <input
                type="text"
                value={searchTerm}
                onChange={onInputChange}
                onFocus={onFocus}
                placeholder={placeholder}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F79E61]/50 focus:border-[#F79E61] transition-all"
            />
            {isOpen && searchTerm && filteredMembers.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto animate-slideDown">
                    {filteredMembers.map(member => (
                        <button
                            key={member.id}
                            type="button"
                            onClick={() => onSelect(member)}
                            className="w-full px-4 py-2.5 text-left hover:bg-orange-50 transition-colors flex items-center gap-3"
                        >
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                                {member.name.split(' ').slice(-1)[0].charAt(0)}
                            </div>
                            <div>
                                <div className="text-sm font-medium text-gray-800">{member.name}</div>
                                <div className="text-xs text-gray-500">{member.role}</div>
                            </div>
                        </button>
                    ))}
                </div>
            )}
            {isOpen && searchTerm && filteredMembers.length === 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-500 text-sm">
                    Không tìm thấy
                </div>
            )}
        </div>
    );
};
export default ManagerSearchView;
