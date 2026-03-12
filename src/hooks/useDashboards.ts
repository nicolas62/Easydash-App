import { useState, useEffect } from 'react';
import { Dashboard, WidgetConfig } from '../types';

export function useDashboards() {
  const [dashboards, setDashboards] = useState<Dashboard[]>(() => {
    const saved = localStorage.getItem('jeedom_dashboards');
    if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.find((d: Dashboard) => d.id === 'favorites')) {
            const defaultIndex = parsed.findIndex((d: Dashboard) => d.id === 'default');
            if (defaultIndex !== -1) {
                const newDashboards = [...parsed];
                newDashboards.splice(defaultIndex + 1, 0, { id: 'favorites', name: 'Favoris', icon: 'star' });
                return newDashboards;
            }
            return [{ id: 'favorites', name: 'Favoris', icon: 'star' }, ...parsed];
        }
        return parsed;
    }
    return [
        { id: 'default', name: 'Accueil', icon: 'home' },
        { id: 'favorites', name: 'Favoris', icon: 'star' }
    ];
  });

  const [widgets, setWidgets] = useState<WidgetConfig[]>(() => {
    const saved = localStorage.getItem('jeedom_widgets');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [activeDashboardId, setActiveDashboardId] = useState<string>(() => {
     const saved = localStorage.getItem('jeedom_dashboards');
     const parsed = saved ? JSON.parse(saved) : [{ id: 'default' }];
     return parsed.length > 0 ? parsed[0].id : 'default';
  });
  
  const [editingDashboard, setEditingDashboard] = useState<Dashboard | undefined>(undefined);

  useEffect(() => { localStorage.setItem('jeedom_dashboards', JSON.stringify(dashboards)); }, [dashboards]);
  useEffect(() => { localStorage.setItem('jeedom_widgets', JSON.stringify(widgets)); }, [widgets]);

  const handleSaveWidget = (widget: WidgetConfig, editingWidget: WidgetConfig | undefined) => {
    setWidgets(editingWidget ? widgets.map(w => w.id === widget.id ? widget : w) : [...widgets, widget]);
  };

  const handleSaveDashboard = (dashboard: Dashboard) => {
    if (editingDashboard) setDashboards(dashboards.map(d => d.id === dashboard.id ? dashboard : d));
    else {
        setDashboards([...dashboards, dashboard]);
        setActiveDashboardId(dashboard.id);
    }
    setEditingDashboard(undefined);
  };

  const handleDeleteDashboard = (id: string) => {
      if (dashboards.length <= 1) return alert("Vous devez avoir au moins un dashboard.");
      if (window.confirm("Supprimer ce dashboard et tous ses widgets ?")) {
          setDashboards(dashboards.filter(d => d.id !== id));
          setWidgets(widgets.filter(w => w.dashboardId !== id));
          if (activeDashboardId === id) setActiveDashboardId(dashboards[0].id);
      }
  };
  
    const handleImportConfig = (data: { dashboards?: Dashboard[], widgets?: WidgetConfig[] }) => {
    if (data.dashboards) setDashboards(data.dashboards);
    if (data.widgets) setWidgets(data.widgets);
    
    if (data.dashboards && data.dashboards.length > 0) {
       const exists = data.dashboards.find(d => d.id === activeDashboardId);
       if (!exists) setActiveDashboardId(data.dashboards[0].id);
    }
  };

  return { 
    dashboards, 
    setDashboards, 
    widgets, 
    setWidgets, 
    activeDashboardId, 
    setActiveDashboardId, 
    editingDashboard, 
    setEditingDashboard,
    handleSaveWidget,
    handleSaveDashboard,
    handleDeleteDashboard,
    handleImportConfig
  };
}
