import { useEffect, useCallback, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { taskRepository as jobService } from '../task/infrastructure/task.repository';
import type { Job } from '../../shared/types/task';
import { useTaskStore } from '../task/application/task.store';
import JobListView from './JobListView';

const JobListPage: React.FC = () => {
    const jobs = useTaskStore(state => state.jobs);
    const allJobs = useTaskStore(state => state.allJobs);
    const searchTerm = useTaskStore(state => state.searchTerm);
    const currentPage = useTaskStore(state => state.currentPage);
    const itemsPerPage = useTaskStore(state => state.itemsPerPage);
    const isLoading = useTaskStore(state => state.isLoading);
    const setJobs = useTaskStore(state => state.setJobs);
    const setAllJobs = useTaskStore(state => state.setAllJobs);
    const setSearchTerm = useTaskStore(state => state.setSearchTerm);
    const setCurrentPage = useTaskStore(state => state.setCurrentPage);
    const setItemsPerPage = useTaskStore(state => state.setItemsPerPage);
    const setLoading = useTaskStore(state => state.setLoading);

    const navigate = useNavigate();
    const location = useLocation();
    const projectId = location.state?.projectId as string | undefined;

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

    const loadJobs = useCallback(async () => {
        setLoading(true);
        const data: Job[] = projectId ? await jobService.getJobsByProject(projectId) : await jobService.getJobs();
        setAllJobs(data);
        setLoading(false);
    }, [projectId, setAllJobs, setLoading]);

    useEffect(() => {
        loadJobs();
    }, [loadJobs]);

    useEffect(() => {
        if (allJobs.length > 0) {
            const priorities = [...new Set(allJobs.map(j => j.priority).filter(Boolean))].sort();
            const groups = [...new Set(allJobs.map(j => j.group).filter(Boolean))].sort();
            const statuses = [...new Set(allJobs.map(j => j.status).filter(Boolean))].sort();
            const managers = [...new Set(allJobs.flatMap(j => j.manager?.split(',').map((s: string) => s.trim()) || []).filter(Boolean))].sort();
            const assignees = [...new Set(allJobs.flatMap(j => j.assignee?.split(',').map((s: string) => s.trim()) || []).filter(Boolean))].sort();

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

        if (filters.priority) filtered = filtered.filter(job => job.priority === filters.priority);
        if (filters.group) filtered = filtered.filter(job => job.group === filters.group);
        if (filters.status) filtered = filtered.filter(job => job.status === filters.status);
        if (filters.manager) filtered = filtered.filter(job => job.manager?.split(',').map((s: string) => s.trim()).includes(filters.manager));
        if (filters.assignee) filtered = filtered.filter(job => job.assignee?.split(',').map((s: string) => s.trim()).includes(filters.assignee));

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        setJobs(filtered.slice(startIndex, endIndex));
    }, [allJobs, searchTerm, currentPage, itemsPerPage, filters, setJobs]);

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

    const filteredCount = (() => {
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
    })();

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
