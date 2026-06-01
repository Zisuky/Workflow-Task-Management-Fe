import { useEffect, useCallback, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { taskRepository as taskService } from '../task/infrastructure/task.repository';
import type { Task } from '../../shared/types/task';
import { useTaskStore } from '../task/application/task.store';
import TaskListView from './TaskListView';

const TaskListPage: React.FC = () => {
    const tasks = useTaskStore(state => state.tasks);
    const allTasks = useTaskStore(state => state.allTasks);
    const searchTerm = useTaskStore(state => state.searchTerm);
    const currentPage = useTaskStore(state => state.currentPage);
    const itemsPerPage = useTaskStore(state => state.itemsPerPage);
    const isLoading = useTaskStore(state => state.isLoading);
    const setTasks = useTaskStore(state => state.setTasks);
    const setAllTasks = useTaskStore(state => state.setAllTasks);
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

    const loadTasks = useCallback(async () => {
        setLoading(true);
        try {
            const data: Task[] = projectId ? await taskService.getTasksByProject(projectId) : await taskService.getTasks();
            setAllTasks(data);
        } catch (error) {
            console.error('Failed to load tasks:', error);
            setAllTasks([]);
        } finally {
            setLoading(false);
        }
    }, [projectId, setAllTasks, setLoading]);

    useEffect(() => {
        loadTasks();
    }, [loadTasks]);

    useEffect(() => {
        if (allTasks.length > 0) {
            const priorities = [...new Set(allTasks.map(j => j.priority).filter(Boolean))].sort();
            const groups = [...new Set(allTasks.map(j => j.group).filter(Boolean))].sort();
            const statuses = [...new Set(allTasks.map(j => j.status).filter(Boolean))].sort();
            const managers = [...new Set(allTasks.flatMap(j => j.manager?.split(',').map((s: string) => s.trim()) || []).filter(Boolean))].sort();
            const assignees = [...new Set(allTasks.flatMap(j => j.assignee?.split(',').map((s: string) => s.trim()) || []).filter(Boolean))].sort();

            setFilterOptions({ priorities, groups, statuses, managers, assignees });
        }
    }, [allTasks]);

    useEffect(() => {
        let filtered = allTasks;

        if (searchTerm) {
            filtered = filtered.filter(task =>
                task.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                task.project?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (filters.priority) filtered = filtered.filter(task => task.priority === filters.priority);
        if (filters.group) filtered = filtered.filter(task => task.group === filters.group);
        if (filters.status) filtered = filtered.filter(task => task.status === filters.status);
        if (filters.manager) filtered = filtered.filter(task => task.manager?.split(',').map((s: string) => s.trim()).includes(filters.manager));
        if (filters.assignee) filtered = filtered.filter(task => task.assignee?.split(',').map((s: string) => s.trim()).includes(filters.assignee));

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        setTasks(filtered.slice(startIndex, endIndex));
    }, [allTasks, searchTerm, currentPage, itemsPerPage, filters, setTasks]);

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
        let filtered = allTasks;
        if (searchTerm) {
            filtered = filtered.filter(task =>
                task.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                task.project?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (filters.priority) filtered = filtered.filter(task => task.priority === filters.priority);
        if (filters.group) filtered = filtered.filter(task => task.group === filters.group);
        if (filters.status) filtered = filtered.filter(task => task.status === filters.status);
        if (filters.manager) filtered = filtered.filter(task => task.manager === filters.manager);
        if (filters.assignee) filtered = filtered.filter(task => task.assignee === filters.assignee);
        return filtered.length;
    })();

    const handleTaskClick = (taskId: string) => {
        navigate(`/task/${taskId}`);
    };

    return (
        <TaskListView
            tasks={tasks}
            isLoading={isLoading}
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            totalCount={filteredCount}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={handleItemsPerPageChange}
            onTaskClick={handleTaskClick}
            filters={filters}
            onFilterChange={handleFilterChange}
            filterOptions={filterOptions}
        />
    );
};

export default TaskListPage;
