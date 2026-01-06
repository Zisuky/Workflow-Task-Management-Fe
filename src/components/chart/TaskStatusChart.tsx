import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
interface TaskStatusData {
  status: string;
  count: number;
  color: string;
}
interface TaskStatusChartProps {
  data: TaskStatusData[];
}
const TaskStatusChart: React.FC<TaskStatusChartProps> = ({ data }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const chartData = data.map(item => ({
    name: item.status,
    value: item.count,
    color: item.color
  }));

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = ((data.value / total) * 100).toFixed(1);
      return (
        <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg text-sm border border-gray-700">
          <p className="font-medium">{data.name}</p>
          <p className="text-gray-300">
            Số lượng: <span className="text-white font-medium">{data.value}</span>
          </p>
          <p className="text-gray-300">
            Tỷ lệ: <span className="text-white font-medium">{percentage}%</span>
          </p>
        </div>
      );
    }
    return null;
  };
  const renderLegend = (props: any) => {
    const { payload } = props;
    return (
      <div className="flex flex-col gap-2 ml-4">
        {payload.map((entry: any, index: number) => {
          const isActive = activeIndex === index;
          const itemData = data.find(d => d.status === entry.value);
          const percentage = itemData ? ((itemData.count / total) * 100).toFixed(1) : '0';

          return (
            <div
              key={index}
              className={`flex items-center gap-2 p-2 rounded-md transition-all duration-200 cursor-pointer ${isActive ? 'bg-gray-50 shadow-sm' : 'hover:bg-gray-25'
                }`}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <div
                className={`w-3 h-3 rounded-full transition-all duration-200 ${isActive ? 'w-4 h-4 shadow-md' : ''
                  }`}
                style={{ backgroundColor: entry.color }}
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className={`text-sm transition-colors duration-200 ${isActive ? 'text-gray-900 font-medium' : 'text-gray-700'
                    }`}>
                    {entry.value}
                  </span>
                  <span className={`text-xs transition-colors duration-200 ${isActive ? 'text-gray-700 font-medium' : 'text-gray-500'
                    }`}>
                    {percentage}%
                  </span>
                </div>
                <div className={`text-xs transition-colors duration-200 ${isActive ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                  {itemData?.count} công việc
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  return (
    <div className="w-full h-full flex items-center [&_*]:!outline-none [&_*:focus]:!outline-none">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <Pie
            data={chartData}
            cx="40%"
            cy="50%"
            labelLine={false}
            outerRadius={60}
            fill="#8884d8"
            dataKey="value"
            onMouseEnter={onPieEnter}
            onMouseLeave={onPieLeave}
            animationBegin={0}
            animationDuration={800}
            style={{ outline: 'none' }}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                stroke={activeIndex === index ? '#ffffff' : 'none'}
                strokeWidth={activeIndex === index ? 2 : 0}
                style={{
                  filter: activeIndex === index ? 'brightness(1.1)' : 'brightness(1)',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            content={renderLegend}
            verticalAlign="middle"
            align="right"
            layout="vertical"
            wrapperStyle={{ paddingLeft: '20px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
export default TaskStatusChart;
