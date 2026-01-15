import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

interface ProductivityData {
  month: string;
  total: number;
  completed: number;
}

interface ProductivityLineChartProps {
  data: ProductivityData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="text-sm font-medium text-[#111827] mb-2">{label}</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 bg-[#9CA3AF] rounded-full"></div>
            <span className="text-[#6B7280]">Tổng task: {payload[0]?.value}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 bg-[#111827] rounded-full"></div>
            <span className="text-[#6B7280]">Hoàn thành: {payload[1]?.value}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const ProductivityLineChart: React.FC<ProductivityLineChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%" className="!border-none !outline-none ring-0 shadow-none">
      <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis
          dataKey="month"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: '#6B7280' }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: '#6B7280' }}
          domain={[0, 40]}
          ticks={[0, 9, 18, 27, 36]}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="total"
          stroke="#9CA3AF"
          strokeWidth={2}
          dot={{ fill: '#9CA3AF', strokeWidth: 0, r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="completed"
          stroke="#111827"
          strokeWidth={2}
          dot={{ fill: '#111827', strokeWidth: 0, r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ProductivityLineChart;