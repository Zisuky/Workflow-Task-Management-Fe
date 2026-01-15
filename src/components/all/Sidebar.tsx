import { useNavigate, useLocation } from 'react-router-dom';
import SidebarView, { defaultMenuItems } from '../../views/all/SidebarView';
import { useCurrentUser } from '../../api';

interface SidebarProps {
    isCollapsed?: boolean;
    onToggle?: () => void;
    onLogout?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed = false, onToggle, onLogout }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser, isLoadingUser } = useCurrentUser();
    const getActiveItem = () => {
        const path = location.pathname;
        if (path === '/home' || path === '/') return 'home';
        if (path === '/project' || path.includes('/project')) return 'projects';
        if (path === '/dashboard' || path.includes('/dashboard')) return 'projects';
        if (path === '/template' || path.includes('/template')) return 'reports';
        if (path.includes('/job')) return 'tasks';
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
                navigate('/job');
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
    return (
        <SidebarView
            isCollapsed={isCollapsed}
            activeItem={getActiveItem()}
            menuItems={defaultMenuItems}
            onToggle={onToggle || (() => { })}
            onMenuClick={handleMenuClick}
            onLogout={onLogout || (() => { })}
            currentUser={currentUser}
            isLoadingUser={isLoadingUser}
        />
    );
};
export default Sidebar;
