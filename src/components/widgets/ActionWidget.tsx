import React from 'react';
import { WidgetConfig } from '../../types';

interface ActionWidgetProps {
  widget: WidgetConfig;
  Icon: React.ElementType | null;
  displayValue: string;
  secondaryDisplayValue?: string;
  isColorized: boolean;
  animateValue: boolean;
  loading: boolean;
}

const ActionWidget = React.memo(({
  widget,
  Icon,
  displayValue,
  secondaryDisplayValue,
  isColorized,
  animateValue,
  loading,
}: ActionWidgetProps) => {
  const showValue =
    (widget.type !== 'action' || !!widget.infoId) &&
    (displayValue || secondaryDisplayValue);

  return (
    <div className="flex flex-col h-full w-full relative z-10 p-2 items-center">
      {/* Icon + value */}
      <div className="flex-1 flex flex-col items-center justify-center gap-1 w-full">
        <div className={`
          rounded-xl transition-all duration-300 flex items-center justify-center
          ${isColorized ? 'scale-110' : 'text-jeedom-500'}
          ${loading ? 'animate-pulse' : ''}
        `}>
          {Icon && (
            <Icon
              size={widget.size === 'large' || widget.size === 'medium' ? 40 : 32}
              className={`transition-colors duration-300 ${isColorized ? 'text-white' : 'text-jeedom-500 group-hover:text-jeedom-400'}`}
              strokeWidth={1.5}
            />
          )}
        </div>

        {showValue && (
          <span className={`
            font-bold font-mono text-center truncate w-full px-1 transition-colors duration-300
            ${animateValue ? 'scale-105' : ''}
            ${isColorized ? 'text-white' : 'text-content-primary'}
            ${widget.size === 'small' ? 'text-sm' : 'text-lg'}
          `}>
            {secondaryDisplayValue || displayValue}
          </span>
        )}
      </div>

      {/* Name */}
      <div className="w-full mt-auto pt-1">
        <h3 className={`text-center text-xs font-medium truncate transition-colors duration-300 leading-tight ${isColorized ? 'text-white font-semibold' : 'text-content-secondary group-hover:text-content-primary'}`}>
          {widget.name}
        </h3>
      </div>
    </div>
  );
});

ActionWidget.displayName = 'ActionWidget';
export default ActionWidget;
