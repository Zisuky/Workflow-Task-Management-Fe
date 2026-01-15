import { useState, useCallback, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { MainLayout, AddProjectModal } from './components';
import AddJobModal from './components/job/AddJobModal';
import { DashboardPage, LoginPage, JobListPage, JobDetailPage, TimelinePage, HomePage, WorkflowPage, TemplatePage, SettingsPage } from './pages';
import { projectService, authService, jobService } from './services';
import type { User, CreateJobInput, CreateProjectInput } from './models';
import { ToastProvider, useToast } from './ui/toast';

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
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();


  useEffect(() => {
    const checkAuth = () => {
      const isAuth = authService.isAuthenticated();
      const user = authService.getCurrentUser();

      setIsAuthenticated(isAuth);
      setCurrentUser(user);
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  };
  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
  };
  const handleAddJob = useCallback(async (input: CreateJobInput) => {
    try {
      await jobService.addJob(input);
      setIsJobModalOpen(false);
      setRefreshKey(prev => prev + 1);
      toast.success('Tạo công việc thành công');
    } catch (error) {
      console.error('Failed to add job:', error);
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
  const handleAddTemplate = () => {
    toast.info('Tính năng tạo template đang được phát triển');
  }

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
        isJobModalOpen={isJobModalOpen}
        isProjectModalOpen={isProjectModalOpen}
        refreshKey={refreshKey}
        handleLogout={handleLogout}
        handleAddJob={handleAddJob}
        handleAddProject={handleAddProject}
        setIsJobModalOpen={setIsJobModalOpen}
        setIsProjectModalOpen={setIsProjectModalOpen}
        handleAddTemplate={handleAddTemplate}
      />
    </BrowserRouter>
  );
};
const AppContent: React.FC<{
  isAuthenticated: boolean;
  currentUser: any;
  isJobModalOpen: boolean;
  isProjectModalOpen: boolean;
  refreshKey: number;
  handleLogout: () => void;
  handleAddJob: (input: any) => void;
  handleAddProject: (input: any) => void;
  setIsJobModalOpen: (open: boolean) => void;
  setIsProjectModalOpen: (open: boolean) => void;
  handleAddTemplate: () => void;
}> = ({
  isAuthenticated,
  currentUser,
  isJobModalOpen,
  isProjectModalOpen,
  refreshKey,
  handleLogout,
  handleAddJob,
  handleAddProject,
  setIsJobModalOpen,
  setIsProjectModalOpen,
  handleAddTemplate
}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [currentTimeFilter, setCurrentTimeFilter] = useState('all');

    const currentProjectId = location.state?.projectId as string | undefined;

    const handleBack = () => {
      navigate('/job');
    };
    const handleTimeline = () => {
      navigate('/job/timeline');
    };

    const handleTimeFilterChange = (filter: string) => {
      setCurrentTimeFilter(filter);
    };
    if (!isAuthenticated) {
      return (
        <Routes>
          <Route path="/login" element={<LoginPage onLoginSuccess={() => { }} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      );
    }
    return (
      <>
        <MainLayout
          onLogout={handleLogout}
          onAddJob={() => setIsJobModalOpen(true)}
          onAddProject={() => setIsProjectModalOpen(true)}
          onAddTemplate={handleAddTemplate}
          onBack={handleBack}
          onTimeline={handleTimeline}
          onTimeFilterChange={handleTimeFilterChange}
          currentTimeFilter={currentTimeFilter}
        >
          <Routes>
            <Route path="/home" element={<HomePage />} />
            <Route path="/project" element={<DashboardPage key={refreshKey} />} />
            <Route path="/dashboard" element={<DashboardPage key={refreshKey} />} />
            <Route path="/job" element={<JobListPage key={refreshKey} />} />
            <Route path="/job/timeline" element={<TimelinePage key={refreshKey} />} />
            <Route path="/job/:id" element={<JobDetailPage />} />
            <Route path="/workflow" element={<WorkflowPage key={refreshKey} />} />
            <Route path="/template" element={<TemplatePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/login" element={<Navigate to="/home" replace />} />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </MainLayout>
        <AddJobModal
          isOpen={isJobModalOpen}
          onClose={() => setIsJobModalOpen(false)}
          onSubmit={handleAddJob}
          defaultManager={currentUser?.name || ''}
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
