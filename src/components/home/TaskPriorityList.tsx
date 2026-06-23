import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

interface TaskPriorityData {
  priority: string;
  count: number;
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

// Harmonious custom color palette using system orange as High priority
const PRIORITY_COLORS: Record<string, string> = {
  'HIGHEST': '#EF4444',     // Đỏ khẩn cấp
  'HIGH': '#F97316',        // Cam hệ thống (chủ đạo)
  'MEDIUM': '#3B82F6',      // Xanh dương trung bình
  'LOW': '#10B981',        // Xanh lá thấp
  'NOT_STARTED': '#9CA3AF', // Xám chưa xác định
};

const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white/95 backdrop-blur-sm border border-gray-100 rounded-lg p-2 shadow-md">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: data.color }} />
          <span className="text-xs font-semibold text-gray-700">{data.name}</span>
        </div>
        <div className="text-xs text-gray-500 mt-0.5 pl-3.5">
          Số lượng: <span className="font-bold text-gray-800 font-mono">{data.value}</span> ({data.percentage}%)
        </div>
      </div>
    );
  }
  return null;
};

const TaskPriorityPieChart: React.FC<TaskPriorityListProps> = ({ data }) => {
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

  // Map database priorities to clean chart representation
  const orderedKeys = ['HIGHEST', 'HIGH', 'MEDIUM', 'LOW', 'NOT_STARTED'];
  const chartData = orderedKeys
    .map(key => {
      const item = data.find(d => d.priority === key);
      const val = item ? item.count : 0;
      const pct = total > 0 ? Math.round((val / total) * 100) : 0;
      return {
        name: PRIORITY_LABELS[key] || key,
        value: val,
        color: PRIORITY_COLORS[key] || '#9CA3AF',
        percentage: pct,
      };
    })
    // Keep all priorities to make the donut and legend comprehensive
    .filter(item => item.value >= 0);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 min-h-[180px]">
      {/* Left: Interactive Donut Chart */}
      <div className="relative w-[150px] h-[150px] flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={68}
              paddingAngle={3}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomPieTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        {/* Absolute Centered text to show total count */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold text-gray-800 font-mono leading-none">{total}</span>
          <span className="text-[9px] uppercase tracking-wider text-gray-400 font-semibold mt-1">Công việc</span>
        </div>
      </div>

      {/* Right: Detailed Minimalist Legend List */}
      <div className="flex-1 w-full space-y-1.5">
        {chartData.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
              <span className="font-medium text-gray-600 truncate">{item.name}</span>
            </div>
            <div className="flex items-center gap-2 font-mono flex-shrink-0">
              <span className="text-gray-900 font-bold">{item.value}</span>
              <span className="text-gray-400 text-[10px]">({item.percentage}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskPriorityPieChart;