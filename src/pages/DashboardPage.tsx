import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectService } from '../services';
import type { Project, CreateProjectInput } from '../models';
import { DashboardView } from '../views';
const ITEMS_PER_PAGE = 10;
interface DashboardPageProps {
    onAddProject?: () => void;
}
const DashboardPage: React.FC<DashboardPageProps> = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState<Project[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const loadProjects = useCallback(async () => {
        setIsLoading(true);
        const data = await projectService.getProjects();
        setProjects(data);
        setIsLoading(false);
    }, []);
    useEffect(() => {
        loadProjects();
    }, [loadProjects]);
    const filteredProjects = projects
        .filter(project =>
            project.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return 0;
        });
    const displayedProjects = filteredProjects.slice(0, displayCount);
    const hasMore = displayCount < filteredProjects.length;
    const handleLoadMore = useCallback(() => {
        if (isLoadingMore || !hasMore) return;
        setIsLoadingMore(true);
        setTimeout(() => {
            setDisplayCount(prev => Math.min(prev + ITEMS_PER_PAGE, filteredProjects.length));
            setIsLoadingMore(false);
        }, 300);
    }, [isLoadingMore, hasMore, filteredProjects.length]);
    useEffect(() => {
        setDisplayCount(ITEMS_PER_PAGE);
    }, [searchTerm]);
    const handleTogglePin = async (id: string) => {
        const updatedProject = await projectService.togglePin(id);
        if (updatedProject) {
            setProjects(projects.map(p => p.id === id ? updatedProject : p));
        }
    };
    const handleProjectClick = (project: Project) => {
        navigate('/job', { state: { projectFilter: project.code } });
    };
    return (
        <DashboardView
            isLoading={isLoading}
            searchTerm={searchTerm}
            projects={displayedProjects}
            hasMore={hasMore}
            isLoadingMore={isLoadingMore}
            onSearchChange={setSearchTerm}
            onTogglePin={handleTogglePin}
            onLoadMore={handleLoadMore}
            onProjectClick={handleProjectClick}
        />
    );
};
export const useAddProject = () => {
    const addProject = async (input: CreateProjectInput): Promise<Project> => {
        return await projectService.addProject(input);
    };
    return { addProject };
};
export default DashboardPage;
