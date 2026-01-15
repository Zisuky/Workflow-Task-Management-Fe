import { useState, useEffect, useRef } from 'react';

interface DateInputProps {
    name: string;
    value: string; // YYYY-MM-DD format
    min?: string;  // YYYY-MM-DD format
    onChange: (value: string) => void;
    className?: string;
}

const formatDateForDisplay = (dateStr: string): string => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    if (!year || !month || !day) return '';
    return `${day}/${month}/${year}`;
};

const parseDateFromDisplay = (displayStr: string): string => {
    if (!displayStr) return '';
    const parts = displayStr.split('/');
    if (parts.length !== 3) return '';
    const [day, month, year] = parts;
    if (!day || !month || !year) return '';
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

const isValidDate = (dateStr: string): boolean => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    return date instanceof Date && !isNaN(date.getTime());
};

const DateInput: React.FC<DateInputProps> = ({
    name,
    value,
    min,
    onChange,
    className = '',
}) => {
    const [displayValue, setDisplayValue] = useState(formatDateForDisplay(value));
    const inputRef = useRef<HTMLInputElement>(null);
    const hiddenDateRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setDisplayValue(formatDateForDisplay(value));
    }, [value]);

    const handleDisplayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        // Allow typing with auto-formatting
        let cleaned = val.replace(/[^\d/]/g, '');

        // Auto-add slashes
        if (cleaned.length === 2 && !cleaned.includes('/')) {
            cleaned += '/';
        } else if (cleaned.length === 5 && cleaned.split('/').length === 2) {
            cleaned += '/';
        }

        // Limit length
        if (cleaned.length > 10) {
            cleaned = cleaned.slice(0, 10);
        }

        setDisplayValue(cleaned);

        // Check if complete date
        if (cleaned.length === 10) {
            const isoDate = parseDateFromDisplay(cleaned);
            if (isValidDate(isoDate)) {
                // Check min constraint
                if (min && isoDate < min) {
                    onChange(min);
                    setDisplayValue(formatDateForDisplay(min));
                } else {
                    onChange(isoDate);
                }
            }
        }
    };

    const handleDatePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isoDate = e.target.value;
        if (isoDate) {
            onChange(isoDate);
            setDisplayValue(formatDateForDisplay(isoDate));
        }
    };

    const handleCalendarClick = () => {
        if (hiddenDateRef.current) {
            hiddenDateRef.current.showPicker();
        }
    };

    const handleBlur = () => {
        // On blur, reset to valid value if current is invalid
        if (displayValue.length > 0 && displayValue.length < 10) {
            setDisplayValue(formatDateForDisplay(value));
        }
    };

    return (
        <div className="relative">
            <input
                ref={inputRef}
                type="text"
                name={name}
                value={displayValue}
                onChange={handleDisplayChange}
                onBlur={handleBlur}
                placeholder="DD/MM/YYYY"
                className={`${className} pr-10`}
            />
            <button
                type="button"
                onClick={handleCalendarClick}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer z-10"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            </button>
            <input
                ref={hiddenDateRef}
                type="date"
                value={value}
                min={min}
                onChange={handleDatePickerChange}
                className="absolute right-0 top-0 opacity-0 w-10 h-full cursor-pointer"
                style={{ colorScheme: 'light' }}
            />
            {/* Hidden input to submit ISO format */}
            <input type="hidden" name={`${name}_iso`} value={value} />
        </div>
    );
};

export default DateInput;
