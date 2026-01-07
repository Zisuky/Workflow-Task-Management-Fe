interface MenuItem {
    id: string;
    label: string;
    icon: React.ReactNode;
}
interface SidebarViewProps {
    isCollapsed: boolean;
    activeItem: string;
    menuItems: MenuItem[];
    onToggle: () => void;
    onMenuClick: (id: string) => void;
    onLogout: () => void;
}
function HomeIcon() {
    return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
}
function TaskIcon() {
    return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>;
}
function CalendarIcon() {
    return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
}
function ReportIcon() {
    return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
}
function ProjectIcon() {
    return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>;
}

function SettingsIcon() {
    return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
}
function LogoutIcon() {
    return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
}
function ChevronIcon({ isCollapsed }: { isCollapsed: boolean }) {
    return (
        <svg
            className={`w-4 h-4 text-white transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
    );
}
export const defaultMenuItems: MenuItem[] = [
    { id: 'home', label: 'Trang chủ', icon: <HomeIcon /> },
    { id: 'projects', label: 'Quản lý dự án', icon: <ProjectIcon /> },
    { id: 'tasks', label: 'Quản lý công việc', icon: <TaskIcon /> },
    { id: 'calendar', label: 'Lịch', icon: <CalendarIcon /> },
    { id: 'reports', label: 'Báo cáo', icon: <ReportIcon /> },
    { id: 'settings', label: 'Cài đặt', icon: <SettingsIcon /> },
];
const SidebarView: React.FC<SidebarViewProps> = ({
    isCollapsed,
    activeItem,
    menuItems,
    onToggle,
    onMenuClick,
    onLogout,
}) => {
    return (
        <aside className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200 flex flex-col z-50 transition-all duration-300 ${isCollapsed ? 'w-[70px]' : 'w-[250px]'}`}>
            <button
                onClick={onToggle}
                className="absolute -right-3 top-[180px] w-6 h-6 bg-gradient-to-r from-[#F79E61] to-[#f0884a] rounded-md shadow-md 
                           flex items-center justify-center cursor-pointer z-10
                           hover:from-[#e88d50] hover:to-[#e07d3a] hover:shadow-lg
                           transition-all duration-200 active:scale-95"
            >
                <ChevronIcon isCollapsed={isCollapsed} />
            </button>
            <div className="flex items-center gap-3 p-4 border-b border-gray-100">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">NB</div>
                {!isCollapsed && (
                    <div className="flex flex-col min-w-0">
                        <span className="text-sm font-semibold text-gray-800 truncate">Nguyễn Bảo Thành</span>
                        <span className="text-xs text-gray-500">BA</span>
                    </div>
                )}
            </div>
            <nav className="flex-1 py-4 overflow-y-auto">
                <ul className="flex flex-col gap-1 px-3">
                    {menuItems.map((item) => (
                        <li key={item.id}>
                            <button onClick={() => onMenuClick(item.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all text-left ${activeItem === item.id ? 'bg-orange-50 text-orange-500 border-l-[3px] border-orange-500 -ml-[3px] pl-[15px]' : 'text-gray-600 hover:bg-gray-50'}`}>
                                <span className="flex-shrink-0">{item.icon}</span>
                                {!isCollapsed && <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="p-3 border-t border-gray-100">
                <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 transition-all">
                    <LogoutIcon />
                    {!isCollapsed && <span className="text-sm font-medium">Đăng xuất</span>}
                </button>
            </div>
        </aside>
    );
};
export default SidebarView;
