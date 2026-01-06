import { useState, useRef, useEffect } from 'react';
import type { Member } from '../../data/members.data';
import { mockMembers } from '../../data';
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
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    const filteredMembers = mockMembers.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
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
