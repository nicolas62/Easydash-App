import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableWidgetProps {
    id: string;
    size: 'small' | 'medium' | 'large' | 'wide';
    isEditMode: boolean;
    children: React.ReactNode;
}

const SortableWidget = React.memo(({ id, size, isEditMode, children }: SortableWidgetProps) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: id,
        disabled: !isEditMode,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 100 : undefined,
        opacity: isDragging ? 0.5 : 1,
    };

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
            className={`${sizeClasses[size] || sizeClasses.small} touch-none`}
        >
            {children}
        </div>
    );
});

SortableWidget.displayName = 'SortableWidget';
export default SortableWidget;
