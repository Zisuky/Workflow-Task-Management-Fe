import React from 'react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

interface TaskStatusData {
  status: string;
  count: number;
  color: string;
  percentage: number;
}

interface TaskStatusDonutProps {
  data: TaskStatusData[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 rounded-lg shadow-md border border-gray-100">
        <p className="text-sm font-semibold text-gray-900 mb-1">{data.name}</p>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between gap-4 text-gray-500">
            <span>Số lượng:</span>
            <span className="font-semibold text-gray-800">{data.count}</span>
          </div>
          <div className="flex justify-between gap-4 text-gray-500">
            <span>Tỷ lệ:</span>
            <span className="font-semibold text-gray-800">{data.percentage}%</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const TaskStatusDonut: React.FC<TaskStatusDonutProps> = ({ data }) => {
  // Handle empty data case
  if (!data || data.length === 0 || data.every(item => item.count === 0)) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[180px] text-sm text-gray-400">
        <span className="text-2xl mb-1">📊</span>
        <span>Không có dữ liệu công việc</span>
      </div>
    );
  }

  const chartData = data.map(item => ({
    name: item.status,
    value: item.count,
    count: item.count,
    color: item.color,
    percentage: item.percentage
  }));

  return (
    <div className="w-full h-full flex flex-col justify-end">
      <div className="flex-1 min-h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 15, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#6B7280', fontWeight: 500 }}
            />
            <YAxis
              allowDecimals={false}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#9CA3AF' }}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: 'rgba(243, 244, 246, 0.6)' }}
              wrapperStyle={{ outline: 'none', zIndex: 50 }}
            />
            <Bar
              dataKey="count"
              radius={[6, 6, 0, 0]}
              maxBarSize={32}
              isAnimationActive
              animationDuration={800}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TaskStatusDonut;