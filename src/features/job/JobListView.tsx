import { useState, useEffect, useRef } from 'react';
import type { Job, JobStatus, JobPriority } from '../../models';
import { EditableSelect } from '../../components/ui/EditableSelect';
interface ColumnConfig {
    key: string;
    label: string;
    visible: boolean;
}
interface FilterDropdownProps {
    label: string;
    options: string[];
    isActive?: boolean;
    onSelect?: (value: string) => void;
}
interface ColumnSelectorProps {
    columns: ColumnConfig[];
    onToggle: (key: string) => void;
    visibleCount: number;
}
const ColumnSelector: React.FC<ColumnSelectorProps> = ({ columns, onToggle, visibleCount }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-3 py-2 bg-[#46c690] text-white font-normal rounded-lg text-sm">
                <span className="truncate font-normal">Tổng Hợp ({visibleCount}/12)</span>

                <svg className="w-4 h-4 ml-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {isOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[500px]">
                    <div className="p-3">
                        <div className="text-sm font-medium text-gray-700 mb-3">HIỂN THỊ CỘT</div>
                        <div className="grid grid-cols-3 gap-2">
                            {columns.map((column) => (
                                <label key={column.key} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            checked={column.visible}
                                            onChange={() => onToggle(column.key)}
                                            className="sr-only"
                                        />
                                        <div className={`w-5 h-5 border-2 rounded flex items-center justify-center ${column.visible
                                            ? 'bg-blue-500 border-blue-500'
                                            : 'border-gray-300'
                                            }`}>
                                            {column.visible && (
                                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-sm text-gray-700 whitespace-nowrap">{column.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
const FilterDropdown: React.FC<FilterDropdownProps> = ({ label, options, isActive = false, onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    const handleSelect = (value: string) => {
        setSelectedValue(value === '' ? null : value);
        onSelect?.(value);
        setIsOpen(false);
    };
    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${isActive
                    ? 'bg-[#46c690] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
            >
                <span className="truncate">{selectedValue || label}</span>
                <svg className="w-4 h-4 ml-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {isOpen && options.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                    <div className="py-1">
                        <button
                            onClick={() => handleSelect('')}
                            className="w-full px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                            Tất cả
                        </button>
                        {options.map((option) => (
                            <button
                                key={option}
                                onClick={() => handleSelect(option)}
                                className="w-full px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
interface FilterState {
    priority: string;
    group: string;
    status: string;
    manager: string;
    assignee: string;
}

interface FilterOptions {
    priorities: string[];
    groups: string[];
    statuses: string[];
    managers: string[];
    assignees: string[];
}

interface JobListViewProps {
    jobs: Job[];
    isLoading: boolean;
    searchTerm: string;
    onSearchChange: (term: string) => void;
    totalCount: number;
    currentPage: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    onItemsPerPageChange: (count: number) => void;
    onJobClick?: (jobId: string) => void;
    filters: FilterState;
    onFilterChange: (key: string, value: string) => void;
    filterOptions: FilterOptions;
}

const statusColors: Record<JobStatus, string> = {
    'To Do': 'bg-gray-500 text-white',
    'In Progress': 'bg-orange-500 text-white',
    'In Review': 'bg-blue-500 text-white',
    'Blocked': 'bg-red-500 text-white',
    'Done': 'bg-green-500 text-white',
    'On Hold': 'bg-yellow-500 text-white',
};

const priorityColors: Record<JobPriority, string> = {
    'Low': 'bg-gray-500 text-white',
    'Medium': 'bg-blue-500 text-white',
    'High': 'bg-orange-500 text-white',
    'Highest': 'bg-red-500 text-white',
};

const formatDateTime = (dateString: string | undefined): string => {
    if (!dateString) return '-';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch {
        return dateString;
    }
};

const COLUMNS_STORAGE_KEY = 'jobListColumns';

const defaultColumns: ColumnConfig[] = [
    { key: 'code', label: 'Mã công việc', visible: true },
    { key: 'name', label: 'Tên công việc', visible: false },
    { key: 'project', label: 'Dự án', visible: false },
    { key: 'type', label: 'Loại công việc', visible: true },
    { key: 'group', label: 'Nhóm công việc', visible: false },
    { key: 'status', label: 'Trạng thái', visible: true },
    { key: 'manager', label: 'Người phụ trách', visible: false },
    { key: 'assignee', label: 'Người thực hiện', visible: false },
    { key: 'priority', label: 'Mức độ ưu tiên', visible: false },
    { key: 'startDate', label: 'Thời gian bắt đầu', visible: false },
    { key: 'estimatedHours', label: 'Thời gian dự kiến', visible: true },
    { key: 'endDate', label: 'Thời gian kết thúc', visible: false },
];

const getInitialColumns = (): ColumnConfig[] => {
    try {
        const saved = localStorage.getItem(COLUMNS_STORAGE_KEY);
        if (saved) {
            const savedColumns = JSON.parse(saved) as ColumnConfig[];
            return defaultColumns.map(col => {
                const savedCol = savedColumns.find(s => s.key === col.key);
                return savedCol ? { ...col, visible: savedCol.visible } : col;
            });
        }
    } catch (error) {
        console.error('Error loading saved columns:', error);
    }
    return defaultColumns;
};

const JobListView: React.FC<JobListViewProps> = ({
    jobs,
    isLoading,
    searchTerm,
    onSearchChange,
    currentPage,
    itemsPerPage,
    onPageChange,
    onItemsPerPageChange,
    onJobClick,
    filters,
    onFilterChange,
    filterOptions,
    totalCount, // Added
}) => {
    const [columns, setColumns] = useState<ColumnConfig[]>(getInitialColumns);


    const totalPages = Math.ceil(totalCount / itemsPerPage);
    const visibleColumns = columns.filter(col => col.visible);
    const visibleCount = visibleColumns.length;

    const toggleColumn = (key: string) => {
        setColumns(prev => {
            const updated = prev.map(col =>
                col.key === key ? { ...col, visible: !col.visible } : col
            );
            try {
                localStorage.setItem(COLUMNS_STORAGE_KEY, JSON.stringify(updated));
            } catch (error) {
                console.error('Error saving columns:', error);
            }
            return updated;
        });
    };

    const renderCellContent = (job: Job, columnKey: string) => {
        switch (columnKey) {
            case 'code':
                return <span className="text-[#F79E61] font-medium">{job.code}</span>;
            case 'name':
                return <span className="text-gray-800">{job.name}</span>;
            case 'project':
                return <span className="text-gray-600">{job.project || 'Dự án'}</span>;
            case 'type':
                return <span className="text-gray-600">{job.type}</span>;
            case 'group':
                return <span className="text-gray-600">{job.group}</span>;
            case 'status':
                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[job.status]}`}>
                        {job.status}
                    </span>
                );
            case 'manager':
                return <span className="text-gray-600">{job.manager}</span>;
            case 'assignee':
                return <span className="text-gray-600">{job.assignee}</span>;
            case 'priority':
                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[job.priority]}`}>
                        {job.priority}
                    </span>
                );
            case 'startDate':
                return <span className="text-gray-600 whitespace-nowrap">{formatDateTime(job.startDate)}</span>;
            case 'estimatedHours':
                return <span className="text-gray-600">{job.estimatedHours} giờ</span>;
            case 'endDate':
                return <span className="text-gray-600 whitespace-nowrap">{formatDateTime(job.endDate)}</span>;
            default:
                return null;
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-orange-200 rounded-full animate-spin border-t-[#F79E61]"></div>
                    <span className="text-gray-500 animate-pulse">Đang tải...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fadeIn">
            {/* Search and Filters - Same Row, Full Width */}
            <div className="mb-6">
                <div className="flex items-center gap-3">
                    {/* Search Bar - 1/4 width */}
                    <div className="relative w-1/4">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </span>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            placeholder="Tìm kiếm"
                            className="w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F79E61]/50 focus:border-[#F79E61]"
                        />
                    </div>

                    {/* Filter Buttons - 3/4 width, divided equally */}
                    <div className="flex-1 grid grid-cols-6 gap-3">
                        <ColumnSelector
                            columns={columns}
                            onToggle={toggleColumn}
                            visibleCount={visibleCount}
                        />
                        <FilterDropdown
                            label="Mức độ ưu tiên"
                            options={filterOptions.priorities}
                            isActive={!!filters.priority}
                            onSelect={(value) => onFilterChange('priority', value)}
                        />
                        <EditableSelect
                            label="Nhóm công việc"
                            value={filters.group}
                            options={filterOptions.groups}
                            onSelect={(value) => onFilterChange('group', value)}
                        />
                        <FilterDropdown
                            label="Trạng thái"
                            options={filterOptions.statuses}
                            isActive={!!filters.status}
                            onSelect={(value) => onFilterChange('status', value)}
                        />
                        <EditableSelect
                            label="Người phụ trách"
                            value={filters.manager}
                            options={filterOptions.managers}
                            onSelect={(value) => onFilterChange('manager', value)}
                        />
                        <EditableSelect
                            label="Người thực hiện"
                            value={filters.assignee}
                            options={filterOptions.assignees}
                            onSelect={(value) => onFilterChange('assignee', value)}
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gradient-to-r from-[#F79E61] to-[#f0884a] text-white text-sm">
                                {visibleColumns.map((column) => (
                                    <th key={column.key} className="px-4 py-3 text-left font-semibold">
                                        {column.label.toUpperCase()}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {jobs.map((job, index) => (
                                <tr
                                    key={job.id || `job-${index}`}
                                    onClick={() => onJobClick?.(job.id)}
                                    className="hover:bg-orange-50/50 transition-colors cursor-pointer"
                                >
                                    {visibleColumns.map((column, colIndex) => (
                                        <td key={`${job.id || index}-${column.key || colIndex}`} className="px-4 py-3 text-sm">
                                            {renderCellContent(job, column.key)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-end gap-4 px-4 py-3 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>Tổng {totalCount}</span>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                            className="px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:border-[#F79E61]"
                        >
                            <option value={10}>10/trang</option>
                            <option value={20}>20/trang</option>
                            <option value={50}>50/trang</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => onPageChange(1)}
                            disabled={currentPage === 1}
                            className="px-2 py-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        >
                            «
                        </button>
                        <button
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-2 py-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        >
                            ‹
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => onPageChange(page)}
                                className={`w-8 h-8 rounded text-sm ${currentPage === page
                                    ? 'bg-[#F79E61] text-white'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                {page}
                            </button>
                        ))}
                        <button
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-2 py-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        >
                            ›
                        </button>
                        <button
                            onClick={() => onPageChange(totalPages)}
                            disabled={currentPage === totalPages}
                            className="px-2 py-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        >
                            »
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default JobListView;
