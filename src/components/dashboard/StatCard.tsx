import type { StatCard } from '../../models';
const colorClasses = {
    blue: 'from-blue-50 to-indigo-100',
    green: 'from-green-50 to-emerald-100',
    purple: 'from-purple-50 to-violet-100',
    orange: 'from-amber-50 to-orange-100',
};
interface StatCardProps {
    stat: StatCard;
}
const StatCardComponent: React.FC<StatCardProps> = ({ stat }) => {
    return (
        <div className="bg-white rounded-2xl p-6 flex items-center gap-4 shadow-sm cursor-pointer
                    transition-all duration-300 ease-out
                    hover:-translate-y-1 hover:shadow-xl hover:shadow-gray-200/50
                    active:scale-[0.98] active:shadow-md
                    group">
            <div className={`w-14 h-14 bg-gradient-to-br ${colorClasses[stat.color as keyof typeof colorClasses]} rounded-xl flex items-center justify-center text-2xl
                       transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                {stat.icon}
            </div>
            <div className="flex flex-col gap-1">
                <span className="text-2xl font-bold text-gray-800 transition-colors group-hover:text-gray-900">
                    {stat.value}
                </span>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">{stat.title}</span>
                    {stat.trend && (
                        <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full transition-all duration-300
                             ${stat.trend.isPositive
                                ? 'text-green-600 bg-green-50 group-hover:bg-green-100'
                                : 'text-red-600 bg-red-50 group-hover:bg-red-100'}`}>
                            {stat.trend.isPositive ? '↑' : '↓'} {stat.trend.value}%
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};
export default StatCardComponent;
