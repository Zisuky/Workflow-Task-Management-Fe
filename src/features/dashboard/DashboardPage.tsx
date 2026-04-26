import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectRepository as projectService } from '../project/infrastructure/project.api';
import type { Project } from '../../shared/types/project';
import DashboardView from './DashboardView';
import ProjectDetailModal from '../../components/dashboard/ProjectDetailModal';
import { useProjectStore } from '../project/application/project.store';

const ITEMS_PER_PAGE = 10;

const DashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const searchTerm = useProjectStore(state => state.searchTerm);
    const selectedProject = useProjectStore(state => state.selectedProject);
    const isDetailModalOpen = useProjectStore(state => state.isDetailModalOpen);
    const setSearchTerm = useProjectStore(state => state.setSearchTerm);
    const selectProject = useProjectStore(state => state.selectProject);
    const setDetailModalOpen = useProjectStore(state => state.setDetailModalOpen);

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

    const handleTogglePin = (id: string) => {
        setProjects(prevProjects =>
            prevProjects.map(p => (p.id === id ? { ...p, isPinned: !p.isPinned } : p))
        );
        projectService.togglePin(id);
    };

    const handleProjectClick = (project: Project) => {
        navigate('/job', { state: { projectId: project.id } });
    };

    const handleViewDetail = (project: Project) => {
        selectProject(project);
        setDetailModalOpen(true);
    };

    const handleCloseDetailModal = () => {
        setDetailModalOpen(false);
        selectProject(null);
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
