import React from 'react';
import { Plus, Edit3, XCircle, Star } from 'lucide-react';
import { Dashboard } from '../../types';
import { ICONS } from '../../constants';

interface MobileNavProps {
  dashboards: Dashboard[];
  activeDashboardId: string;
  setActiveDashboardId: (id: string) => void;
  isEditMode: boolean;
  onAddDashboard: () => void;
  onEditDashboard: (dashboard: Dashboard) => void;
  onDeleteDashboard: (id: string) => void;
}

const MobileNav: React.FC<MobileNavProps> = ({
  dashboards,
  activeDashboardId,
  setActiveDashboardId,
  isEditMode,
  onAddDashboard,
  onEditDashboard,
  onDeleteDashboard,
}) => {
  return (
    <div className="md:hidden flex-none h-14 bg-dark-bg/95 backdrop-blur border-b border-border flex items-center px-4 gap-2 overflow-x-auto z-30 no-scrollbar transition-colors duration-300">
      {dashboards.map(dash => {
        const Icon = ICONS[dash.icon] || ICONS['home'];
        const isActive = activeDashboardId === dash.id;
        return (
          <button
            key={dash.id}
            onClick={() => setActiveDashboardId(dash.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all text-sm font-medium border flex-shrink-0 ${
              isActive
                ? 'bg-jeedom-600 text-white border-jeedom-500 shadow-lg shadow-jeedom-900/50'
                : 'bg-dark-card text-content-secondary border-border hover:border-content-secondary'
            }`}
          >
            <Icon size={16} />
            {dash.name}
            {dash.id === 'favorites' && <Star size={10} className="text-amber-300" fill="currentColor"/>}

            {isEditMode && isActive && dash.id !== 'default' && dash.id !== 'favorites' && (
              <div
                onClick={(e) => { e.stopPropagation(); onEditDashboard(dash); }}
                className="ml-2 -mr-1 p-0.5 rounded-full hover:bg-content-primary/10 transition-colors"
              >
                <Edit3 size={12} />
              </div>
            )}
            {isEditMode && isActive && dash.id !== 'default' && (
              <div
                onClick={(e) => { e.stopPropagation(); onDeleteDashboard(dash.id); }}
                className="ml-1 p-0.5 rounded-full hover:bg-red-500/50 text-red-200"
              >
                <XCircle size={14} />
              </div>
            )}
          </button>
        );
      })}
      {isEditMode && (
        <button
          onClick={onAddDashboard}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-input-bg text-content-secondary border border-border hover:text-jeedom-500 hover:border-jeedom-500 flex-shrink-0"
        >
          <Plus size={16} />
        </button>
      )}
    </div>
  );
};

export default MobileNav;
