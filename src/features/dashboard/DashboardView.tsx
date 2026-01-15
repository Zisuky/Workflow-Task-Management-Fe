import { useEffect, useRef } from 'react';
import type { Project } from '../../models';
interface DashboardViewProps {
    isLoading: boolean;
    searchTerm: string;
    projects: Project[];
    hasMore: boolean;
    isLoadingMore: boolean;
    onSearchChange: (term: string) => void;
    onTogglePin: (id: string) => void;
    onLoadMore: () => void;
    onProjectClick?: (project: Project) => void;
    onViewDetail?: (project: Project) => void;
}
const DashboardView: React.FC<DashboardViewProps> = ({
    isLoading,
    searchTerm,
    projects,
    hasMore,
    isLoadingMore,
    onSearchChange,
    onTogglePin,
    onLoadMore,
    onProjectClick,
    onViewDetail,
}) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const loadMoreTriggerRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
                    onLoadMore();
                }
            },
            { threshold: 0.1 }
        );
        if (loadMoreTriggerRef.current) {
            observer.observe(loadMoreTriggerRef.current);
        }
        return () => observer.disconnect();
    }, [hasMore, isLoadingMore, onLoadMore]);
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-orange-200 rounded-full animate-spin border-t-[#F79E61]"></div>
                    <span className="text-gray-500 animate-pulse">Đang tải...</span>
                </div>
            </div>
        );
    }
    return (
        <div className="animate-fadeIn">
            <div className="mb-6 animate-slideDown relative z-50">
                <div className="relative max-w-md">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </span>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Tìm Mã dự án hoặc Tên dự án"
                        className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F79E61]/50 focus:border-[#F79E61] transition-all duration-200 hover:border-gray-300"
                    />
                    {/* Search Suggestions Dropdown */}
                    {searchTerm.length > 0 && projects.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto animate-slideDown">
                            {projects.slice(0, 5).map((project) => (
                                <button
                                    key={project.id}
                                    type="button"
                                    onClick={() => onSearchChange(project.code)}
                                    className="w-full px-4 py-3 text-left hover:bg-orange-50 transition-colors flex items-center gap-3 border-b border-gray-100 last:border-b-0"
                                >
                                    <span className="text-[#F79E61] font-medium text-sm">{project.code}</span>
                                    <span className="text-gray-600 text-sm truncate">{project.name}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <div ref={scrollContainerRef} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-slideUp max-h-[600px] flex flex-col">
                <div className="bg-gradient-to-r from-[#F79E61] to-[#f0884a] text-white sticky top-0 z-10 flex-shrink-0">
                    <div className="grid grid-cols-12 gap-4 px-6 py-4 text-sm font-semibold">
                        <div className="col-span-1 text-center">Ghim</div>
                        <div className="col-span-2">Mã Dự Án</div>
                        <div className="col-span-3">Tên Dự Án</div>
                        <div className="col-span-2">Người Phụ Trách</div>
                        <div className="col-span-2">Người Thực Hiện</div>
                        <div className="col-span-2 text-center">Thao tác</div>
                    </div>
                </div>
                <div className="divide-y divide-gray-100 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-orange-200 scrollbar-track-gray-50 hover:scrollbar-thumb-orange-300">
                    {projects.map((project, index) => (
                        <div
                            key={project.id}
                            onClick={() => onProjectClick?.(project)}
                            className="grid grid-cols-12 gap-4 px-6 py-4 text-sm hover:bg-orange-50/50 transition-colors duration-200 cursor-pointer group animate-slideUp"
                            style={{ animationDelay: `${Math.min(index, 10) * 50}ms` }}
                        >
                            <div className="col-span-1 flex justify-center">
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); onTogglePin(project.id); }}
                                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-90 relative z-10 ${project.isPinned ? 'bg-[#F79E61] border-[#F79E61]' : 'border-gray-300 hover:border-[#F79E61] bg-white'}`}
                                >
                                    {project.isPinned && (
                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            <div className="col-span-2 text-[#F79E61] font-medium group-hover:text-[#e88d50] transition-colors">{project.code}</div>
                            <div className="col-span-3 text-gray-800 font-medium">{project.name}</div>
                            <div className="col-span-2 text-gray-600 truncate">{project.manager}</div>
                            <div className="col-span-2 text-gray-600 truncate">{project.assignee}</div>
                            <div className="col-span-2 flex justify-center">
                                <button
                                    onClick={(e) => { e.stopPropagation(); onViewDetail?.(project); }}
                                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gradient-to-r from-[#F79E61] to-[#f0884a] text-white hover:from-[#e88d50] hover:to-[#e07d3a] transition-all shadow-sm hover:shadow-md"
                                >
                                    Xem chi tiết
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                {/* Infinite scroll trigger */}
                <div ref={loadMoreTriggerRef} className="h-1" />
                {/* Loading more indicator */}
                {isLoadingMore && (
                    <div className="px-6 py-4 flex items-center justify-center gap-2 text-gray-500">
                        <div className="w-5 h-5 border-2 border-orange-200 rounded-full animate-spin border-t-[#F79E61]"></div>
                        <span className="text-sm">Đang tải thêm...</span>
                    </div>
                )}
                {projects.length === 0 && (
                    <div className="px-6 py-12 text-center text-gray-500 animate-fadeIn">
                        <span className="text-4xl mb-4 block"></span>
                        Không tìm thấy dự án nào
                    </div>
                )}
            </div>
        </div>
    );
};
export default DashboardView;
