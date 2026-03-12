import React from 'react';
import { ICONS } from '../constants';

interface IconSelectorProps {
    selectedIcon: string;
    onSelect: (iconKey: string) => void;
}

const IconSelector: React.FC<IconSelectorProps> = ({ selectedIcon, onSelect }) => {
    return (
        <div className="grid grid-cols-6 gap-2 max-h-40 overflow-y-auto p-2 border border-border rounded-lg bg-input-bg">
            {Object.keys(ICONS).map((key) => {
                const IconComponent = ICONS[key];
                const isSelected = selectedIcon === key;
                return (
                    <button
                        key={key}
                        type="button"
                        onClick={() => onSelect(key)}
                        className={`p-2 rounded flex items-center justify-center transition-colors ${
                            isSelected ? 'bg-jeedom-500 text-white' : 'text-content-secondary hover:bg-dark-surface'
                        }`}
                    >
                        <IconComponent size={20} />
                    </button>
                );
            })}
        </div>
    );
};

export default IconSelector;