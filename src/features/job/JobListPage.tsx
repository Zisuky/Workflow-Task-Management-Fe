import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { jobService } from '../../services/job.service';
import type { Job } from '../../models';
import JobListView from './JobListView';
const JobListPage: React.FC = () => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [allJobs, setAllJobs] = useState<Job[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const navigate = useNavigate();
    const location = useLocation();

    const projectId = location.state?.projectId as string | undefined;

    const loadJobs = useCallback(async () => {
        setIsLoading(true);
        let data: Job[];
        if (projectId) {
            data = await jobService.getJobsByProject(projectId);
        } else {
            data = await jobService.getJobs();
        }
        setAllJobs(data);
        setIsLoading(false);
    }, [projectId]);

    useEffect(() => {
        loadJobs();
    }, [loadJobs]);
    const [filters, setFilters] = useState({
        priority: '',
        group: '',
        status: '',
        manager: '',
        assignee: ''
    });

    const [filterOptions, setFilterOptions] = useState({
        priorities: [] as string[],
        groups: [] as string[],
        statuses: [] as string[],
        managers: [] as string[],
        assignees: [] as string[]
    });



    useEffect(() => {
        if (allJobs.length > 0) {
            const priorities = [...new Set(allJobs.map(j => j.priority).filter(Boolean))].sort();
            const groups = [...new Set(allJobs.map(j => j.group).filter(Boolean))].sort();
            const statuses = [...new Set(allJobs.map(j => j.status).filter(Boolean))].sort();
            const managers = [...new Set(allJobs.flatMap(j => j.manager?.split(',').map(s => s.trim()) || []).filter(Boolean))].sort();
            const assignees = [...new Set(allJobs.flatMap(j => j.assignee?.split(',').map(s => s.trim()) || []).filter(Boolean))].sort();

            setFilterOptions({ priorities, groups, statuses, managers, assignees });
        }
    }, [allJobs]);

    useEffect(() => {
        let filtered = allJobs;

        if (searchTerm) {
            filtered = filtered.filter(job =>
                job.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                job.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                job.project?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (filters.priority) {
            filtered = filtered.filter(job => job.priority === filters.priority);
        }
        if (filters.group) {
            filtered = filtered.filter(job => job.group === filters.group);
        }
        if (filters.status) {
            filtered = filtered.filter(job => job.status === filters.status);
        }
        if (filters.manager) {
            filtered = filtered.filter(job => job.manager?.split(',').map(s => s.trim()).includes(filters.manager));
        }
        if (filters.assignee) {
            filtered = filtered.filter(job => job.assignee?.split(',').map(s => s.trim()).includes(filters.assignee));
        }

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        setJobs(filtered.slice(startIndex, endIndex));
    }, [allJobs, searchTerm, currentPage, itemsPerPage, filters]);

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setCurrentPage(1);
    };

    const handleSearchChange = (term: string) => {
        setSearchTerm(term);
        setCurrentPage(1);
    };

    const handleItemsPerPageChange = (count: number) => {
        setItemsPerPage(count);
        setCurrentPage(1);
    };

    const getFilteredCount = () => {
        let filtered = allJobs;
        if (searchTerm) {
            filtered = filtered.filter(job =>
                job.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                job.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                job.project?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (filters.priority) filtered = filtered.filter(job => job.priority === filters.priority);
        if (filters.group) filtered = filtered.filter(job => job.group === filters.group);
        if (filters.status) filtered = filtered.filter(job => job.status === filters.status);
        if (filters.manager) filtered = filtered.filter(job => job.manager === filters.manager);
        if (filters.assignee) filtered = filtered.filter(job => job.assignee === filters.assignee);

        return filtered.length;
    };

    const filteredCount = getFilteredCount();
    const handleJobClick = (jobId: string) => {
        navigate(`/job/${jobId}`);
    };
    return (
        <JobListView
            jobs={jobs}
            isLoading={isLoading}
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            totalCount={filteredCount}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={handleItemsPerPageChange}
            onJobClick={handleJobClick}
            filters={filters}
            onFilterChange={handleFilterChange}
            filterOptions={filterOptions}
        />
    );
};
export default JobListPage;
