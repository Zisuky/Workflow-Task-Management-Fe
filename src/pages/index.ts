// Re-export pages from features for backward compatibility
// These will be gradually removed as imports are updated

export { DashboardPage } from '../features/dashboard';
export { default as LoginPage } from './LoginPage';
export { JobListPage, JobDetailPage, TimelinePage } from '../features/job';
export { HomePage } from '../features/home';
export { WorkflowPage } from '../features/workflow';
export { TemplatePage } from '../features/template';
export { SettingsPage } from '../features/setting';


