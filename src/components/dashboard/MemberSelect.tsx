import { useState, useRef, useEffect } from 'react';
import type { Member } from '../../data/members.data';
import { userApi } from '../../features/user/infrastructure/user.api';
import { MemberSelectView } from '../../features/dashboard';
interface MemberSelectProps {
    selectedMembers: Member[];
    onChange: (members: Member[]) => void;
    placeholder?: string;
}
const MemberSelect: React.FC<MemberSelectProps> = ({
    selectedMembers,
    onChange,
    placeholder = 'Thêm thành viên...'
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<Member[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Fetch members when search term changes
    useEffect(() => {
        const fetchMembers = async () => {
            try {
                // Use employeeApi to search or get all
                const users = searchTerm
                    ? await userApi.search(searchTerm)
                    : await userApi.getAll();
                const mappedMembers: Member[] = users.map(emp => ({
                    id: emp.id,
                    name: emp.name,
                    role: 'Member' as const,
                    avatar: emp.avatarUrl || undefined,
                    status: 'Đã đăng ký' as const,
                    createdAt: new Date().toLocaleDateString('vi-VN'),
                }));

                setSearchResults(mappedMembers);
            } catch (error) {
                console.error("Failed to fetch members", error);
                setSearchResults([]);
            }
        };

        const timeoutId = setTimeout(fetchMembers, 300); // Debounce
        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredMembers = searchResults.filter(member =>
        !selectedMembers.some(s => s.id === member.id)
    );

    const handleSelect = (member: Member) => {
        onChange([...selectedMembers, member]);
        setSearchTerm('');
        inputRef.current?.focus();
    };

    const handleRemove = (memberId: string) => {
        onChange(selectedMembers.filter(m => m.id !== memberId));
    };

    const handleContainerClick = () => {
        inputRef.current?.focus();
        setIsOpen(true);
    };

    const handleSearchChange = (term: string) => {
        setSearchTerm(term);
        setIsOpen(true);
    };

    return (
        <MemberSelectView
            isOpen={isOpen}
            searchTerm={searchTerm}
            selectedMembers={selectedMembers}
            filteredMembers={filteredMembers}
            placeholder={placeholder}
            onSearchChange={handleSearchChange}
            onSelect={handleSelect}
            onRemove={handleRemove}
            onContainerClick={handleContainerClick}
            onFocus={() => setIsOpen(true)}
            containerRef={containerRef}
            inputRef={inputRef}
        />
    );
};
export default MemberSelect;

