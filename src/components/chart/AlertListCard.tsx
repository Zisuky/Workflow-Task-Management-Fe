import React from 'react';
import { useNavigate } from 'react-router-dom';

interface AlertData {
  id: string;
  taskCode: string;
  projectCode: string;
  message: string;
}

interface AlertListCardProps {
  alerts: AlertData[];
}
const AlertIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const AlertListCard: React.FC<AlertListCardProps> = ({ alerts }) => {
  const navigate = useNavigate();

  const handleAlertClick = (taskCode: string) => {
    // Map taskCode to job ID for navigation
    const jobIdMap: { [key: string]: string } = {
      'UIUX001': '1',
      '0012911': '2', 
      'TESTING001': '3',
      'DATABASE001': '4',
      'DOCUMENTATION001': '5',
      'FRONTEND001': '6',
      'BACKEND002': '7',
      'DESIGN001': '8'
    };
    
    const jobId = jobIdMap[taskCode];
    if (jobId) {
      navigate(`/job/${jobId}`);
    }
  };

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {alerts.map((alert) => (
        <div 
          key={alert.id}
          onClick={() => handleAlertClick(alert.taskCode)}
          className="flex items-start gap-3 p-3 bg-yellow-50 border-l-4 border-orange-400 rounded-r-lg hover:bg-yellow-100 transition-colors cursor-pointer"
        >
          <div className="text-orange-500 flex-shrink-0 mt-0.5">
            <AlertIcon />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">
              <span className="font-bold">{alert.taskCode}</span> {alert.message}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              (dự án {alert.projectCode})
            </p>
          </div>
        </div>
      ))}
      {alerts.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">✅</div>
          <p className="text-sm">Không có cảnh báo nào</p>
        </div>
      )}
    </div>
  );
};
export default AlertListCard;
