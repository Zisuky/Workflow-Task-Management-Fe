// Re-export views from features for backward compatibility
// TODO: Remove this file once all imports are updated

export { SidebarView, MainLayoutView, LoginView } from './all';

// Dashboard - moved to features
export {
    DashboardView,
    AddProjectModalView,
    MemberSelectView,
    ManagerSearchView
} from '../features/dashboard';

// Job - moved to features
export { JobListView, JobDetailView } from '../features/job';

// Chart - moved to features
export { ChartDashboardView } from '../features/chart';

// Home - moved to features
export { HomeView } from '../features/home';

// Workflow - moved to features
export { WorkflowPage, FlowBoard } from '../features/workflow';
