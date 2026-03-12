import React from 'react';
import { Plus, Edit3, Trash2, Star } from 'lucide-react';
import { Dashboard } from '../../types';
import { ICONS } from '../../constants';

interface SidebarProps {
  dashboards: Dashboard[];
  activeDashboardId: string;
  setActiveDashboardId: (id: string) => void;
  isEditMode: boolean;
  onAddDashboard: () => void;
  onEditDashboard: (dashboard: Dashboard) => void;
  onDeleteDashboard: (id: string) => void;
  openScenarios: () => void;
  openHelp: () => void;
  openContact: () => void;
  openReleaseNotes: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  dashboards,
  activeDashboardId,
  setActiveDashboardId,
  isEditMode,
  onAddDashboard,
  onEditDashboard,
  onDeleteDashboard,
}) => {
  return (
    <aside className="hidden md:flex flex-col w-64 bg-dark-surface border-r border-border transition-colors duration-300">
      <div className="p-4 space-y-2 flex-1 overflow-y-auto custom-scrollbar">
        <h3 className="text-xs font-semibold text-content-secondary uppercase tracking-wider mb-4 px-2">Dashboards</h3>
        {dashboards.map(dash => {
          const Icon = ICONS[dash.icon] || ICONS['home'];
          return (
            <div key={dash.id} className="flex items-center gap-1 group relative">
              <button
                onClick={() => setActiveDashboardId(dash.id)}
                className={`flex-1 flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                  activeDashboardId === dash.id
                    ? 'bg-jeedom-600/10 text-jeedom-500 font-medium ring-1 ring-jeedom-500/50'
                    : 'text-content-secondary hover:bg-input-bg hover:text-content-primary'
                }`}
              >
                <Icon size={20} />
                <span className="truncate">{dash.name}</span>
                {dash.id === 'default' && <Star size={14} className="ml-auto text-amber-400" fill="currentColor"/>}
                {dash.id === 'favorites' && <Star size={14} className="ml-auto text-amber-400" fill="currentColor"/>}
              </button>

              {isEditMode && dash.id !== 'default' && dash.id !== 'favorites' && (
                <div className="absolute right-2 flex items-center gap-1 bg-dark-surface shadow-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => onEditDashboard(dash)} className="p-1.5 text-content-secondary hover:text-content-primary hover:bg-input-bg rounded-md" title="Modifier le dashboard"><Edit3 size={14}/></button>
                  <button onClick={() => onDeleteDashboard(dash.id)} className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-md" title="Supprimer le dashboard"><Trash2 size={14}/></button>
                </div>
              )}
            </div>
          );
        })}

        {isEditMode && (
          <button
            onClick={onAddDashboard}
            className="w-full flex items-center justify-center gap-2 p-3 mt-2 rounded-xl border border-dashed border-border text-content-secondary hover:border-jeedom-500/50 hover:text-jeedom-500 hover:bg-jeedom-500/5 transition-all"
          >
            <Plus size={18} />
            <span>Nouveau</span>
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
