import React from 'react';
import { WidgetConfig } from '../../types';

interface InfoWidgetProps {
  widget: WidgetConfig;
  Icon: React.ElementType | null;
  displayValue: string;
  isColorized: boolean;
  animateValue: boolean;
}

const InfoWidget = React.memo(({ widget, Icon, displayValue, isColorized, animateValue }: InfoWidgetProps) => {
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
        <h3 className={`text-center text-xs font-medium truncate opacity-90 ${isColorized ? 'text-white' : 'text-content-secondary'}`}>
          {widget.name}
        </h3>
      </div>
    </>
  );
});

InfoWidget.displayName = 'InfoWidget';
export default InfoWidget;
