import React from 'react';

interface KPICardProps {
  label: string;
  value: number;
}

const KPICard: React.FC<KPICardProps> = ({ label, value }) => {
  return (
    <div 
      className="bg-white rounded-xl p-4 h-20 flex flex-col justify-center hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
    >
      <div className="text-sm text-[#6B7280] mb-1">{label}</div>
      <div className="text-2xl font-semibold text-[#111827]">{value}</div>
    </div>
  );
};

export default KPICard;