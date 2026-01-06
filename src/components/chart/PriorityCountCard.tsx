import React from 'react';
interface PriorityData {
  priority: string;
  count: number;
  color: string;
}
interface PriorityCountCardProps {
  data: PriorityData[];
}
const PriorityCountCard: React.FC<PriorityCountCardProps> = ({ data }) => {
  return (
    <div className="space-y-3">
      {data.map((item, index) => (
        <div 
          key={index}
          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm font-medium text-gray-700">
              {item.priority}
            </span>
          </div>
          <span className="text-sm font-bold text-gray-900">
            {item.count}
          </span>
        </div>
      ))}
    </div>
  );
};
export default PriorityCountCard;
