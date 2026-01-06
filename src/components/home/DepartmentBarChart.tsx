import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface DepartmentData {
  department: string;
  count: number;
}

interface DepartmentBarChartProps {
  data: DepartmentData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="text-sm font-semibold text-[#111827] mb-1">{label}</p>
        <div className="text-sm text-[#6B7280]">
          Số lượng task: <span className="font-medium" style={{ color: payload[0]?.color }}>{payload[0]?.value}</span>
        </div>
      </div>
    );
  }
  return null;
};

const DepartmentBarChart: React.FC<DepartmentBarChartProps> = ({ data }) => {
  // Handle empty data case
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-gray-400">
        Không có dữ liệu
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <XAxis 
          dataKey="department" 
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: '#6B7280' }}
        />
        <YAxis 
          allowDecimals={false}
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: '#6B7280' }}
        />
        <Tooltip 
          content={<CustomTooltip />}
          cursor={false}
          wrapperStyle={{ 
            outline: 'none',
            zIndex: 50,
            pointerEvents: 'none'
          }}
        />
        <Bar 
          dataKey="count" 
          fill="#C4B5FD" 
          radius={[8, 8, 0, 0]}
          maxBarSize={36}
          isAnimationActive
          animationDuration={600}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default DepartmentBarChart;