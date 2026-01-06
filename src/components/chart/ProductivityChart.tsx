import React from 'react';
interface MonthlyData {
  month: string;
  target: number;
  actual: number;
}
interface ProductivityChartProps {
  data: MonthlyData[];
}
const ProductivityChart: React.FC<ProductivityChartProps> = ({ data }) => {
  const maxValue = Math.max(...data.map(d => Math.max(d.target, d.actual)));
  const yAxisMax = Math.ceil(maxValue / 1000) * 1000;
  const chartHeight = 200;
  const chartWidth = 600;
  const barWidth = 40;
  const groupWidth = 50;
  const getBarHeight = (value: number) => (value / yAxisMax) * chartHeight;
  const yLabels = [];
  for (let i = 0; i <= 6; i++) {
    yLabels.push((yAxisMax / 6) * i);
  }
  return (
    <div className="w-full">
      <div className="flex">
        {/* Y-axis */}
        <div className="flex flex-col justify-between h-64 w-12 text-xs text-gray-500 pr-2">
          {yLabels.reverse().map((label, index) => (
            <div key={index} className="text-right">
              {label >= 1000 ? `${label/1000}k` : label}
            </div>
          ))}
        </div>
        {/* Chart area */}
        <div className="flex-1 relative">
          <svg width="100%" height="240" viewBox={`0 0 ${chartWidth} 240`} className="overflow-visible">
            {/* Grid lines */}
            {yLabels.map((_, index) => (
              <line
                key={index}
                x1="0"
                y1={20 + (index * (chartHeight / 6))}
                x2={chartWidth}
                y2={20 + (index * (chartHeight / 6))}
                stroke="#f3f4f6"
                strokeWidth="1"
              />
            ))}
            {/* Bars */}
            {data.map((item, index) => {
              const x = index * groupWidth + 20;
              const targetHeight = getBarHeight(item.target);
              const actualHeight = getBarHeight(item.actual);
              return (
                <g key={index}>
                  {/* Target bar (background) */}
                  <rect
                    x={x}
                    y={20 + chartHeight - targetHeight}
                    width={barWidth * 0.8}
                    height={targetHeight}
                    fill="#e5e7eb"
                    rx="2"
                  />
                  {/* Actual bar (foreground) */}
                  <rect
                    x={x + 2}
                    y={20 + chartHeight - actualHeight}
                    width={barWidth * 0.6}
                    height={actualHeight}
                    fill="#3b82f6"
                    rx="2"
                    className="hover:fill-blue-600 transition-colors cursor-pointer"
                  />
                </g>
              );
            })}
          </svg>
          {/* X-axis labels */}
          <div className="flex justify-between mt-2 px-5">
            {data.map((item, index) => (
              <div key={index} className="text-xs text-gray-500 text-center" style={{ width: `${groupWidth}px` }}>
                {item.month}
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-300 rounded"></div>
          <span className="text-sm text-gray-600">Mục tiêu</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span className="text-sm text-gray-600">Thực tế</span>
        </div>
      </div>
    </div>
  );
};
export default ProductivityChart;
