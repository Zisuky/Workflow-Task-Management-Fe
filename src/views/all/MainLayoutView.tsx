import type { ReactNode } from 'react';
import SidebarContainer from '../../components/all/Sidebar';
import Header from '../../components/all/Header';
interface MainLayoutViewProps {
    children: ReactNode;
    isSidebarCollapsed: boolean;
    onSidebarToggle: () => void;
    onLogout: () => void;
    onAddTask: () => void;
    onAddProject: () => void;
    onBack?: () => void;
    onTimeline?: () => void;
    isTaskPage: boolean;
    isChartPage?: boolean;
    isHomePage?: boolean;
    isWorkflowPage?: boolean;
    showBackButton?: boolean;
    title?: string;
    onTimeFilterChange?: (filter: string) => void;
    currentTimeFilter?: string;
    isTemplatePage?: boolean;
    onAddTemplate?: () => void;
    isTemplateWizardActive?: boolean;
    canAddTask?: boolean;
    canAddProject?: boolean;
}
const MainLayoutView: React.FC<MainLayoutViewProps> = ({
    children,
    isSidebarCollapsed,
    onSidebarToggle,
    onLogout,
    onAddTask,
    onAddProject,
    onBack,
    onTimeline,
    isTaskPage,
    isChartPage = false,
    isHomePage = false,
    isWorkflowPage = false,
    showBackButton = false,
    title,
    onTimeFilterChange,
    currentTimeFilter,
    isTemplatePage = false,
    onAddTemplate,
    isTemplateWizardActive = false,
    canAddTask = true,
    canAddProject = true,
}) => {
    return (
        <div className="flex min-h-screen bg-slate-50 max-w-full overflow-x-hidden">
            <SidebarContainer isCollapsed={isSidebarCollapsed} onToggle={onSidebarToggle} onLogout={onLogout} />
            <div className={`flex-1 flex flex-col min-h-screen min-w-0 transition-all duration-300 ${isSidebarCollapsed ? 'ml-[70px]' : 'ml-[250px]'}`}>
                <Header
                    title={title}
                    onBack={onBack}
                    onAddTask={onAddTask}
                    onAddProject={onAddProject}
                    onTimeline={onTimeline}
                    isTaskPage={isTaskPage}
                    isChartPage={isChartPage}
                    isHomePage={isHomePage}
                    isWorkflowPage={isWorkflowPage}
                    showBackButton={showBackButton}
                    onTimeFilterChange={onTimeFilterChange}
                    currentTimeFilter={currentTimeFilter}
                    isTemplatePage={isTemplatePage}
                    onAddTemplate={onAddTemplate}
                    isTemplateWizardActive={isTemplateWizardActive}
                    canAddTask={canAddTask}
                    canAddProject={canAddProject}
                />
                <main className={`flex-1 ${isWorkflowPage ? 'overflow-hidden' : 'overflow-y-auto'} ${isChartPage || isHomePage || isWorkflowPage ? '' : 'p-6'}`}>{children}</main>
            </div>
        </div>
    );
};
export default MainLayoutView;
