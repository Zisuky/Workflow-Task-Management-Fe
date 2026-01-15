import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectService } from '../../services';
import type { Project } from '../../models';
import DashboardView from './DashboardView';
import ProjectDetailModal from '../../components/dashboard/ProjectDetailModal';

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
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

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

    // Optimistic update - update UI immediately, then sync to localStorage
    const handleTogglePin = (id: string) => {
        // Immediately update local state (optimistic)
        setProjects(prevProjects =>
            prevProjects.map(p =>
                p.id === id ? { ...p, isPinned: !p.isPinned } : p
            )
        );

        // Sync to localStorage in background
        projectService.togglePin(id);
    };
    const handleProjectClick = (project: Project) => {
        navigate('/job', { state: { projectId: project.id } });
    };
    const handleViewDetail = (project: Project) => {
        setSelectedProject(project);
        setIsDetailModalOpen(true);
    };
    const handleCloseDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedProject(null);
    };
    return (
        <>
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
                onViewDetail={handleViewDetail}
            />
            <ProjectDetailModal
                isOpen={isDetailModalOpen}
                project={selectedProject}
                onClose={handleCloseDetailModal}
            />
        </>
    );
};
export default DashboardPage;


