import { useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import MainLayoutView from '../../views/all/MainLayoutView';
interface MainLayoutProps {
    children: ReactNode;
    onLogout?: () => void;
    onAddJob?: () => void;
    onAddProject?: () => void;
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
        if (pathname === '/dashboard') {
            return 'Quản lý dự án';
        }
        if (pathname.includes('/job')) {
            return 'Quản lý công việc';
        }
        return 'Trang chủ';
    };
    const isJobPage = location.pathname === '/job';
    const isJobDetailPage = location.pathname.match(/^\/job\/[^/]+$/);
    const isTimelinePage = location.pathname === '/job/timeline';
    const isChartPage = location.pathname === '/chart';
    const isHomePage = location.pathname === '/home' || location.pathname === '/';
    return (
        <MainLayoutView
            isSidebarCollapsed={isSidebarCollapsed}
            onSidebarToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            onLogout={onLogout || (() => { })}
            onAddJob={onAddJob || (() => { })}
            onAddProject={onAddProject || (() => { })}
            onBack={onBack}
            onTimeline={onTimeline}
            isJobPage={isJobPage}
            isChartPage={isChartPage}
            isHomePage={isHomePage}
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
