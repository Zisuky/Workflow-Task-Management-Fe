import React from 'react';

interface TaskPriorityData {
  priority: string;
  count: number;
  color: string;
}

interface TaskPriorityListProps {
  data: TaskPriorityData[];
}

const TaskPriorityList: React.FC<TaskPriorityListProps> = ({ data }) => {
  return (
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={index} className="flex items-center justify-between h-9">
          <div className="flex items-center gap-3">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm text-[#111827]">{item.priority}</span>
          </div>
          <span className="text-sm font-medium text-[#111827]">{item.count}</span>
        </div>
      ))}
    </div>
  );
};

export default TaskPriorityList;