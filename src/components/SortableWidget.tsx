import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import WidgetCard from './WidgetCard';
import { WidgetConfig, JeedomCommand, JeedomScenario } from '../types';

interface SortableWidgetProps {
    widget: WidgetConfig;
    commands: JeedomCommand[];
    scenarios: JeedomScenario[];
    settings: any;
    editMode: boolean;
    isConnected?: boolean;
    onEdit: (widget: WidgetConfig) => void;
    onDelete: (id: string) => void;
    onScenarioClick: (scenarioId: string) => void;
    onActionSuccess?: () => void;
}

const SortableWidget: React.FC<SortableWidgetProps> = (props) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ 
        id: props.widget.id,
        disabled: !props.editMode, // Disable drag if not in edit mode
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 100 : undefined,
        opacity: isDragging ? 0.5 : 1,
    };

    // Size classes for the wrapper (grid item)
    const sizeClasses = {
        small: 'col-span-1 row-span-1',
        medium: 'col-span-2 row-span-1', 
        large: 'col-span-2 row-span-2', 
        wide: 'col-span-3 row-span-1',
    };

    return (
        <div 
            ref={setNodeRef} 
            style={style} 
            {...attributes} 
            {...listeners}
            className={`${sizeClasses[props.widget.size]} touch-none`}
        >
            <WidgetCard 
                {...props} 
                className="h-full w-full" 
                // Pass style to handle transform if needed, but wrapper handles it
            />
        </div>
    );
};

export default SortableWidget;
