import { useNavigate, useLocation } from 'react-router-dom';
import SidebarView from '../../views/all/SidebarView';
import { useCurrentUser } from '../../features/user/infrastructure/user.api';
import { useFeatures } from '../../shared/hooks/useFeatures';

interface SidebarProps {
    isCollapsed?: boolean;
    onToggle?: () => void;
    onLogout?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed = false, onToggle, onLogout }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser, isLoadingUser } = useCurrentUser();
    const { can, isLoading: isFeaturesLoading } = useFeatures();

    const getActiveItem = () => {
        const path = location.pathname;
        if (path === '/home' || path === '/') return 'home';
        if (path === '/project' || path.includes('/project')) return 'projects';
        if (path === '/dashboard' || path.includes('/dashboard')) return 'projects';
        if (path === '/template' || path.includes('/template')) return 'reports';
        if (path.includes('/task')) return 'tasks';
        if (path.includes('/workflow')) return 'flowwork';
        if (path.includes('/calendar')) return 'calendar';
        if (path.includes('/settings')) return 'settings';
        return 'home';
    };

    const handleMenuClick = (id: string) => {
        switch (id) {
            case 'home':
                navigate('/home');
                break;
            case 'projects':
                navigate('/project');
                break;
            case 'tasks':
                navigate('/task');
                break;
            case 'calendar':
                navigate('/calendar');
                break;
            case 'reports':
                navigate('/template');
                break;
            case 'settings':
                navigate('/settings');
                break;
            case 'flowwork':
                navigate('/workflow');
                break;
            default:
                break;
        }
    };
    const visibleMenuItems = [
        { id: 'home', show: true },
        { id: 'projects', show: !isFeaturesLoading && can('PROJECT_VIEW') },
        { id: 'tasks', show: !isFeaturesLoading && can('TASK_VIEW') },
        { id: 'flowwork', show: !isFeaturesLoading && can('WORKFLOW_VIEW') },
        { id: 'reports', show: !isFeaturesLoading && can('WORKFLOW_VIEW') },
        { id: 'settings', show: !isFeaturesLoading && can('SETTING_VIEW') },
    ]
        .filter(item => item.show)
        .map(item => item.id);

    return (
        <SidebarView
            isCollapsed={isCollapsed}
            activeItem={getActiveItem()}
            onToggle={onToggle || (() => { })}
            onMenuClick={handleMenuClick}
            onLogout={onLogout || (() => { })}
            currentUser={currentUser}
            isLoadingUser={isLoadingUser}
            visibleMenuIds={visibleMenuItems}
        />
    );
};
export default Sidebar;
