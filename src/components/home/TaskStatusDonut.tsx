import React from 'react';

interface TaskStatusData {
  status: string;    // raw code from backend: TO_DO, IN_PROGRESS, etc.
  count: number;
  color: string;
  percentage: number;
}

interface TaskStatusAnalyticsProps {
  data: TaskStatusData[];
}

const STATUS_META: Record<string, { label: string; icon: string; bgLight: string }> = {
  'TO_DO':       { label: 'Cần làm',          icon: '○', bgLight: 'bg-blue-50'   },
  'NOT_STARTED': { label: 'Chưa bắt đầu',     icon: '○', bgLight: 'bg-blue-50'   },
  'IN_PROGRESS': { label: 'Đang thực hiện',   icon: '◑', bgLight: 'bg-orange-50' },
  'PAUSED':      { label: 'Tạm dừng',         icon: '⏸', bgLight: 'bg-yellow-50' },
  'REVIEWING':   { label: 'Đang review',      icon: '◷', bgLight: 'bg-purple-50' },
  'DONE':        { label: 'Hoàn thành',       icon: '●', bgLight: 'bg-green-50'  },
  'COMPLETED':   { label: 'Hoàn thành',       icon: '●', bgLight: 'bg-green-50'  },
};

const STATUS_COLORS: Record<string, string> = {
  'TO_DO':       '#3B82F6',
  'NOT_STARTED': '#3B82F6',
  'IN_PROGRESS': '#F97316',
  'PAUSED':      '#EAB308',
  'REVIEWING':   '#8B5CF6',
  'DONE':        '#22C55E',
  'COMPLETED':   '#22C55E',
};

const TaskStatusAnalytics: React.FC<TaskStatusAnalyticsProps> = ({ data }) => {
  const total = data.reduce((sum, s) => sum + s.count, 0);

  if (!data || data.length === 0 || total === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[180px] gap-2">
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

  // Recalculate percentage from raw count to ensure accuracy
  const enriched = data.map(item => {
    const code = item.status; // expected to be raw code, not translated
    const pct = total > 0 ? Math.round((item.count / total) * 1000) / 10 : 0;
    const color = STATUS_COLORS[code] || item.color || '#9CA3AF';
    const meta = STATUS_META[code];
    return {
      ...item,
      label: meta?.label || code,
      icon: meta?.icon || '●',
      bgLight: meta?.bgLight || 'bg-gray-50',
      color,
      percentage: pct,
    };
  }).filter(item => item.count > 0);

  const maxCount = Math.max(...enriched.map(d => d.count), 1);

  return (
    <div className="w-full h-full flex flex-col gap-4">
      {/* Top KPI pills */}
      <div className="grid grid-cols-2 gap-2">
        {enriched.slice(0, 4).map((item, i) => (
          <div
            key={i}
            className={`${item.bgLight} rounded-xl px-3 py-2 flex items-center justify-between`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-base" style={{ color: item.color }}>{item.icon}</span>
              <span className="text-xs font-medium text-gray-600 truncate">{item.label}</span>
            </div>
            <div className="flex flex-col items-end ml-2 flex-shrink-0">
              <span className="text-sm font-bold tabular-nums" style={{ color: item.color }}>
                {item.count}
              </span>
              <span className="text-[10px] text-gray-400 leading-tight">{item.percentage}%</span>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics bar list */}
      <div className="flex flex-col gap-2.5">
        {enriched.map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            {/* Label */}
            <span className="text-xs text-gray-500 w-[96px] flex-shrink-0 font-medium leading-tight">{item.label}</span>

            {/* Bar track */}
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${(item.count / maxCount) * 100}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>

            {/* Count */}
            <span className="text-xs font-bold tabular-nums text-gray-700 w-6 text-right">{item.count}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-auto pt-2 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Tổng</span>
        <span className="text-sm font-bold text-gray-700 tabular-nums">{total} tasks</span>
      </div>
    </div>
  );
};

export default TaskStatusAnalytics;