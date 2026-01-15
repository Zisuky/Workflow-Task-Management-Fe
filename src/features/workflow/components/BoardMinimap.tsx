import React, { useEffect, useRef, useState, useCallback } from 'react';

interface BoardMinimapProps {
    containerRef: React.RefObject<HTMLDivElement | null>;
    columnCount: number;
}

interface ScrollInfo {
    left: number;
    width: number;
    totalWidth: number;
}

const BoardMinimap: React.FC<BoardMinimapProps> = ({ containerRef, columnCount }) => {
    const minimapRef = useRef<HTMLDivElement>(null);
    const [scrollInfo, setScrollInfo] = useState<ScrollInfo>({ left: 0, width: 0, totalWidth: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [showMinimap, setShowMinimap] = useState(false);

    const handleScroll = useCallback(() => {
        const container = containerRef.current;
        if (container) {
            const scrollLeft = container.scrollLeft;
            const scrollWidth = container.scrollWidth;
            const clientWidth = container.clientWidth;

            setScrollInfo({ left: scrollLeft, width: clientWidth, totalWidth: scrollWidth });
            setShowMinimap(scrollWidth > clientWidth);
        }
    }, [containerRef]);

    const getViewportStyle = () => {
        if (scrollInfo.totalWidth === 0) return { left: '0%', width: '100%' };

        const leftPercent = (scrollInfo.left / scrollInfo.totalWidth) * 100;
        const widthPercent = (scrollInfo.width / scrollInfo.totalWidth) * 100;

        return {
            left: `${leftPercent}%`,
            width: `${widthPercent}%`
        };
    };

    const handleMinimapClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isDragging) return;

        const container = containerRef.current;
        const minimap = minimapRef.current;

        if (!container || !minimap) return;

        const minimapRect = minimap.getBoundingClientRect();
        const clickX = e.clientX - minimapRect.left;
        const clickPercent = clickX / minimapRect.width;

        const maxScrollLeft = container.scrollWidth - container.clientWidth;
        const targetScrollLeft = clickPercent * container.scrollWidth - container.clientWidth / 2;

        container.scrollTo({
            left: Math.max(0, Math.min(targetScrollLeft, maxScrollLeft)),
            behavior: 'smooth'
        });
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging) return;

        const container = containerRef.current;
        const minimap = minimapRef.current;

        if (!container || !minimap) return;

        const minimapRect = minimap.getBoundingClientRect();
        const mouseX = e.clientX - minimapRect.left;
        const mousePercent = mouseX / minimapRect.width;

        const maxScrollLeft = container.scrollWidth - container.clientWidth;
        const targetScrollLeft = mousePercent * container.scrollWidth - container.clientWidth / 2;

        container.scrollLeft = Math.max(0, Math.min(targetScrollLeft, maxScrollLeft));
    }, [isDragging, containerRef]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Add scroll listener
        container.addEventListener('scroll', handleScroll);

        // Use ResizeObserver to detect layout changes (e.g. columns loading)
        const resizeObserver = new ResizeObserver(() => {
            handleScroll();
        });
        resizeObserver.observe(container);

        // Initial check
        handleScroll();

        return () => {
            container.removeEventListener('scroll', handleScroll);
            resizeObserver.disconnect();
        };
    }, [containerRef, handleScroll]);

    // Track drag events
    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    // Track window resize as fallback
    useEffect(() => {
        const handleResize = () => handleScroll();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [handleScroll]);

    if (!showMinimap) return null;

    return (
        <div className="fixed bottom-6 right-6 bg-white p-3 border border-gray-200 rounded-lg shadow-lg z-50 select-none">
            <div
                ref={minimapRef}
                onClick={handleMinimapClick}
                className="relative flex gap-0.5 h-10 bg-gray-100 rounded overflow-hidden cursor-pointer"
                style={{ width: `${Math.min(columnCount * 40, 200)}px` }}
            >
                {/* Các ô đại diện cho cột */}
                {Array.from({ length: columnCount }).map((_, i) => (
                    <div
                        key={i}
                        className="flex-1 bg-gray-200 border-r border-gray-100 last:border-0 hover:bg-gray-300 transition-colors rounded-sm"
                    />
                ))}

                {/* Khung xanh đại diện cho Viewport hiện tại */}
                <div
                    onMouseDown={handleMouseDown}
                    className={`absolute top-0 bottom-0 border-2 border-blue-500 bg-blue-500/20 rounded transition-all ${isDragging ? 'cursor-grabbing' : 'cursor-grab'
                        }`}
                    style={{
                        ...getViewportStyle(),
                        transitionDuration: isDragging ? '0ms' : '75ms'
                    }}
                />
            </div>

            {/* Tooltip hướng dẫn */}
            <p className="text-[10px] text-gray-400 mt-1.5 text-center">
                Click hoặc kéo để điều hướng
            </p>
        </div>
    );
};

export default BoardMinimap;
