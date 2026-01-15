import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TaskStatusChart, PriorityCountCard, ProductivityChart } from '../../components/chart';
interface ChartDashboardData {
  taskStatus: Array<{ status: string; count: number; color: string; }>;
  priorityCount: Array<{ priority: string; count: number; color: string; }>;
  alerts: Array<{ id: string; taskCode: string; projectCode: string; message: string; }>;
  productivity: Array<{ month: string; target: number; actual: number; }>;
}
interface ChartDashboardViewProps {
  data: ChartDashboardData;
  isLoading?: boolean;
}

const AlertIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const AlertItem = ({ alert, onClick }: { alert: ChartDashboardData['alerts'][0]; onClick: () => void }) => (
  <div
    onClick={onClick}
    className="flex items-center gap-2 p-2 bg-yellow-50 border-l-3 border-orange-400 rounded-r hover:bg-yellow-100 transition-colors cursor-pointer"
  >
    <div className="text-orange-500 flex-shrink-0">
      <AlertIcon />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-medium text-gray-900 truncate">
        <span className="font-bold">{alert.taskCode}</span> {alert.message}
      </p>
      <p className="text-xs text-gray-500 truncate">(dự án {alert.projectCode})</p>
    </div>
  </div>
);
const ChartCard = ({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-lg shadow-sm border border-gray-100 p-6 flex flex-col h-full ${className}`}>
    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex-shrink-0">{title}</h3>
    {children}
  </div>
);
const ChartDashboardView: React.FC<ChartDashboardViewProps> = ({ data, isLoading = false }) => {
  const navigate = useNavigate();

  const handleAlertClick = (taskCode: string) => {
    // Map taskCode to job ID for navigation
    const jobIdMap: { [key: string]: string } = {
      'UIUX001': '1',
      '0012911': '2',
      'TESTING001': '3',
      'DATABASE001': '4',
      'DOCUMENTATION001': '5',
      'FRONTEND001': '6',
      'BACKEND002': '7',
      'DESIGN001': '8'
    };

    const jobId = jobIdMap[taskCode];
    if (jobId) {
      navigate(`/job/${jobId}`);
    }
  };
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-orange-200 rounded-full animate-spin border-t-[#F79E61]"></div>
          <span className="text-gray-500 animate-pulse">Đang tải biểu đồ...</span>
        </div>
      </div>
    );
  }
  return (
    <div className="h-full bg-gray-50">
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* 10-Column Grid Layout for precise 1.5/5 ratio */}
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
            {/* Column 1-7 - Main Charts (3.5/5 = 7/10) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Row 1: Task Status & Priority Count */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ChartCard title="Tỷ lệ công việc theo trạng thái">
                  <div className="h-72 flex items-center justify-center !border-none !outline-none">
                    <TaskStatusChart data={data.taskStatus} />
                  </div>
                </ChartCard>
                <ChartCard title="Số lượng công việc theo mức độ ưu tiên">
                  <div className="h-64 overflow-y-auto !border-none !outline-none">
                    <PriorityCountCard data={data.priorityCount} />
                  </div>
                </ChartCard>
              </div>
              {/* Row 2: Productivity Chart */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-semibold text-gray-800">Năng suất</h3>
                  {/* Legend */}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gray-300 rounded"></div>
                      <span className="text-gray-600">Mục tiêu</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded"></div>
                      <span className="text-gray-600">Thực tế</span>
                    </div>
                  </div>
                </div>
                <div className="h-64 flex-1 !border-none !outline-none">
                  <ProductivityChart data={data.productivity} />
                </div>
              </div>
            </div>
            {/* Column 8-10 - Alert List (1.5/5 = 3/10 width) */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 pb-2 flex flex-col h-full">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex-shrink-0">Danh sách cảnh báo</h3>
                <div className="flex-1 overflow-y-auto">
                  <div className="space-y-2">
                    {data.alerts.map((alert) => (
                      <AlertItem
                        key={alert.id}
                        alert={alert}
                        onClick={() => handleAlertClick(alert.taskCode)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ChartDashboardView;
