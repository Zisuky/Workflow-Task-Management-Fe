import React, { useState, useEffect } from 'react';
import HomeView from './HomeView';
import { dashboardRepository as dashboardService } from '../dashboard/infrastructure/dashboard.repository';

interface HomeData {
  kpis: {
    totalProjects: number;
    totalMembers: number;
    completedProjects: number;
    inProgressProjects: number;
  };
  productivity: Array<{ month: string; total: number; completed: number; }>;
  taskPriority: Array<{ priority: string; count: number; color: string; }>;
  taskStatus: Array<{ status: string; count: number; color: string; percentage: number; }>;
  departmentTasks: Array<{ department: string; count: number; }>;
  alerts: Array<{ id: string; taskCode: string; message: string; projectCode: string; }>;
}

const priorityColors: Record<string, string> = {
  'HIGH': '#EF4444',
  'MEDIUM': '#F97316',
  'LOW': '#22C55E',
  'UNKNOWN': '#9CA3AF',
};

const statusColors: Record<string, string> = {
  'TO_DO': '#3B82F6',
  'NOT_STARTED': '#3B82F6',
  'IN_PROGRESS': '#F97316',
  'PAUSED': '#EAB308',
  'DONE': '#22C55E',
  'COMPLETED': '#22C55E',
};

const statusTranslations: Record<string, string> = {
  'TO_DO': 'Chưa bắt đầu',
  'NOT_STARTED': 'Chưa bắt đầu',
  'IN_PROGRESS': 'Đang thực hiện',
  'PAUSED': 'Tạm dừng',
  'DONE': 'Hoàn thành',
  'COMPLETED': 'Hoàn thành',
};

const emptyData: HomeData = {
  kpis: {
    totalProjects: 0,
    totalMembers: 0,
    completedProjects: 0,
    inProgressProjects: 0,
  },
  productivity: [],
  taskPriority: [],
  taskStatus: [],
  departmentTasks: [],
  alerts: [],
};

interface HomePageProps {
  currentTimeFilter?: string;
}

const HomePage: React.FC<HomePageProps> = ({ currentTimeFilter = 'day' }) => {
  const [data, setData] = useState<HomeData>(emptyData);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stats, productivity, priority, taskStatus, alerts, departmentData, completedProjects] = await Promise.all([
          dashboardService.getStats(currentTimeFilter),
          dashboardService.getProductivity(currentTimeFilter),
          dashboardService.getPriority(currentTimeFilter),
          dashboardService.getTaskStatus(currentTimeFilter),
          dashboardService.getAlerts(currentTimeFilter),
          dashboardService.getTaskCountByGroup(currentTimeFilter),
          dashboardService.getCompletedProjectsCount(),
        ]);

        const kpis = {
          totalProjects: stats.find(s => s.title === 'Tổng số dự án')?.value as number || 0,
          totalMembers: stats.find(s => s.title === 'Tổng số người tham gia')?.value as number || 0,
          completedProjects,
          inProgressProjects: stats.find(s => s.title === 'Công việc đang thực hiện')?.value as number || 0,
        };

        const mappedProductivity = productivity.map(p => ({
          month: p.month,
          total: p.total,
          completed: p.completed,
        }));

        const mappedPriority = priority.map(p => ({
          priority: p.priority,
          count: p.count,
          color: priorityColors[p.priority] || '#9CA3AF',
        }));

        const totalStatusCount = taskStatus.reduce((sum, s) => sum + s.count, 0);
        const mappedTaskStatus = taskStatus.map(s => ({
          status: statusTranslations[s.status] || s.status,
          count: s.count,
          color: statusColors[s.status] || '#9CA3AF',
          percentage: totalStatusCount > 0 ? Math.round((s.count / totalStatusCount) * 100 * 10) / 10 : 0,
        }));

        const mappedDepartmentTasks = departmentData.map(d => ({
          department: d.typeName,
          count: d.count,
        }));

        setData({
          kpis,
          productivity: mappedProductivity,
          taskPriority: mappedPriority,
          taskStatus: mappedTaskStatus,
          departmentTasks: mappedDepartmentTasks,
          alerts: alerts,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setData(emptyData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentTimeFilter]);

  return (
    <HomeView
      data={data}
      isLoading={isLoading}
    />
  );
};

export default HomePage;
