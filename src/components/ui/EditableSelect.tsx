import React, { useState, useRef, useEffect } from 'react';

interface EditableSelectProps {
    label: string;
    value: string;
    options: string[];
    onSelect: (value: string) => void;
    placeholder?: string;
}

export const EditableSelect: React.FC<EditableSelectProps> = ({
    label,
    value,
    options,
    onSelect,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    const isActive = !!value;

    // Sync input with value only when NOT open (to allow typing)
    // Or when value changes externally
    useEffect(() => {
        if (!isOpen) {
            setInputValue(value || '');
        }
    }, [value, isOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                // Revert input to current value on close
                setInputValue(value || '');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [value]);

    const handleFocus = () => {
        setIsOpen(true);
        // If value exists, do we clear it to type? Or keep it selected?
        // UX: Usually keep it selected text so user can delete or overwrite.
        // We act like standard input.
    };

    const handleSelectOption = (opt: string) => {
        onSelect(opt);
        setIsOpen(false);
        setInputValue(opt);
    };

    // Filter logic
    const filteredOptions = options.filter(opt =>
        opt.toLowerCase().includes(inputValue.toLowerCase())
    );

    return (
        <div className="relative w-full" ref={containerRef}>
            {/* Trigger / Input */}
            <div
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors border cursor-text ${isActive
                    ? 'bg-[#46c690] text-white border-transparent'
                    : 'bg-gray-100 text-gray-600 border-transparent hover:bg-gray-200'
                    } focus-within:ring-2 focus-within:ring-[#46c690]/50 focus-within:bg-white focus-within:text-gray-900 focus-within:border-gray-200`}
            >
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        if (!isOpen) setIsOpen(true);
                    }}
                    onFocus={handleFocus}
                    placeholder={label}
                    className={`w-full bg-transparent border-none outline-none placeholder-current truncate ${isActive && !isOpen ? 'text-white placeholder-white' : 'text-gray-900 placeholder-gray-500'}`}
                />

                {/* Chevron or X */}
                <div className="flex items-center ml-2">
                    {value && !isOpen ? (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleSelectOption('');
                            }}
                            className="hover:text-red-500"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    ) : (
                        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    )}
                </div>
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto w-full min-w-[200px]">
                    <div className="py-1">
                        <button
                            onClick={() => handleSelectOption('')}
                            className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${value === '' ? 'bg-orange-50 text-[#F79E61]' : 'text-gray-600'}`}
                        >
                            Tất cả
                        </button>

                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((opt) => (
                                <button
                                    key={opt}
                                    onClick={() => handleSelectOption(opt)}
                                    className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${value === opt ? 'bg-orange-50 text-[#F79E61]' : 'text-gray-600'}`}
                                >
                                    {opt}
                                </button>
                            ))
                        ) : (
                            <div className="px-3 py-2 text-xs text-gray-400 text-center">
                                Không tìm thấy kết quả
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
