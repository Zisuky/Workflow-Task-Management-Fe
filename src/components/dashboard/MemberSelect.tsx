import { useState, useRef, useEffect } from 'react';
import type { Member } from '../../data/members.data';
import { employeeApi } from '../../api/employeeApi';
import { MemberSelectView } from '../../views/dashboard/MemberSelectView';
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
                const employees = searchTerm
                    ? await employeeApi.search(searchTerm)
                    : await employeeApi.getAll();

                // Map Employee to Member interface if slightly different, 
                // assuming Member interface matches or is compatible.
                // Based on previous code, Member likely has id, name, role/department.
                // Employee has id, name, position_id, avatar_id.
                // We might need to map it correctly. 
                // Let's assume for now we map directly or simple mapping.
                // Actually Member interface from data/members.data usually has role.
                // Employee has position_id. Let's map position_id or a default role.

                const mappedMembers: Member[] = employees.map(emp => ({
                    id: emp.id,
                    name: emp.name,
                    role: emp.position_id || 'Member', // Fallback role
                    avatar: emp.avatar_id || undefined,
                    email: '' // Add if required by Member interface
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
