// src/components/CleanTimePicker.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Button, Popover, PopoverTrigger, PopoverContent } from '@heroui/react';
import { Icon } from '@iconify/react';

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export const CleanTimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  label = "Time",
  disabled = false,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hour, setHour] = useState(9);
  const [minute, setMinute] = useState(0);
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM');

  // Parse initial value
  useEffect(() => {
    if (value) {
      const [timeStr] = value.split(' ');
      const [h, m] = timeStr.split(':').map(Number);
      
      if (h === 0) {
        setHour(12);
        setPeriod('AM');
      } else if (h === 12) {
        setHour(12);
        setPeriod('PM');
      } else if (h > 12) {
        setHour(h - 12);
        setPeriod('PM');
      } else {
        setHour(h);
        setPeriod('AM');
      }
      
      setMinute(m || 0);
    }
  }, [value]);

  const formatTime = (h: number, m: number, p: 'AM' | 'PM') => {
    let hour24 = h;
    if (p === 'AM' && h === 12) hour24 = 0;
    if (p === 'PM' && h !== 12) hour24 = h + 12;
    
    return `${hour24.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const displayTime = value ? 
    (() => {
      const [timeStr] = value.split(' ');
      const [h, m] = timeStr.split(':').map(Number);
      const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
      const displayPeriod = h >= 12 ? 'PM' : 'AM';
      return `${displayHour}:${m.toString().padStart(2, '0')} ${displayPeriod}`;
    })() : 
    null;

  const handleApply = () => {
    const formattedTime = formatTime(hour, minute, period);
    onChange(formattedTime);
    setIsOpen(false);
  };

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

  return (
    <div className={className}>
      <Popover 
        isOpen={isOpen} 
        onOpenChange={setIsOpen}
        placement="bottom-start"
      >
        <PopoverTrigger>
          <Button
            variant="bordered"
            className="w-full justify-between h-12 text-left px-3"
            isDisabled={disabled}
            startContent={<Icon icon="lucide:clock" className="text-foreground-400 w-4 h-4" />}
            endContent={<Icon icon="lucide:chevron-down" className="text-foreground-400 w-4 h-4" />}
          >
            <div className="flex flex-col items-start flex-1 mx-2">
              <span className="text-xs text-foreground-500 font-normal">{label}</span>
              {displayTime && (
                <span className="text-sm font-medium">
                  {displayTime}
                </span>
              )}
            </div>
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-56 p-5">
          <div className="space-y-5">
            {/* Time Display */}
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">
                {hour.toString().padStart(2, '0')}:{minute.toString().padStart(2, '0')}
              </div>
              <div className="text-sm text-foreground-500 mt-1">{period}</div>
            </div>

            {/* Time Selectors */}
            <div className="flex items-center justify-center gap-3">
              {/* Hour Selector */}
              <div className="flex flex-col items-center">
                <div className="text-xs text-foreground-500 mb-2 font-medium">Hour</div>
                <div className="h-28 w-10 overflow-y-auto scrollbar-hide border border-divider rounded-lg bg-content1">
                  {hours.map((h) => (
                    <button
                      key={h}
                      className={`w-full h-7 flex items-center justify-center text-sm font-medium transition-all duration-200
                        ${hour === h 
                          ? 'bg-primary text-primary-foreground shadow-sm' 
                          : 'hover:bg-content2 text-foreground'
                        }
                      `}
                      onClick={() => setHour(h)}
                    >
                      {h.toString().padStart(2, '0')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Separator */}
              <div className="text-xl font-bold text-foreground-300 mt-3">:</div>

              {/* Minute Selector */}
              <div className="flex flex-col items-center">
                <div className="text-xs text-foreground-500 mb-2 font-medium">Min</div>
                <div className="h-28 w-10 overflow-y-auto scrollbar-hide border border-divider rounded-lg bg-content1">
                  {minutes.map((m) => (
                    <button
                      key={m}
                      className={`w-full h-7 flex items-center justify-center text-sm font-medium transition-all duration-200
                        ${minute === m 
                          ? 'bg-primary text-primary-foreground shadow-sm' 
                          : 'hover:bg-content2 text-foreground'
                        }
                      `}
                      onClick={() => setMinute(m)}
                    >
                      {m.toString().padStart(2, '0')}
                    </button>
                  ))}
                </div>
              </div>

              {/* AM/PM Selector */}
              <div className="flex flex-col items-center">
                <div className="text-xs text-foreground-500 mb-2 font-medium">Period</div>
                <div className="flex flex-col gap-1">
                  {['AM', 'PM'].map((p) => (
                    <button
                      key={p}
                      className={`w-10 h-10 rounded-lg text-xs font-semibold transition-all duration-200
                        ${period === p 
                          ? 'bg-primary text-primary-foreground shadow-md' 
                          : 'bg-content2 hover:bg-content3 text-foreground'
                        }
                      `}
                      onClick={() => setPeriod(p as 'AM' | 'PM')}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="flat"
                onPress={() => setIsOpen(false)}
                className="flex-1 h-8 text-sm"
                size="sm"
              >
                Cancel
              </Button>
              <Button
                color="primary"
                onPress={handleApply}
                className="flex-1 h-8 text-sm"
                size="sm"
              >
                Set Time
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};