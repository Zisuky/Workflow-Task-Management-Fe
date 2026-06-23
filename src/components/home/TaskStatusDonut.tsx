import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

interface TaskStatusData {
  status: string;    // TO_DO, IN_PROGRESS, PAUSED, DONE
  count: number;
}

interface TaskStatusRadarProps {
  data: TaskStatusData[];
}

const STATUS_LABELS: Record<string, string> = {
  'TO_DO': 'Cần làm',
  'IN_PROGRESS': 'Đang thực hiện',
  'PAUSED': 'Tạm dừng',
  'DONE': 'Hoàn thành',
};

const STATUS_COLORS: Record<string, string> = {
  'TO_DO': '#3B82F6',       // Xanh dương
  'IN_PROGRESS': '#F97316', // Cam chủ đạo
  'PAUSED': '#EAB308',      // Vàng
  'DONE': '#22C55E',        // Xanh lá
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white/95 backdrop-blur-sm border border-gray-100 rounded-lg p-2.5 shadow-lg">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
          <span className="text-xs font-semibold text-gray-700">{data.subject}</span>
        </div>
        <div className="text-sm font-bold text-gray-900 font-mono pl-4">
          {data.count} công việc
        </div>
      </div>
    );
  }
  return null;
};

const TaskStatusRadar: React.FC<TaskStatusRadarProps> = ({ data }) => {
  const total = data.reduce((sum, s) => sum + s.count, 0);

  if (!data || data.length === 0 || total === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[220px] gap-2">
        <svg className="w-10 h-10 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
        </svg>
        <span className="text-sm text-gray-400">Không có dữ liệu trong kỳ</span>
      </div>
    );
  }

  const orderedKeys = ['TO_DO', 'IN_PROGRESS', 'PAUSED', 'DONE'];

  // Map to fixed order to ensure perfect radar shape structure
  const chartData = orderedKeys.map(key => {
    const item = data.find(d => d.status === key);
    return {
      status: key,
      subject: STATUS_LABELS[key] || key,
      count: item ? item.count : 0,
      color: STATUS_COLORS[key] || '#9CA3AF',
    };
  });

  return (
    <div className="w-full h-full flex flex-col justify-between">
      {/* Radar Chart Wrapper */}
      <div className="w-full h-[180px] flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
            <PolarGrid stroke="#F3F4F6" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: '#4B5563', fontSize: 11, fontWeight: 500 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 'auto']}
              tick={{ fill: '#9CA3AF', fontSize: 9 }}
              axisLine={false}
            />
            <Radar
              name="Công việc"
              dataKey="count"
              stroke="#F97316"
              fill="#F97316"
              fillOpacity={0.15}
              dot={{ r: 4, fill: '#F97316', strokeWidth: 2, stroke: '#FFF' }}
            />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend list below */}
      <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-gray-100">
        {chartData.map((item, i) => (
          <div key={i} className="flex items-center justify-between px-3 py-1.5 bg-gray-50 rounded-lg transition-colors hover:bg-gray-100/70">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-xs font-medium text-gray-600 truncate">{item.subject}</span>
            </div>
            <span className="text-xs font-bold text-gray-900 font-mono ml-2">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskStatusRadar;