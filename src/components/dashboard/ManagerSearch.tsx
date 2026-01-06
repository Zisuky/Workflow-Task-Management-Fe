import { useState, useRef, useEffect } from 'react';
import type { Member } from '../../data/members.data';
import { mockMembers } from '../../data';
import { ManagerSearchView } from '../../views/dashboard/ManagerSearchView';
interface ManagerSearchProps {
    value: string;
    onChange: (name: string) => void;
    placeholder?: string;
}
const ManagerSearch: React.FC<ManagerSearchProps> = ({
    value,
    onChange,
    placeholder = 'Nhập tên trưởng dự án...'
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState(value);
    const containerRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        setSearchTerm(value);
    }, [value]);
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
        member.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const handleSelect = (member: Member) => {
        setSearchTerm(member.name);
        onChange(member.name);
        setIsOpen(false);
    };
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        onChange(e.target.value);
        setIsOpen(true);
    };
    return (
        <ManagerSearchView
            isOpen={isOpen}
            searchTerm={searchTerm}
            filteredMembers={filteredMembers}
            placeholder={placeholder}
            onInputChange={handleInputChange}
            onFocus={() => setIsOpen(true)}
            onSelect={handleSelect}
            containerRef={containerRef}
        />
    );
};
export default ManagerSearch;
