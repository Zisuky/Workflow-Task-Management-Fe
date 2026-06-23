import React from 'react';

interface TaskPriorityData {
  priority: string;
  count: number;
  color: string;
}

interface TaskPriorityListProps {
  data: TaskPriorityData[];
}

const PRIORITY_LABELS: Record<string, string> = {
  'HIGHEST': 'Khẩn cấp',
  'HIGH': 'Cao',
  'MEDIUM': 'Trung bình',
  'LOW': 'Thấp',
  'NOT_STARTED': 'Chưa xác định',
};

const TaskPriorityList: React.FC<TaskPriorityListProps> = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  if (!data || data.length === 0 || total === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[160px] gap-2">
        <svg className="w-10 h-10 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <span className="text-sm text-gray-400">Không có dữ liệu</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.map((item, index) => {
        const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
        const label = PRIORITY_LABELS[item.priority] || item.priority;

        return (
          <div key={index} className="group">
            {/* Header row */}
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm font-medium text-gray-700">{label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-mono">{percentage}%</span>
                <span
                  className="text-sm font-bold tabular-nums min-w-[2rem] text-right"
                  style={{ color: item.color }}
                >
                  {item.count}
                </span>
              </div>
            </div>

            {/* Progress bar track */}
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: item.color,
                  opacity: 0.85,
                }}
              />
            </div>
          </div>
        );
      })}

      {/* Total footer */}
      <div className="pt-3 mt-1 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-400 uppercase tracking-wide font-medium">Tổng cộng</span>
        <span className="text-sm font-bold text-gray-700 tabular-nums">{total} công việc</span>
      </div>
    </div>
  );
};

export default TaskPriorityList;