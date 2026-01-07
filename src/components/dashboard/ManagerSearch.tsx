import { useState, useRef, useEffect } from 'react';
import type { Member } from '../../data/members.data';
import { employeeApi } from '../../api/employeeApi';
import { ManagerSearchView } from '../../views/dashboard/ManagerSearchView';

interface ManagerSearchProps {
    value: string;
    onChange: (name: string, id?: string) => void;
    placeholder?: string;
}

const ManagerSearch: React.FC<ManagerSearchProps> = ({
    value,
    onChange,
    placeholder = 'Nhập tên trưởng dự án...'
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState(value);
    const [searchResults, setSearchResults] = useState<Member[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setSearchTerm(value);
    }, [value]);

    // Fetch employees when search term changes
    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                // Use employeeApi to search or get all
                const employees = searchTerm
                    ? await employeeApi.search(searchTerm)
                    : await employeeApi.getAll();

                // Map Employee to Member interface
                const mappedMembers: Member[] = employees.map(emp => ({
                    id: emp.id,
                    name: emp.name,
                    role: emp.position_id || 'Member', // Fallback role
                    avatar: emp.avatar_id || undefined,
                }));

                setSearchResults(mappedMembers);
            } catch (error) {
                console.error("Failed to fetch employees", error);
                setSearchResults([]);
            }
        };

        const timeoutId = setTimeout(fetchEmployees, 300); // Debounce
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
        member.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (member: Member) => {
        setSearchTerm(member.name);
        onChange(member.name, member.id);
        setIsOpen(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setSearchTerm(newValue);
        onChange(newValue); // Clear id when user types manually
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
