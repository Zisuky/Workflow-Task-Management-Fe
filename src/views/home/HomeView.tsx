import React from 'react';
import { KPICard, ProductivityLineChart, TaskPriorityList, TaskStatusDonut, DepartmentBarChart } from '../../components';

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

interface HomeViewProps {
  data: HomeData;
  isLoading?: boolean;
}

const HomeView: React.FC<HomeViewProps> = ({ data, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-orange-200 rounded-full animate-spin border-t-[#F97316]"></div>
          <span className="text-gray-500 animate-pulse">Đang tải dữ liệu...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Main Content - Max width 1280px, centered, padding 24px */}
      <div className="max-w-[1280px] mx-auto px-6 py-6">

        {/* 1. Summary Cards Row - 4 cards, gap 16px */}
        <div className="mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              label="Tổng số dự án"
              value={data.kpis.totalProjects}
            />
            <KPICard
              label="Tổng số người tham gia"
              value={data.kpis.totalMembers}
            />
            <KPICard
              label="Dự án hoàn thành"
              value={data.kpis.completedProjects}
            />
            <KPICard
              label="Dự án đang thực hiện"
              value={data.kpis.inProgressProjects}
            />
          </div>
        </div>

        {/* 2. Chart + Alert Row - 70:30 Layout */}
        <div className="mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
            {/* Left: Productivity Chart (70% = 7/10 cols) */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-xl p-5 h-[360px]" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-[#111827]">Năng suất</h3>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-[#9CA3AF] rounded-full"></div>
                      <span className="text-[#6B7280]">Tổng số task trong dự án</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-[#111827] rounded-full"></div>
                      <span className="text-[#6B7280]">Số task đã hoàn thành</span>
                    </div>
                  </div>
                </div>
                <div className="h-[280px]">
                  <ProductivityLineChart data={data.productivity} />
                </div>
              </div>
            </div>

            {/* Right: Alert Panel (30% = 3/10 cols) */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl p-4 h-[360px]" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <h3 className="text-base font-semibold text-[#111827] mb-4">Danh sách cảnh báo</h3>
                <div className="space-y-3 overflow-y-auto h-[300px]">
                  {data.alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="bg-[#f0884a] rounded-lg p-3 cursor-pointer hover:bg-[#D97706] transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        <div className="text-white text-sm mt-0.5">⚠️</div>
                        <div className="flex-1">
                          <div className="text-white text-sm font-semibold">
                            {alert.taskCode} {alert.message}
                          </div>
                          <div className="text-white/90 text-xs mt-1">
                            (dự án {alert.projectCode})
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Task Priority & Donut Chart Row - Responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Task Priority */}
          <div className="bg-white rounded-xl p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <h3 className="text-base font-semibold text-[#111827] mb-4">Số lượng task theo mức độ ưu tiên</h3>
            <TaskPriorityList data={data.taskPriority} />
          </div>

          {/* Task Status Donut */}
          <div className="bg-white rounded-xl p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <h3 className="text-base font-semibold text-[#111827] mb-4">Tỷ lệ task theo trạng thái</h3>
            <div className="h-56 flex items-center justify-center">
              <TaskStatusDonut data={data.taskStatus} />
            </div>
          </div>
        </div>

        {/* 4. Department Bar Chart - Full width */}
        <div className="bg-white rounded-xl p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <h3 className="text-base font-semibold text-[#111827] mb-4">Số lượng task theo phòng ban</h3>
          <div className="h-64">
            <DepartmentBarChart data={data.departmentTasks} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeView;