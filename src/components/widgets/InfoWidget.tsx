import React from 'react';
import { Clock } from 'lucide-react';
import { WidgetConfig } from '../../types';
import { useElapsedTime } from '../../hooks/useElapsedTime';

interface InfoWidgetProps {
  widget: WidgetConfig;
  Icon: React.ElementType | null;
  displayValue: string;
  isColorized: boolean;
  animateValue: boolean;
  updateTime?: number;
  showElapsedTime?: boolean;
}

const InfoWidget = React.memo(({ widget, Icon, displayValue, isColorized, animateValue, updateTime, showElapsedTime }: InfoWidgetProps) => {
  const elapsed = useElapsedTime(showElapsedTime ? updateTime : undefined);

  return (
    <>
      {/* Background icon (watermark) */}
      <div className={`
        absolute inset-0 flex items-center justify-center overflow-hidden z-0 pointer-events-none
        ${isColorized ? 'text-white' : 'text-jeedom-500'}
      `}>
        {Icon && (
          <Icon
            size={widget.size === 'small' ? 80 : widget.size === 'medium' ? 120 : 160}
            strokeWidth={1}
            className="opacity-20 transform -rotate-12 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-0"
          />
        )}
      </div>

      {/* Content overlay */}
      <div className="relative z-10 flex flex-col h-full w-full p-2">
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <span className={`
            font-bold font-mono tracking-tight leading-none drop-shadow-md transition-transform duration-300
            ${animateValue ? 'scale-110' : ''}
            ${widget.size === 'small' ? 'text-2xl' : 'text-4xl'}
            ${isColorized ? 'text-white' : 'text-content-primary'}
          `}>
            {displayValue}
          </span>
        </div>
        <div className="text-center">
          <h3 className={`text-xs font-medium truncate opacity-90 ${isColorized ? 'text-white' : 'text-content-secondary'}`}>
            {widget.name}
          </h3>
          {elapsed && (
            <span className={`inline-flex items-center gap-0.5 text-[9px] opacity-60 ${isColorized ? 'text-white' : 'text-content-secondary'}`}>
              <Clock size={7} />
              {elapsed}
            </span>
          )}
        </div>
      </div>
    </>
  );
});

InfoWidget.displayName = 'InfoWidget';
export default InfoWidget;
