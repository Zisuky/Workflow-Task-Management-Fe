import type { StatCard } from '../models';
export const mockStats: StatCard[] = [
    { id: '1', title: 'Total Users', value: '1,234', icon: '📊', trend: { value: 12.5, isPositive: true }, color: 'blue' },
    { id: '2', title: 'Revenue', value: '$45,678', icon: '💰', trend: { value: 8.2, isPositive: true }, color: 'green' },
    { id: '3', title: 'Growth', value: '+12.5%', icon: '📈', trend: { value: 5.1, isPositive: true }, color: 'purple' },
    { id: '4', title: 'Tasks Done', value: '89', icon: '✅', trend: { value: 2.3, isPositive: false }, color: 'orange' },
];
