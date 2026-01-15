import type { Member } from '../../data/members.data';
interface MemberSelectViewProps {
    isOpen: boolean;
    searchTerm: string;
    selectedMembers: Member[];
    filteredMembers: Member[];
    placeholder?: string;
    onSearchChange: (term: string) => void;
    onSelect: (member: Member) => void;
    onRemove: (memberId: string) => void;
    onContainerClick: () => void;
    onFocus: () => void;
    containerRef: React.RefObject<HTMLDivElement | null>;
    inputRef: React.RefObject<HTMLInputElement | null>;
}
export const MemberSelectView: React.FC<MemberSelectViewProps> = ({
    isOpen,
    searchTerm,
    selectedMembers,
    filteredMembers,
    placeholder = 'Thêm thành viên...',
    onSearchChange,
    onSelect,
    onRemove,
    onContainerClick,
    onFocus,
    containerRef,
    inputRef,
}) => {
    return (
        <div ref={containerRef} className="relative">
            <div
                onClick={onContainerClick}
                className="w-full min-h-[42px] px-3 py-2 border border-gray-200 rounded-lg focus-within:ring-2 focus-within:ring-[#F79E61]/50 focus-within:border-[#F79E61] transition-all bg-white cursor-text flex flex-wrap gap-2 items-center"
            >
                {selectedMembers.map(member => (
                    <span
                        key={member.id}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-50 text-orange-600 rounded-full text-sm animate-scaleIn"
                    >
                        {member.name}
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemove(member.id);
                            }}
                            className="ml-0.5 hover:text-orange-800 transition-colors text-lg leading-none"
                        >
                            ×
                        </button>
                    </span>
                ))}
                <input
                    ref={inputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    onFocus={onFocus}
                    placeholder={selectedMembers.length > 0 ? '' : placeholder}
                    className="flex-1 min-w-[120px] outline-none bg-transparent text-sm"
                />
                <span className="text-gray-400 ml-auto">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </span>
            </div>
            {isOpen && filteredMembers.length > 0 && (
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
                    Không tìm thấy thành viên
                </div>
            )}
        </div>
    );
};
export default MemberSelectView;
