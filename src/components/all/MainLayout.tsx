import { useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import MainLayoutView from '../../views/all/MainLayoutView';
import { useFeatures } from '../../shared/hooks/useFeatures';

interface MainLayoutProps {
    children: ReactNode;
    onLogout?: () => void;
    onAddTask?: () => void;
    onAddProject?: () => void;
    onAddTemplate?: () => void;
    onBack?: () => void;
    onTimeline?: () => void;
    onTimeFilterChange?: (filter: string) => void;
    currentTimeFilter?: string;
}
const MainLayout: React.FC<MainLayoutProps> = ({
    children,
    onLogout,
    onAddTask,
    onAddProject,
    onAddTemplate,
    onBack,
    onTimeline,
    onTimeFilterChange,
    currentTimeFilter
}) => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const location = useLocation();
    const { can } = useFeatures();

    const canAddTask = can('TASK_CREATE');
    const canAddProject = can('PROJECT_CREATE');
    const getPageTitle = (pathname: string) => {
        if (pathname.match(/^\/task\/[^/]+$/)) {
            return 'Chi tiết công việc';
        }
        if (pathname === '/task/timeline') {
            return 'Dòng thời gian';
        }
        if (pathname === '/chart') {
            return 'Báo cáo';
        }
        if (pathname === '/dashboard' || pathname === '/project') {
            return 'Quản lý dự án';
        }
        if (pathname === '/home' || pathname === '/') {
            return 'Trang chủ';
        }
        if (pathname.includes('/workflow')) {
            return 'Workflow';
        }
        if (pathname.includes('/task')) {
            return 'Quản lý công việc';
        }
        if (pathname.includes('/template')) {
            return 'Template';
        }
        if (pathname.includes('/settings')) {
            return 'Cài đặt';
        }
        return 'Trang chủ';

    };
    const isTaskPage = location.pathname.startsWith('/task');
    const isTaskDetailPage = location.pathname.match(/^\/task\/[^/]+$/) && location.pathname !== '/task/timeline';
    const isTimelinePage = location.pathname === '/task/timeline';
    const isChartPage = location.pathname === '/chart';
    const isWorkflowPage = location.pathname.includes('/workflow');
    const isTemplatePage = location.pathname.includes('/template');
    const isHomePage = location.pathname === '/home' || location.pathname === '/';
    const isTemplateWizardActive = isTemplatePage && location.search.includes('action=add');
    return (
        <MainLayoutView
            isSidebarCollapsed={isSidebarCollapsed}
            onSidebarToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            onLogout={onLogout || (() => { })}
            onAddTask={onAddTask || (() => { })}
            onAddProject={onAddProject || (() => { })}
            onAddTemplate={onAddTemplate || (() => { })}
            onBack={onBack}
            onTimeline={onTimeline}
            isTaskPage={isTaskPage}
            isChartPage={isChartPage}
            isHomePage={isHomePage}
            isWorkflowPage={isWorkflowPage}
            isTemplatePage={isTemplatePage}
            showBackButton={!!(isTaskDetailPage || isTimelinePage)}
            title={getPageTitle(location.pathname)}
            onTimeFilterChange={onTimeFilterChange}
            currentTimeFilter={currentTimeFilter}
            isTemplateWizardActive={isTemplateWizardActive}
            canAddTask={canAddTask}
            canAddProject={canAddProject}
        >
            {children}
        </MainLayoutView>
    );
};
export default MainLayout;
