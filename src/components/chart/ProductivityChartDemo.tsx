import React from 'react';
import ProductivityChart from './ProductivityChart';

// Demo component để test ProductivityChart
const ProductivityChartDemo: React.FC = () => {
  // Dữ liệu mẫu với các tháng có giá trị khác nhau
  const sampleData = [
    { month: 'JAN', target: 1000, actual: 800 },
    { month: 'FEB', target: 2500, actual: 2000 },
    { month: 'MAR', target: 3000, actual: 2800 },
    { month: 'APR', target: 1200, actual: 800 },
    { month: 'MAY', target: 2200, actual: 1900 },
    { month: 'JUN', target: 3000, actual: 2800 },
    { month: 'JUL', target: 2000, actual: 1500 },
    { month: 'AUG', target: 1200, actual: 900 },
    { month: 'SEP', target: 2500, actual: 2000 },
    { month: 'OCT', target: 1200, actual: 800 },
    { month: 'NOV', target: 2500, actual: 2000 },
    { month: 'DEC', target: 3000, actual: 2800 },
  ];

  // Dữ liệu với empty state (một số tháng = 0)
  const dataWithEmptyState = [
    { month: 'JAN', target: 1500, actual: 1200 },
    { month: 'FEB', target: 1000, actual: 0 }, // Empty state
    { month: 'MAR', target: 3000, actual: 2800 },
    { month: 'APR', target: 1000, actual: 0 }, // Empty state
    { month: 'MAY', target: 2200, actual: 1900 },
    { month: 'JUN', target: 3000, actual: 2800 },
    { month: 'JUL', target: 1000, actual: 0 }, // Empty state
    { month: 'AUG', target: 1200, actual: 900 },
    { month: 'SEP', target: 2500, actual: 2000 },
    { month: 'OCT', target: 1200, actual: 800 },
    { month: 'NOV', target: 1000, actual: 0 }, // Empty state
    { month: 'DEC', target: 3000, actual: 2800 },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Productivity Chart Demo
          </h1>
          <p className="text-gray-600">
            Biểu đồ năng suất với các tính năng UX/UI được cải tiến
          </p>
        </div>

        {/* Chart với dữ liệu đầy đủ */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            📊 Biểu đồ năng suất chuẩn
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Hiển thị đầy đủ dữ liệu 12 tháng với hover effects và animations
          </p>
          <ProductivityChart data={sampleData} />
        </div>

        {/* Chart với empty states */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            📈 Biểu đồ với Empty States
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Một số tháng không có dữ liệu (giá trị = 0) nhưng vẫn giữ thanh xám để duy trì nhịp điệu thị giác
          </p>
          <ProductivityChart data={dataWithEmptyState} />
        </div>

        {/* Chart với maxValue tùy chỉnh */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            🎯 Biểu đồ với mục tiêu tùy chỉnh
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Thay đổi mục tiêu tối đa thành 4000 thay vì 6000 mặc định
          </p>
          <ProductivityChart data={sampleData} />
        </div>

        {/* Tính năng đã cải tiến */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            ✨ Các tính năng đã cải tiến
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-3">🎨 UI Improvements</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Pill-shape bars với bo tròn hoàn toàn</li>
                <li>• Màu tím Indigo (#6366F1) cho dữ liệu chính</li>
                <li>• Background bars xám nhạt (#F3F4F6)</li>
                <li>• Grid lines siêu mỏng với nét đứt</li>
                <li>• Typography hiện đại với proper spacing</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-3">⚡ UX Enhancements</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Hover effects với màu đậm hơn</li>
                <li>• Custom tooltip với thiết kế hiện đại</li>
                <li>• Animation "mọc từ dưới lên" khi load</li>
                <li>• Staggered animation cho từng cột</li>
                <li>• Accessibility support cho screen readers</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Accessibility features */}
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
          <h2 className="text-xl font-semibold text-blue-800 mb-4">
            ♿ Accessibility Features
          </h2>
          <div className="space-y-3 text-sm text-blue-700">
            <p>• <strong>Screen Reader Support:</strong> Hidden text mô tả dữ liệu cho người khiếm thị</p>
            <p>• <strong>High Contrast Mode:</strong> Tự động điều chỉnh khi người dùng bật chế độ tương phản cao</p>
            <p>• <strong>Reduced Motion:</strong> Tắt animations cho người dùng có vấn đề về vestibular</p>
            <p>• <strong>Keyboard Navigation:</strong> Focus ring khi navigate bằng keyboard</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductivityChartDemo;