import { useState, useCallback, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import MainLayout from './components/all/MainLayout';
import AddProjectModal from './components/dashboard/AddProjectModal';
import AddTaskModal from './features/task/components/AddTaskModal';
import { DashboardPage, TaskListPage, TaskDetailPage, TimelinePage, HomePage, WorkflowPage, TemplatePage, TemplateDetailPage, SettingsPage } from './features';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import { projectRepository as projectService } from './features/project/infrastructure/project.api';
import { userApi as authService } from './features/user/infrastructure/user.api';
import { taskRepository as taskService } from './features/task/infrastructure/task.repository';
import type { User } from './shared/types';
import type { CreateTaskInput } from './shared/types/task';
import type { CreateProjectInput } from './shared/types/project';
import { ToastProvider, useToast } from './ui/toast';
import { useUserStore } from './features/user/application/user.store';
import { useFeatures } from './shared/hooks/useFeatures';

/** Route guard: redirects to /home if the user lacks the required feature code. */
const FeatureRoute: React.FC<{ featureCode: string; children: React.ReactNode }> = ({
  featureCode,
  children,
}) => {
  const { can, isLoading } = useFeatures();
  if (isLoading) return null;
  return can(featureCode) ? <>{children}</> : <Navigate to="/home" replace />;
};

/** Route guard specifically for settings: allows SETTING_VIEW or any profile view/edit/password change permission. */
const SettingsRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { can, isLoading } = useFeatures();
  if (isLoading) return null;
  const hasAccess = can('SETTING_VIEW') || can('MEMBER_VIEW') || can('ROLE_VIEW') || can('TASKGROUP_VIEW');
  return hasAccess ? <>{children}</> : <Navigate to="/home" replace />;
};

function App() {
  return (
    <ToastProvider>
      <AppWithToast />
    </ToastProvider>
  );
}

function AppWithToast() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();
  const setSession = useUserStore((state: import('./features/user/application/user.store').UserState) => state.setSession);
  const clearSession = useUserStore((state: import('./features/user/application/user.store').UserState) => state.clearSession);


  useEffect(() => {
    const checkAuth = () => {
      const isAuth = authService.isAuthenticated();
      const user = authService.getCurrentUser();

      setIsAuthenticated(isAuth);
      setCurrentUser(user);
      setSession(user);
      setIsLoading(false);
    };

    checkAuth();
  }, [setSession]);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setSession(user);
  };
  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
    clearSession();
    window.location.href = '/login';
  };
  const handleAddTask = useCallback(async (input: CreateTaskInput) => {
    try {
      await taskService.addTask(input);
      setIsTaskModalOpen(false);
      setRefreshKey(prev => prev + 1);
      toast.success('Tạo công việc thành công');
    } catch (error) {
      console.error('Failed to add task:', error);
      toast.error('Tạo công việc thất bại');
    }
  }, [toast]);
  const handleAddProject = useCallback(async (input: CreateProjectInput) => {
    try {
      await projectService.addProject(input);
      setIsProjectModalOpen(false);
      setRefreshKey(prev => prev + 1);
      toast.success('Tạo dự án thành công');
    } catch (error) {
      console.error('Failed to add project:', error);
      toast.error('Tạo dự án thất bại');
    }
  }, [toast]);
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    );
  }
  return (
    <BrowserRouter>
      <AppContent
        isAuthenticated={isAuthenticated}
        currentUser={currentUser}
        isTaskModalOpen={isTaskModalOpen}
        isProjectModalOpen={isProjectModalOpen}
        refreshKey={refreshKey}
        handleLogout={handleLogout}
        handleAddTask={handleAddTask}
        handleAddProject={handleAddProject}
        setIsTaskModalOpen={setIsTaskModalOpen}
        setIsProjectModalOpen={setIsProjectModalOpen}
      />
    </BrowserRouter>
  );
};
const AppContent: React.FC<{
  isAuthenticated: boolean;
    currentUser: User | null;
  isTaskModalOpen: boolean;
  isProjectModalOpen: boolean;
  refreshKey: number;
  handleLogout: () => void;
  handleAddTask: (input: CreateTaskInput) => void;
  handleAddProject: (input: CreateProjectInput) => void;
  setIsTaskModalOpen: (open: boolean) => void;
  setIsProjectModalOpen: (open: boolean) => void;
}> = ({
  isAuthenticated,
  currentUser,
  isTaskModalOpen,
  isProjectModalOpen,
  refreshKey,
  handleLogout,
  handleAddTask,
  handleAddProject,
  setIsTaskModalOpen,
  setIsProjectModalOpen,
}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [currentTimeFilter, setCurrentTimeFilter] = useState('day');

    const currentProjectId = location.state?.projectId as string | undefined;

    const handleBack = () => {
      if (location.pathname.includes('/template') && location.search.includes('action=add')) {
        navigate('/template');
      } else {
        navigate('/task');
      }
    };
    const handleTimeline = () => {
      navigate('/task/timeline');
    };

    const handleAddTemplateClick = () => {
      navigate('/template?action=add');
    };

    const handleTimeFilterChange = (filter: string) => {
      setCurrentTimeFilter(filter);
    };
    if (!isAuthenticated) {
      return (
        <Routes>
          <Route path="/login" element={<LoginPage onLoginSuccess={() => { }} />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      );
    }
    return (
      <>
        <MainLayout
          onLogout={handleLogout}
          onAddTask={() => setIsTaskModalOpen(true)}
          onAddProject={() => setIsProjectModalOpen(true)}
          onAddTemplate={handleAddTemplateClick}
          onBack={handleBack}
          onTimeline={handleTimeline}
          onTimeFilterChange={handleTimeFilterChange}
          currentTimeFilter={currentTimeFilter}
        >
          <Routes>
            <Route path="/home" element={<HomePage currentTimeFilter={currentTimeFilter} />} />
            <Route path="/project" element={
              <FeatureRoute featureCode="PROJECT_VIEW">
                <DashboardPage key={refreshKey} />
              </FeatureRoute>
            } />
            <Route path="/dashboard" element={
              <FeatureRoute featureCode="PROJECT_VIEW">
                <DashboardPage key={refreshKey} />
              </FeatureRoute>
            } />
            <Route path="/task" element={
              <FeatureRoute featureCode="TASK_VIEW">
                <TaskListPage key={refreshKey} />
              </FeatureRoute>
            } />
            <Route path="/task/timeline" element={
              <FeatureRoute featureCode="TASK_VIEW">
                <TimelinePage key={refreshKey} />
              </FeatureRoute>
            } />
            <Route path="/task/:id" element={
              <FeatureRoute featureCode="TASK_VIEW">
                <TaskDetailPage />
              </FeatureRoute>
            } />
            <Route path="/workflow" element={
              <FeatureRoute featureCode="WORKFLOW_VIEW">
                <WorkflowPage key={refreshKey} />
              </FeatureRoute>
            } />
            <Route path="/template" element={
              <FeatureRoute featureCode="WORKFLOW_VIEW">
                <TemplatePage />
              </FeatureRoute>
            } />
            <Route path="/template/:id" element={
              <FeatureRoute featureCode="WORKFLOW_VIEW">
                <TemplateDetailPage />
              </FeatureRoute>
            } />
            <Route path="/settings" element={
              <SettingsRoute>
                <SettingsPage />
              </SettingsRoute>
            } />
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/login" element={<Navigate to="/home" replace />} />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </MainLayout>
        <AddTaskModal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          onSubmit={handleAddTask}
          defaultManager={currentUser?.name || ''}
          defaultManagerId={currentUser?.id || ''}
          defaultProjectId={currentProjectId}
        />
        <AddProjectModal
          isOpen={isProjectModalOpen}
          onClose={() => setIsProjectModalOpen(false)}
          onSubmit={handleAddProject}
          defaultManager={currentUser?.name || ''}
          defaultManagerId={currentUser?.id || ''}
        />
      </>
    );
  }
export default App;
