interface HeaderProps {
    title?: string;
    onBack?: () => void;
    onAddJob?: () => void;
    onAddProject?: () => void;
    onTimeline?: () => void;
    isJobPage?: boolean;
    showBackButton?: boolean;
    isChartPage?: boolean;
    isHomePage?: boolean;
    isWorkflowPage?: boolean;
    onTimeFilterChange?: (filter: string) => void;
    currentTimeFilter?: string;
    isTemplatePage?: boolean;
    onAddTemplate?: () => void;
}
const Header: React.FC<HeaderProps> = ({
    title = 'Trang chủ',
    onBack,
    onAddJob,
    onAddProject,
    onTimeline,
    isJobPage = false,
    showBackButton = false,
    isChartPage = false,
    isHomePage = false,
    isWorkflowPage = false,
    onTimeFilterChange,
    currentTimeFilter = 'all',
    isTemplatePage = false,
    onAddTemplate
}) => {
    const handleButtonClick = () => {
        if (isJobPage) {
            onAddJob?.();
        } else {
            onAddProject?.();
        }
    };
    const buttonText = isJobPage ? 'Thêm Công việc' : 'Thêm Dự Án';
    return (
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-40">
            <div className="flex items-center gap-3">
                {showBackButton ? (
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Quay lại
                    </button>
                ) : (
                    <h1 className="text-base font-medium text-gray-800">{title}</h1>
                )}

                {/* Flow Stats - Only on Workflow page */}
                {isWorkflowPage && (
                    <div className="flex items-center gap-4 ml-6 pl-6 border-l border-gray-200">
                        <div className="flex items-center gap-1.5 text-sm">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            <span className="text-gray-500">Flow Health:</span>
                            <span className="font-semibold text-gray-900">86%</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm">
                            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                            <span className="text-gray-500">Blocked:</span>
                            <span className="font-semibold text-gray-900">2</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            <span className="text-gray-500">Avg Cycle Time:</span>
                            <span className="font-semibold text-gray-900">3.4 days</span>
                        </div>
                    </div>
                )}
            </div>
            {!showBackButton && (
                <div id="header-right-actions" className="flex items-center gap-3">
                    {(isChartPage || isHomePage) ? (
                        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                            {[
                                { key: 'day', label: 'Day' },
                                { key: 'week', label: 'Week' },
                                { key: 'month', label: 'Month' },
                                { key: 'year', label: 'Year' }
                            ].map((filter) => (
                                <button
                                    key={filter.key}
                                    onClick={() => onTimeFilterChange?.(filter.key)}
                                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${currentTimeFilter === filter.key
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <>
                            {isJobPage && (
                                <button
                                    onClick={onTimeline}
                                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                                    </svg>
                                    <span>Timeline</span>
                                </button>
                            )}
                            {!isHomePage && !isWorkflowPage && !isTemplatePage && (
                                <button onClick={handleButtonClick} className="flex items-center gap-2 bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                    <span>{buttonText}</span>
                                </button>
                            )}
                            {isTemplatePage && (
                                <button
                                    onClick={onAddTemplate}
                                    className="flex items-center gap-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                    <span>Thêm Template</span>
                                </button>
                            )}
                        </>
                    )}
                </div>
            )}
        </header>
    );
};
export default Header;
