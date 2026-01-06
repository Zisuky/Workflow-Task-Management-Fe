import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

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
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="text-sm font-semibold text-[#111827] mb-1">{data.name}</p>
        <div className="space-y-1">
          <div className="text-sm text-[#6B7280]">
            Số lượng: <span className="font-medium" style={{ color: data.color }}>{data.count}</span>
          </div>
          <div className="text-sm text-[#6B7280]">
            Tỷ lệ: <span className="font-medium" style={{ color: data.color }}>{data.percentage}%</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const TaskStatusDonut: React.FC<TaskStatusDonutProps> = ({ data }) => {
  // Handle empty data case
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-gray-400">
        Không có dữ liệu
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

  const renderCustomLabel = (entry: any) => {
    return `${entry.percentage}%`;
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Donut Chart */}
      <div className="flex-1 flex items-center justify-center">
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={70}
              paddingAngle={2}
              dataKey="value"
              label={renderCustomLabel}
              labelLine={false}
              isAnimationActive
              animationDuration={600}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              content={<CustomTooltip />}
              wrapperStyle={{ 
                outline: 'none',
                zIndex: 50,
                pointerEvents: 'none'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Custom Legend */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm mt-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-[#6B7280]">{item.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskStatusDonut;