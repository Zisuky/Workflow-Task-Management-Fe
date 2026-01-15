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
    isWorkflowPage?: boolean;
    showBackButton?: boolean;
    title?: string;
    onTimeFilterChange?: (filter: string) => void;
    currentTimeFilter?: string;
    isTemplatePage?: boolean;
    onAddTemplate?: () => void;
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
    isWorkflowPage = false,
    showBackButton = false,
    title,
    onTimeFilterChange,
    currentTimeFilter,
    isTemplatePage = false,
    onAddTemplate,
}) => {
    return (
        <div className="flex min-h-screen bg-slate-50 max-w-full overflow-x-hidden">
            <SidebarContainer isCollapsed={isSidebarCollapsed} onToggle={onSidebarToggle} onLogout={onLogout} />
            <div className={`flex-1 flex flex-col min-h-screen min-w-0 transition-all duration-300 ${isSidebarCollapsed ? 'ml-[70px]' : 'ml-[250px]'}`}>
                <Header
                    title={title}
                    onBack={onBack}
                    onAddJob={onAddJob}
                    onAddProject={onAddProject}
                    onTimeline={onTimeline}
                    isJobPage={isJobPage}
                    isChartPage={isChartPage}
                    isHomePage={isHomePage}
                    isWorkflowPage={isWorkflowPage}
                    showBackButton={showBackButton}
                    onTimeFilterChange={onTimeFilterChange}
                    currentTimeFilter={currentTimeFilter}
                    isTemplatePage={isTemplatePage}
                    onAddTemplate={onAddTemplate}
                />
                <main className={`flex-1 ${isWorkflowPage ? 'overflow-hidden' : 'overflow-y-auto'} ${isChartPage || isHomePage || isWorkflowPage ? '' : 'p-6'}`}>{children}</main>
            </div>
        </div>
    );
};
import { Sidebar as SidebarContainer } from '../../components/all';
import Header from '../../components/all/Header';
export default MainLayoutView;
