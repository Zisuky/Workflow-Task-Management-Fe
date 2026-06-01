import React from 'react';
import { STEPS } from './types';

const StepIndicator: React.FC<{ current: number }> = ({ current }) => (
  <div className="flex items-center justify-center mb-8">
    {STEPS.map((label, i) => {
      const done = i < current;
      const active = i === current;
      return (
        <React.Fragment key={i}>
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              done ? 'bg-[#F79E61] text-white'
              : active ? 'bg-[#1e3a5f] text-white ring-4 ring-[#1e3a5f]/20'
              : 'bg-gray-100 text-gray-400'
            }`}>
              {done
                ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                : i + 1}
            </div>
            <span className={`mt-1.5 text-xs font-medium ${active ? 'text-[#1e3a5f]' : done ? 'text-[#F79E61]' : 'text-gray-400'}`}>
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`h-0.5 w-16 mx-1 mb-5 transition-all ${done ? 'bg-[#F79E61]' : 'bg-gray-200'}`} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

export default StepIndicator;
