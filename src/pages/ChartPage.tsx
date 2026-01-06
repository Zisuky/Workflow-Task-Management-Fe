import React, { useState, useEffect } from 'react';
import { ChartDashboardView } from '../views/chart';
import { dashboardService } from '../services';
import { mockChartData } from '../data';

const ChartPage: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [chartData, setChartData] = useState(mockChartData);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const data = await dashboardService.getChartData();
                setChartData({
                    taskStatus: data.taskStatus,
                    priorityCount: data.priorityCount,
                    alerts: data.alerts,
                    productivity: data.productivity
                });
            } catch (err) {
                console.error('Failed to fetch dashboard:', err);
                setError('Không thể tải dữ liệu. Đang dùng dữ liệu mẫu.');
                setChartData(mockChartData);
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
