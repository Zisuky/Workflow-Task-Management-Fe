import React, { useState, useEffect } from 'react';
import ChartDashboardView from './ChartDashboardView';
import { dashboardService } from '../../services';

interface ChartData {
    taskStatus: Array<{ status: string; count: number; color: string }>;
    priorityCount: Array<{ priority: string; count: number; color: string }>;
    alerts: Array<{ id: string; taskCode: string; message: string; projectCode: string }>;
    productivity: Array<{ month: string; target: number; actual: number }>;
}

const statusColors: Record<string, string> = {
    'To Do': '#94A3B8',
    'In Progress': '#3B82F6',
    'Done': '#22C55E',
    'Blocked': '#EF4444',
    'In Review': '#F59E0B'
};

const priorityColors: Record<string, string> = {
    'Low': '#22C55E',
    'Medium': '#F59E0B',
    'High': '#EF4444',
    'Highest': '#DC2626'
};

const defaultChartData: ChartData = {
    taskStatus: [],
    priorityCount: [],
    alerts: [],
    productivity: []
};

const ChartPage: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [chartData, setChartData] = useState<ChartData>(defaultChartData);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [taskStatus, priorityCount, productivity, alerts] = await Promise.all([
                    dashboardService.getTaskStatus(),
                    dashboardService.getPriority(),
                    dashboardService.getProductivity(),
                    dashboardService.getAlerts()
                ]);
                setChartData({
                    taskStatus: taskStatus.map(t => ({
                        status: t.status,
                        count: t.count,
                        color: statusColors[t.status] || '#6B7280'
                    })),
                    priorityCount: priorityCount.map(p => ({
                        priority: p.priority,
                        count: p.count,
                        color: priorityColors[p.priority] || '#6B7280'
                    })),
                    productivity: productivity.map(p => ({ month: p.month, target: p.total, actual: p.completed })),
                    alerts: alerts.map(a => ({ id: a.id, taskCode: a.taskCode, message: a.message, projectCode: a.projectCode }))
                });
            } catch (err) {
                console.error('Failed to fetch dashboard:', err);
                setError('Không thể tải dữ liệu. Đang dùng dữ liệu mẫu.');
                setChartData(defaultChartData);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <>
            {error && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm">
                    ⚠️ {error}
                </div>
            )}
            <ChartDashboardView
                data={chartData}
                isLoading={isLoading}
            />
        </>
    );
};

export default ChartPage;

