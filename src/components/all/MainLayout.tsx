import { useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import MainLayoutView from '../../views/all/MainLayoutView';
interface MainLayoutProps {
    children: ReactNode;
    onLogout?: () => void;
    onAddJob?: () => void;
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
    onAddJob,
    onAddProject,
    onAddTemplate,
    onBack,
    onTimeline,
    onTimeFilterChange,
    currentTimeFilter
}) => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const location = useLocation();
    const getPageTitle = (pathname: string) => {
        if (pathname.match(/^\/job\/[^/]+$/)) {
            return 'Chi tiết công việc';
        }
        if (pathname === '/job/timeline') {
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
        if (pathname.includes('/job')) {
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
    const isJobPage = location.pathname === '/job';
    const isJobDetailPage = location.pathname.match(/^\/job\/[^/]+$/);
    const isTimelinePage = location.pathname === '/job/timeline';
    const isChartPage = location.pathname === '/chart';
    const isWorkflowPage = location.pathname.includes('/workflow');
    const isTemplatePage = location.pathname.includes('/template');
    const isHomePage = location.pathname === '/home' || location.pathname === '/';
    return (
        <MainLayoutView
            isSidebarCollapsed={isSidebarCollapsed}
            onSidebarToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            onLogout={onLogout || (() => { })}
            onAddJob={onAddJob || (() => { })}
            onAddProject={onAddProject || (() => { })}
            onAddTemplate={onAddTemplate || (() => { })}
            onBack={onBack}
            onTimeline={onTimeline}
            isJobPage={isJobPage}
            isChartPage={isChartPage}
            isHomePage={isHomePage}
            isWorkflowPage={isWorkflowPage}
            isTemplatePage={isTemplatePage}
            showBackButton={!!(isJobDetailPage || isTimelinePage)}
            title={getPageTitle(location.pathname)}
            onTimeFilterChange={onTimeFilterChange}
            currentTimeFilter={currentTimeFilter}
        >
            {children}
        </MainLayoutView>
    );
};
export default MainLayout;
