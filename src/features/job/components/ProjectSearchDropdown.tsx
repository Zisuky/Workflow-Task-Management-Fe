import { useState, useRef, useEffect } from 'react';
import type { ProjectResponse } from '../../../api/projectApi';

interface ProjectSearchDropdownProps {
    projects: ProjectResponse[];
    selectedProjectId: string;
    onSelect: (id: string) => void;
    isLoading?: boolean;
}

const ProjectSearchDropdown: React.FC<ProjectSearchDropdownProps> = ({
    projects,
    selectedProjectId,
    onSelect,
    isLoading = false,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedProject = projects.find(p => p.id === selectedProjectId);

    useEffect(() => {
        if (selectedProject) {
            setSearchTerm(selectedProject.name);
        } else {
            setSearchTerm('');
        }
    }, [selectedProject]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                if (selectedProject) {
                    setSearchTerm(selectedProject.name);
                }
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [selectedProject]);

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.projectCode?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleInputChange = (value: string) => {
        setSearchTerm(value);
        setIsOpen(true);
        if (value === '') {
            onSelect('');
        }
    };

    const handleSelect = (project: ProjectResponse) => {
        onSelect(project.id);
        setSearchTerm(project.name);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleInputChange(e.target.value)}
                onFocus={() => setIsOpen(true)}
                placeholder={isLoading ? 'Đang tải...' : 'Chọn dự án'}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F79E61]/50 focus:border-[#F79E61] transition-all"
            />
            {isOpen && !isLoading && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filteredProjects.length > 0 ? (
                        filteredProjects.map(project => (
                            <button
                                key={project.id}
                                type="button"
                                onClick={() => handleSelect(project)}
                                className={`w-full px-4 py-2.5 text-left text-sm hover:bg-orange-50 transition-colors flex items-center justify-between ${selectedProjectId === project.id ? 'bg-orange-50 text-[#F79E61]' : 'text-gray-700'
                                    }`}
                            >
                                <span className="font-medium">{project.name}</span>
                                {project.projectCode && (
                                    <span className="text-xs text-gray-400">{project.projectCode}</span>
                                )}
                            </button>
                        ))
                    ) : (
                        <div className="px-4 py-2.5 text-sm text-gray-500">
                            Không tìm thấy dự án
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProjectSearchDropdown;
