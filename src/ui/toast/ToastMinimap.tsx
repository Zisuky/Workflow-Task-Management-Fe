import { useEffect, useRef, useState, useCallback } from "react";

interface ScrollInfo {
  left: number;
  width: number;
  totalWidth: number;
}

const ToastMinimap = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const minimapRef = useRef<HTMLDivElement>(null);
  const [scrollInfo, setScrollInfo] = useState<ScrollInfo>({ left: 0, width: 0, totalWidth: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [showMinimap, setShowMinimap] = useState(false);

  const columns = ['To do', 'In progress', 'Testing', 'Done'];

  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (container) {
      const scrollLeft = container.scrollLeft;
      const scrollWidth = container.scrollWidth;
      const clientWidth = container.clientWidth;

      setScrollInfo({ left: scrollLeft, width: clientWidth, totalWidth: scrollWidth });

      // Chỉ hiển thị minimap khi nội dung có thể scroll
      setShowMinimap(scrollWidth > clientWidth);
    }
  }, []);

  // Tính toán vị trí và kích thước của viewport indicator (khung xanh)
  const getViewportStyle = () => {
    if (scrollInfo.totalWidth === 0) return { left: '0%', width: '100%' };

    const leftPercent = (scrollInfo.left / scrollInfo.totalWidth) * 100;
    const widthPercent = (scrollInfo.width / scrollInfo.totalWidth) * 100;

    return {
      left: `${leftPercent}%`,
      width: `${widthPercent}%`
    };
  };

  // Xử lý click vào minimap để nhảy đến vị trí tương ứng
  const handleMinimapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    const minimap = minimapRef.current;

    if (!container || !minimap) return;

    const minimapRect = minimap.getBoundingClientRect();
    const clickX = e.clientX - minimapRect.left;
    const clickPercent = clickX / minimapRect.width;

    // Tính toán vị trí scroll mới, căn giữa viewport tại vị trí click
    const maxScrollLeft = container.scrollWidth - container.clientWidth;
    const targetScrollLeft = clickPercent * container.scrollWidth - container.clientWidth / 2;

    container.scrollTo({
      left: Math.max(0, Math.min(targetScrollLeft, maxScrollLeft)),
      behavior: 'smooth'
    });
  };

  // Xử lý kéo (drag) khung xanh
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

    // Tính toán vị trí scroll mới
    const maxScrollLeft = container.scrollWidth - container.clientWidth;
    const targetScrollLeft = mousePercent * container.scrollWidth - container.clientWidth / 2;

    container.scrollLeft = Math.max(0, Math.min(targetScrollLeft, maxScrollLeft));
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Lắng nghe sự kiện scroll
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      // Gọi lần đầu để kiểm tra trạng thái ban đầu
      handleScroll();
    }
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [handleScroll]);

  // Lắng nghe sự kiện drag toàn cục
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

  // Kiểm tra kích thước khi resize
  useEffect(() => {
    const handleResize = () => {
      handleScroll();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleScroll]);

  return (
    <div className="flex flex-col h-screen p-4 bg-gray-50">
      {/* 1. Main Board Area */}
      <div
        ref={containerRef}
        className="flex overflow-x-auto gap-4 p-4 border rounded-lg bg-white shadow-sm custom-scrollbar"
        style={{ scrollBehavior: isDragging ? 'auto' : 'smooth' }}
      >
        {columns.map((col, index) => (
          <div key={index} className="min-w-[350px] h-[500px] bg-gray-100 rounded-md p-4 flex-shrink-0">
            <h3 className="font-bold text-gray-600">{col}</h3>
            <div className="mt-4 h-full border-2 border-dashed border-gray-300 rounded"></div>
          </div>
        ))}
      </div>

      {/* 2. Board Minimap (Bottom Right) - Chỉ hiển thị khi cần scroll */}
      {showMinimap && (
        <div className="fixed bottom-8 right-8 bg-white p-2 border rounded shadow-md w-40 select-none">
          <div
            ref={minimapRef}
            onClick={handleMinimapClick}
            className="relative flex gap-1 h-8 bg-gray-100 rounded overflow-hidden cursor-pointer"
          >
            {/* Các ô đại diện cho cột */}
            {columns.map((_, i) => (
              <div
                key={i}
                className="flex-1 bg-gray-200 border-r border-white last:border-0 hover:bg-gray-300 transition-colors"
              />
            ))}

            {/* Khung xanh đại diện cho Viewport hiện tại */}
            <div
              onMouseDown={handleMouseDown}
              className={`absolute top-0 bottom-0 border-2 border-blue-500 bg-blue-500/20 transition-all ${isDragging ? 'cursor-grabbing' : 'cursor-grab'
                }`}
              style={{
                ...getViewportStyle(),
                transitionDuration: isDragging ? '0ms' : '75ms'
              }}
            />
          </div>

          {/* Tooltip hướng dẫn */}
          <p className="text-xs text-gray-500 mt-1 text-center">
            Click hoặc kéo để điều hướng
          </p>
        </div>
      )}
    </div>
  );
};

export default ToastMinimap;
