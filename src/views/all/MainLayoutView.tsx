import type { ReactNode } from 'react';
interface MainLayoutViewProps {
    children: ReactNode;
    isSidebarCollapsed: boolean;
    onSidebarToggle: () => void;
    onLogout: () => void;
    onAddJob: () => void;
    onAddProject: () => void;
    onBack?: () => void;
    onTimeline?: () => void;
    isJobPage: boolean;
    isChartPage?: boolean;
    isHomePage?: boolean;
    showBackButton?: boolean;
    title?: string;
    onTimeFilterChange?: (filter: string) => void;
    currentTimeFilter?: string;
}
const MainLayoutView: React.FC<MainLayoutViewProps> = ({
    children,
    isSidebarCollapsed,
    onSidebarToggle,
    onLogout,
    onAddJob,
    onAddProject,
    onBack,
    onTimeline,
    isJobPage,
    isChartPage = false,
    isHomePage = false,
    showBackButton = false,
    title,
    onTimeFilterChange,
    currentTimeFilter,
}) => {
    return (
        <div className="flex min-h-screen bg-slate-50">
            <SidebarContainer isCollapsed={isSidebarCollapsed} onToggle={onSidebarToggle} onLogout={onLogout} />
            <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${isSidebarCollapsed ? 'ml-[70px]' : 'ml-[250px]'}`}>
                <Header
                    title={title}
                    onBack={onBack}
                    onAddJob={onAddJob}
                    onAddProject={onAddProject}
                    onTimeline={onTimeline}
                    isJobPage={isJobPage}
                    isChartPage={isChartPage}
                    isHomePage={isHomePage}
                    showBackButton={showBackButton}
                    onTimeFilterChange={onTimeFilterChange}
                    currentTimeFilter={currentTimeFilter}
                />
                <main className={`flex-1 overflow-y-auto ${isChartPage || isHomePage ? '' : 'p-6'}`}>{children}</main>
            </div>
        </div>
    );
};
import { Sidebar as SidebarContainer } from '../../components/all';
import Header from '../../components/all/Header';
export default MainLayoutView;
