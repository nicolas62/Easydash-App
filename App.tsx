import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Settings, Plus, LayoutDashboard, Edit3, XCircle, RefreshCw, Trash2, RotateCw, RotateCcw, HelpCircle, BookOpen, Menu, Mail, Workflow, Star, Layers } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { Dashboard, WidgetConfig, AppSettings, JeedomEqLogic, JeedomCommand, WidgetCategory, JeedomScenario } from './types';
import { DEFAULT_SETTINGS, ICONS, CATEGORIES, APP_VERSION } from './constants';
import { fetchJeedomFullData, fetchSpecificCommandValues, fetchJeedomScenarios } from './services/jeedomService';
import { encryptData, decryptData } from './services/cryptoService';
import WidgetCard from './components/WidgetCard';
import SortableWidget from './components/SortableWidget';
import SettingsModal from './components/SettingsModal';
import WidgetEditorModal from './components/WidgetEditorModal';
import DashboardModal from './components/DashboardModal';
import ConfirmationModal from './components/ConfirmationModal';
import HelpModal from './components/HelpModal';
import ContactModal from './components/ContactModal';
import ScenarioModal from './components/ScenarioModal';
import ScenarioDetailsModal from './components/ScenarioDetailsModal';
import Toast, { ToastType } from './components/Toast';
import ReleaseNotesModal from './components/ReleaseNotesModal';
import ReleaseNotesList from './components/ReleaseNotesList';
import LandingPage from './components/LandingPage';
import SEO from './components/SEO';
import PrivacyPolicyPage from './components/PrivacyPolicyPage';


import { useLocation } from 'react-router-dom';
import CookieBanner from './components/CookieBanner';
import RouteTracker from './components/RouteTracker';

import { jeedomWs } from './services/jeedomWs';
import { useConnectionStatus } from './hooks/useConnectionStatus';

const App: React.FC = () => {
  const location = useLocation();

  // Simple routing for Privacy Policy
  if (location.pathname === '/privacy') {
    return (
      <>
        <RouteTracker />
        <PrivacyPolicyPage />
        <CookieBanner />
      </>
    );
  }

  // App State
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);
  const [isReleaseNotesOpen, setIsReleaseNotesOpen] = useState(false);

  const [dashboards, setDashboards] = useState<Dashboard[]>(() => {
    const saved = localStorage.getItem('jeedom_dashboards');
    if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure 'favorites' dashboard exists if we are migrating
        if (!parsed.find((d: Dashboard) => d.id === 'favorites')) {
            // Insert after default if it exists, otherwise at beginning
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

  const [eqLogics, setEqLogics] = useState<JeedomEqLogic[]>(() => {
    const saved = localStorage.getItem('jeedom_eqLogics');
    return saved ? JSON.parse(saved) : [];
  });
  const [commands, setCommands] = useState<JeedomCommand[]>([]);
  const [scenarios, setScenarios] = useState<JeedomScenario[]>([]);
  const [activeDashboardId, setActiveDashboardId] = useState<string>(() => {
     const saved = localStorage.getItem('jeedom_dashboards');
     const parsed = saved ? JSON.parse(saved) : [{ id: 'default' }];
     return parsed.length > 0 ? parsed[0].id : 'default';
  });
  
  // UI State
  const [activeFilter, setActiveFilter] = useState<WidgetCategory>('all');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isWidgetEditorOpen, setIsWidgetEditorOpen] = useState(false);
  const [isDashboardModalOpen, setIsDashboardModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isScenarioModalOpen, setIsScenarioModalOpen] = useState(false);
  const [isScenarioDetailsOpen, setIsScenarioDetailsOpen] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<JeedomScenario | null>(null);
  const [isResetConfirmationOpen, setIsResetConfirmationOpen] = useState(false);
  
  // Menu State (The "J" button)
  const [isMainMenuOpen, setIsMainMenuOpen] = useState(false);
  const [isMainMenuPopping, setIsMainMenuPopping] = useState(false);
  const mainMenuRef = useRef<HTMLDivElement>(null);

  // Confirmation Modal State
  const [deleteWidgetId, setDeleteWidgetId] = useState<string | null>(null);

  const [editingWidget, setEditingWidget] = useState<WidgetConfig | undefined>(undefined);
  const [editingDashboard, setEditingDashboard] = useState<Dashboard | undefined>(undefined);
  
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: ToastType} | null>(null);

  const { isConnected } = useConnectionStatus(settings.useDemoMode, settings.useWebSocket);

  // Pull to Refresh State
  const [pullChange, setPullChange] = useState(0);
  const mainRef = useRef<HTMLElement>(null);
  const touchStartRef = useRef<number>(0);
  const touchStartXRef = useRef<number>(0);
  const touchStartYRef = useRef<number>(0);

  const widgetsRef = useRef(widgets);
  const activeDashboardIdRef = useRef(activeDashboardId);

  useEffect(() => { widgetsRef.current = widgets; }, [widgets]);
  useEffect(() => { activeDashboardIdRef.current = activeDashboardId; }, [activeDashboardId]);

  // Click Outside Listener for Main Menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mainMenuRef.current && !mainMenuRef.current.contains(event.target as Node)) {
        setIsMainMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load Settings Async (Decrypt API Key)
  useEffect(() => {
      const loadSettings = async () => {
          const saved = localStorage.getItem('jeedom_settings');
          if (saved) {
              try {
                  const parsed = JSON.parse(saved);
                  if (parsed.apiKey) {
                      parsed.apiKey = await decryptData(parsed.apiKey);
                  }
                  if (!parsed.theme) parsed.theme = 'dark';
                  setSettings(parsed);
              } catch (e) {
                  console.error("Failed to load settings", e);
                  setSettings(DEFAULT_SETTINGS);
              }
          }
          setIsSettingsLoaded(true);
      };
      loadSettings();
  }, []);

  // Persistence (Encrypt API Key before save)
  useEffect(() => {
      if (!isSettingsLoaded) return;

      const saveSettings = async () => {
          const settingsToSave = { ...settings };
          if (settingsToSave.apiKey) {
              settingsToSave.apiKey = await encryptData(settingsToSave.apiKey);
          }
          localStorage.setItem('jeedom_settings', JSON.stringify(settingsToSave));
      };
      saveSettings();
  }, [settings, isSettingsLoaded]);

  useEffect(() => { localStorage.setItem('jeedom_dashboards', JSON.stringify(dashboards)); }, [dashboards]);
  useEffect(() => { localStorage.setItem('jeedom_widgets', JSON.stringify(widgets)); }, [widgets]);
  useEffect(() => { localStorage.setItem('jeedom_eqLogics', JSON.stringify(eqLogics)); }, [eqLogics]);

  // Derive commands from eqLogics whenever eqLogics changes
  useEffect(() => {
      const allCmds: JeedomCommand[] = [];
      eqLogics.forEach(eq => {
          if (eq.cmds) allCmds.push(...eq.cmds);
      });
      setCommands(allCmds);
      checkBatteryLevels(eqLogics);
  }, [eqLogics]);

  // Theme Application
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
    const metaThemeColor = document.querySelector("meta[name=theme-color]");
    if (metaThemeColor) {
        metaThemeColor.setAttribute("content", settings.theme === 'dark' ? '#121212' : '#f3f4f6');
    }
  }, [settings.theme]);

  const checkBatteryLevels = (eqs: JeedomEqLogic[]) => {
      const lowBatteryDevices: string[] = [];
      eqs.forEach(eq => {
          if (eq.cmds) {
              eq.cmds.forEach(cmd => {
                  const isBatteryCmd = cmd.generic_type === 'BATTERY' || 
                                     (cmd.name.toLowerCase().includes('batterie') && cmd.unite === '%');
                  if (isBatteryCmd && cmd.value !== undefined && cmd.value !== '') {
                      const level = parseFloat(String(cmd.value));
                      if (!isNaN(level) && level < 20) {
                          lowBatteryDevices.push(`${eq.name} (${level}%)`);
                      }
                  }
              });
          }
      });
      if (lowBatteryDevices.length > 0) {
          const msg = lowBatteryDevices.length > 3 
            ? `${lowBatteryDevices.length} équipements ont une batterie faible (< 20%).` 
            : `Batterie faible: ${lowBatteryDevices.join(', ')}`;
          setNotification({ message: msg, type: 'warning' });
      }
  };

  const isFetchingRef = useRef(false);

  // Dnd Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
        activationConstraint: {
            distance: 8, // Require 8px movement to start drag (allows clicking)
        },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setWidgets((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);
        
        // Simple array move on the global list
        // This works because we are rendering a filtered view but SortableContext needs the IDs of the rendered items.
        // Wait, if we reorder the global list based on indices of filtered items, it might be wrong.
        // We need to find the indices in the GLOBAL list.
        
        // But wait, if I drag item A (index 0 in view, index 0 in global) to item B (index 1 in view, index 5 in global).
        // arrayMove(items, 0, 5) would move A to position 5.
        // This seems correct IF we use the global indices.
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Helper to update command values in state
  const updateCommandValues = useCallback((updates: Array<{id: string, value: string | number}>) => {
      setCommands(prevCmds => {
          const newCmds = [...prevCmds];
          let hasChanges = false;
          updates.forEach(update => {
              const index = newCmds.findIndex(c => c.id == update.id); 
              if (index !== -1 && newCmds[index].value != update.value) { 
                   newCmds[index] = { ...newCmds[index], value: update.value };
                   hasChanges = true;
              }
          });
          return hasChanges ? newCmds : prevCmds;
      });
  }, []);

  // Fetch values for a specific list of widgets
  const refreshWidgetValues = useCallback(async (widgetsToRefresh: WidgetConfig[]) => {
      if (widgetsToRefresh.length === 0) return;
      
      // Guard: Prevent overlapping requests
      if (isFetchingRef.current) {
          console.log("Skipping refresh: Request already in progress");
          return;
      }

      isFetchingRef.current = true;

      const idsToFetch = new Set<string>();
      widgetsToRefresh.forEach(w => {
          if (w.type === 'info') {
              if (w.infoId) idsToFetch.add(w.infoId);
              if (w.commandId) idsToFetch.add(w.commandId); // Legacy support
          }
          else if (w.type === 'toggle' && w.infoId) idsToFetch.add(w.infoId);
          else if (w.type === 'action' && w.infoId) idsToFetch.add(w.infoId);
          if (w.displayInfoId) idsToFetch.add(w.displayInfoId);
      });

      const uniqueIds = Array.from(idsToFetch);
      if (uniqueIds.length > 0) {
          try {
              const updates = await fetchSpecificCommandValues(settings, uniqueIds);
              updateCommandValues(updates);
          } catch (e) {
              console.error("Error refreshing widget values", e);
          } finally {
              isFetchingRef.current = false;
          }
      } else {
          isFetchingRef.current = false;
      }
  }, [settings, updateCommandValues]);

  // Load available commands (EqLogics) - Only when needed (Editor) or if missing
  const loadAvailableData = useCallback(async () => {
      if (!settings.jeedomUrl || !settings.apiKey) return;
      setIsLoading(true);
      try {
          const eqs = await fetchJeedomFullData(settings);
          if (eqs.length > 0) {
              setEqLogics(eqs);
          }
      } catch (e) {
          console.error("Error loading available data", e);
      } finally {
          setIsLoading(false);
      }
  }, [settings]);

  // Initial Load (Startup)
  const initialLoad = useCallback(async () => {
    if (!isSettingsLoaded) return;
    
    // Skip fetch if not configured and not in demo mode
    if (!settings.useDemoMode && (!settings.jeedomUrl || !settings.apiKey)) return;

    setIsLoading(true);
    setNotification(null);
    try {
      // 1. Load Scenarios (Always at startup)
      const scenes = await fetchJeedomScenarios(settings);
      setScenarios(scenes);

      // 2. Preload Values for ALL created widgets
      await refreshWidgetValues(widgets);

      // 3. If we have no eqLogics (first run or cleared cache), load them to ensure metadata exists
      if (widgets.length > 0 && eqLogics.length === 0) {
          await loadAvailableData();
      }

      if (!settings.useDemoMode && scenes.length === 0 && widgets.length === 0 && eqLogics.length === 0) {
           setNotification({ 
              message: 'Bienvenue ! Commencez par créer un widget ou vérifiez votre connexion.', 
              type: 'success' 
          });
      }

    } catch (err: any) {
      setNotification({ message: err.message || 'Erreur de connexion', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [settings, isSettingsLoaded, widgets, eqLogics.length, refreshWidgetValues, loadAvailableData]);

  useEffect(() => {
    if (isSettingsLoaded) {
        initialLoad();
    }
  }, [initialLoad, isSettingsLoaded]);

  // Initialize WebSocket when settings are loaded
  useEffect(() => {
      if (isSettingsLoaded && settings.jeedomUrl && settings.apiKey && !settings.useDemoMode) {
          if (settings.useWebSocket !== false) {
              jeedomWs.connect(settings);
          } else {
              jeedomWs.disconnect();
          }
      } else if (isSettingsLoaded && settings.useDemoMode) {
          jeedomWs.disconnect();
      }
  }, [settings, isSettingsLoaded]);

  // Polling - Only displayed widgets
  // If WebSocket is disabled, use the configured interval (min 2s).
  // If WebSocket is enabled, use a strict 5 minutes fallback interval.
  useEffect(() => {
    if (!isSettingsLoaded) return;
    
    const isWsEnabled = settings.useWebSocket !== false && !settings.useDemoMode;
    const minInterval = isWsEnabled ? 300000 : 2000; // 5 mins if WS, 2s if no WS
    const intervalTime = Math.max(minInterval, settings.refreshInterval || 5000);
    
    console.log(`Starting polling with interval: ${intervalTime}ms (WS Enabled: ${isWsEnabled})`);

    const intervalId = setInterval(async () => {
        const currentActiveId = activeDashboardIdRef.current;
        
        const currentWidgets = widgetsRef.current.filter(w => {
            if (currentActiveId === 'default') return w.isFavorite;
            return w.dashboardId === currentActiveId;
        });

        if (currentWidgets.length > 0) {
            await refreshWidgetValues(currentWidgets);
        }
    }, intervalTime);

    return () => {
        console.log("Stopping polling");
        clearInterval(intervalId);
    };
  }, [settings.refreshInterval, settings.useWebSocket, settings.useDemoMode, isSettingsLoaded, refreshWidgetValues]); 
 

  // Refresh widgets immediately when switching dashboard
  useEffect(() => {
      if (!isSettingsLoaded) return;
      
      const currentWidgets = widgets.filter(w => {
          if (activeDashboardId === 'default') return w.isFavorite;
          return w.dashboardId === activeDashboardId;
      });

      if (currentWidgets.length > 0) {
          refreshWidgetValues(currentWidgets);
      }
  }, [activeDashboardId, isSettingsLoaded, refreshWidgetValues, widgets]);
 

  // Touch Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    // Pull-to-Refresh
    if (mainRef.current && mainRef.current.scrollTop <= 0) touchStartRef.current = e.targetTouches[0].clientY;
    else touchStartRef.current = 0;

    // Swipe
    touchStartXRef.current = e.targetTouches[0].clientX;
    touchStartYRef.current = e.targetTouches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Pull-to-Refresh Logic
    if (touchStartRef.current > 0) {
        const diff = e.targetTouches[0].clientY - touchStartRef.current;
        if (diff > 0) setPullChange(Math.min(diff * 0.4, 150));
        else setPullChange(0);
    }
  };

  const handleTouchEnd = async (e: React.TouchEvent) => {
    // Pull-to-Refresh Action
    if (touchStartRef.current > 0 && pullChange > 70) {
        setPullChange(60);
        await initialLoad();
        setPullChange(0);
        touchStartRef.current = 0;
        return;
    }
    setPullChange(0);
    touchStartRef.current = 0;

    // Swipe Action
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const diffX = endX - touchStartXRef.current;
    const diffY = endY - touchStartYRef.current;

    // Threshold 50px, and horizontal move must be greater than vertical move
    if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY)) {
        const currentIndex = dashboards.findIndex(d => d.id === activeDashboardId);
        if (currentIndex === -1) return;

        if (diffX > 0) {
            // Swipe Right -> Prev Dashboard
            if (currentIndex > 0) {
                setActiveDashboardId(dashboards[currentIndex - 1].id);
            }
        } else {
            // Swipe Left -> Next Dashboard
            if (currentIndex < dashboards.length - 1) {
                setActiveDashboardId(dashboards[currentIndex + 1].id);
            }
        }
    }
  };

  // CRUD Handlers
  const handleAddWidget = () => { 
      // Si on est sur le dashboard par défaut (Accueil) ou Favoris, on ne peut pas créer de widget "directement"
      if (activeDashboardId === 'default' || activeDashboardId === 'favorites') {
          // 1. Chercher un autre dashboard existant
          const otherDash = dashboards.find(d => d.id !== 'default' && d.id !== 'favorites');
          
          if (otherDash) {
              // On bascule sur ce dashboard pour créer le widget
              setActiveDashboardId(otherDash.id);
          } else {
              // 2. Si aucun autre dashboard, on en crée un "Mon Espace" automatiquement
              const newDash: Dashboard = {
                  id: crypto.randomUUID(),
                  name: 'Mon Espace',
                  icon: 'layout-grid'
              };
              setDashboards(prev => [...prev, newDash]);
              setActiveDashboardId(newDash.id);
          }
          
          // Dans tous les cas, on ouvre l'éditeur
          setEditingWidget(undefined); 
          loadAvailableData(); // Load commands for editor
          setIsWidgetEditorOpen(true);
          return;
      }

      setEditingWidget(undefined); 
      loadAvailableData(); // Load commands for editor
      setIsWidgetEditorOpen(true); 
  };

  const handleEditWidget = (widget: WidgetConfig) => { 
      setEditingWidget(widget); 
      loadAvailableData(); // Load commands for editor
      setIsWidgetEditorOpen(true); 
  };
  
  const handleDeleteWidgetClick = (id: string) => { 
      setDeleteWidgetId(id);
  };

  const confirmDeleteWidget = () => {
      if (deleteWidgetId) {
          setWidgets(widgets.filter(w => w.id !== deleteWidgetId));
          setDeleteWidgetId(null);
      }
  };

  const handleSaveWidget = (widget: WidgetConfig) => {
    setWidgets(editingWidget ? widgets.map(w => w.id === widget.id ? widget : w) : [...widgets, widget]);
  };
  const handleAddDashboard = () => { setEditingDashboard(undefined); setIsDashboardModalOpen(true); };
  const handleEditDashboard = (dashboard: Dashboard) => { setEditingDashboard(dashboard); setIsDashboardModalOpen(true); };
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

  const handleScenarioClick = (scenarioId: string) => {
      const scenario = scenarios.find(s => s.id === scenarioId);
      if (scenario) {
          setSelectedScenario(scenario);
          setIsScenarioDetailsOpen(true);
      }
  };

  // Réinitialisation de la config locale
  const performResetConfig = () => {
      localStorage.removeItem('jeedom_settings');
      localStorage.removeItem('jeedom_dashboards');
      localStorage.removeItem('jeedom_widgets');
      localStorage.removeItem('jeedom_secure_key');
      setSettings(DEFAULT_SETTINGS);
      window.location.reload();
  };

  const handleImportConfig = (data: { settings?: AppSettings, dashboards?: Dashboard[], widgets?: WidgetConfig[] }) => {
    if (data.settings) setSettings(data.settings);
    if (data.dashboards) setDashboards(data.dashboards);
    if (data.widgets) setWidgets(data.widgets);
    
    // Force reset active dashboard if current one doesn't exist anymore
    if (data.dashboards && data.dashboards.length > 0) {
       const exists = data.dashboards.find(d => d.id === activeDashboardId);
       if (!exists) setActiveDashboardId(data.dashboards[0].id);
    }

    setNotification({ message: "Configuration importée avec succès !", type: "warning" });
    setIsSettingsOpen(false);
  };

  // 1. Loading Settings
  if (!isSettingsLoaded) {
      return (
          <div className="min-h-screen bg-dark-bg flex items-center justify-center text-jeedom-500">
              <RefreshCw className="animate-spin" size={32} />
          </div>
      );
  }

  // 2. Welcome / Jeedom Configuration Screen
  const isConfigured = settings.useDemoMode || (settings.jeedomUrl && settings.apiKey);

  if (!isConfigured) {
      return (
          <>
            <LandingPage 
                onConnect={() => setIsSettingsOpen(true)}
                onDemo={() => setSettings({...settings, useDemoMode: true})}
            />
            <SettingsModal 
                isOpen={isSettingsOpen} 
                onClose={() => setIsSettingsOpen(false)}
                settings={settings}
                onSave={setSettings}
                dashboards={dashboards}
                widgets={widgets}
                onImport={handleImportConfig}
            />
          </>
      );
  }

  // Filter Widgets Logic
  const currentWidgets = widgets.filter(w => {
      const matchesCategory = (activeFilter === 'all' || w.category === activeFilter || (!w.category && activeFilter === 'other'));
      
      // Dashboard Accueil : Aucun widget (juste la présentation)
      if (activeDashboardId === 'default') {
          return false;
      }
      
      // Dashboard Favoris : Widgets favoris
      if (activeDashboardId === 'favorites') {
          return w.isFavorite && matchesCategory;
      }

      // Sinon on affiche les widgets du dashboard actif
      return w.dashboardId === activeDashboardId && matchesCategory;
  });
  
  const activeDashboard = dashboards.find(d => d.id === activeDashboardId);
  const isHomeDashboard = activeDashboardId === 'default';

  // Widget to delete for Modal Message
  const widgetToDelete = widgets.find(w => w.id === deleteWidgetId);

  return (
    <div className="min-h-screen bg-dark-bg text-content-primary flex flex-col font-sans overflow-hidden transition-colors duration-300">

      <RouteTracker />
      <SEO title="EasyDash | Dashboard" />
      
      {notification && (
        <Toast 
            message={notification.message} 
            type={notification.type} 
            onClose={() => setNotification(null)} 
        />
      )}

      {/* Cookie Banner */}
      <CookieBanner />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-dark-surface/80 backdrop-blur-md border-b border-border h-16 px-4 flex items-center justify-between z-50 transition-colors duration-300">
        
        {/* Main Logo / Menu Button */}
        <div className="relative" ref={mainMenuRef}>
            <button 
                onClick={() => {
                    setIsMainMenuPopping(true);
                    setTimeout(() => setIsMainMenuPopping(false), 300);
                    setIsMainMenuOpen(!isMainMenuOpen);
                }}
                title="Menu Principal"
                className="flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-jeedom-500 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-surface rounded-lg group"
            >
                <div className={`w-8 h-8 rounded-lg overflow-hidden shadow-lg shadow-jeedom-900/50 transition-transform duration-200 ${isMainMenuPopping ? 'animate-pop' : (isMainMenuOpen ? 'scale-90 rotate-3' : 'group-hover:animate-bounce-subtle')}`}>
                    <img src="/logo.png" alt="EasyDash" className="w-full h-full object-cover" />
                </div>
                <div className="hidden sm:block">
                    <h1 className="font-bold text-lg tracking-tight text-content-primary">EasyDash</h1>
                </div>
                {/* Indicateur visuel pour le menu sur mobile (optionnel mais utile) */}
                <div className="sm:hidden text-content-secondary">
                    <Menu size={16} />
                </div>
            </button>
            
            {/* Dropdown Menu */}
            {isMainMenuOpen && (
                <div className="absolute top-full left-0 mt-3 w-56 bg-dark-surface border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
                    <div className="p-1">
                        <button 
                            onClick={() => { setIsScenarioModalOpen(true); setIsMainMenuOpen(false); }}
                            className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-input-bg flex items-center gap-3 text-sm font-medium text-content-primary transition-colors"
                        >
                            <Workflow size={18} className="text-jeedom-500" />
                            Scénarios
                        </button>
                        <div className="h-px bg-border my-1 mx-2"></div>
                        <button 
                            onClick={() => { setIsHelpModalOpen(true); setIsMainMenuOpen(false); }}
                            className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-input-bg flex items-center gap-3 text-sm font-medium text-content-primary transition-colors"
                        >
                            <BookOpen size={18} className="text-jeedom-500" />
                            Aide & Documentation
                        </button>
                        <button 
                            onClick={() => { setIsContactModalOpen(true); setIsMainMenuOpen(false); }}
                            className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-input-bg flex items-center gap-3 text-sm font-medium text-content-primary transition-colors"
                        >
                            <Mail size={18} className="text-jeedom-500" />
                            Contact / Support
                        </button>
                        <div className="h-px bg-border my-1 mx-2"></div>
                        <button 
                            onClick={() => { setIsSettingsOpen(true); setIsMainMenuOpen(false); }}
                            className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-input-bg flex items-center gap-3 text-sm font-medium text-content-primary transition-colors"
                        >
                            <Settings size={18} className="text-content-secondary" />
                            Paramètres
                        </button>
                        <button 
                            onClick={() => { setIsResetConfirmationOpen(true); setIsMainMenuOpen(false); }}
                            className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-red-500/10 flex items-center gap-3 text-sm font-medium text-red-400 transition-colors"
                        >
                            <RotateCcw size={18} />
                            Réinitialiser
                        </button>
                        {/* Copyright */}
                        <div className="h-px bg-border my-1 mx-2"></div>
                        <div className="px-3 py-2 text-center">
                            <button 
                                onClick={() => { setIsReleaseNotesOpen(true); setIsMainMenuOpen(false); }}
                                className="text-[10px] text-content-secondary font-medium hover:text-jeedom-500 transition-colors cursor-pointer"
                            >
                                v{APP_VERSION}
                            </button>
                            <span className="text-[10px] text-content-secondary font-medium mx-1">-</span>
                            <span className="text-[10px] text-content-secondary font-medium">
                                © <a href="https://www.gauthier-nicolas.fr" target="_blank" rel="noopener noreferrer" className="hover:text-jeedom-500 transition-colors">Gauthier Nicolas</a>
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
        
        {/* Right Actions */}
        <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-content-secondary mr-2 hidden sm:flex items-center gap-2">
             {settings.useDemoMode ? <span className="bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded border border-orange-500/30">DÉMO</span> : null}
            </span>

            <button 
                onClick={() => setIsEditMode(!isEditMode)}
                className={`p-2 rounded-full transition-colors ${isEditMode ? 'bg-jeedom-600 text-white shadow-lg shadow-jeedom-500/30' : 'text-content-secondary hover:bg-input-bg'}`}
                title="Mode Édition"
            >
                <Edit3 size={20} />
            </button>

            {/* Desktop Settings Shortcut (Hidden on small mobile if menu is preferred, but kept for ease) */}
            <button 
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 text-content-secondary hover:bg-input-bg rounded-full transition-colors hidden sm:block"
                title="Paramètres"
            >
                <Settings size={20} />
            </button>
        </div>
      </header>

      {/* App Layout */}
      <div className="flex h-screen pt-16">
          
          {/* Desktop Sidebar */}
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
                                      <button onClick={() => handleEditDashboard(dash)} className="p-1.5 text-content-secondary hover:text-content-primary hover:bg-input-bg rounded-md" title="Modifier le dashboard"><Edit3 size={14}/></button>
                                      <button onClick={() => handleDeleteDashboard(dash.id)} className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-md" title="Supprimer le dashboard"><Trash2 size={14}/></button>
                                  </div>
                              )}
                          </div>
                      );
                  })}
                  
                  {isEditMode && (
                      <button 
                          onClick={handleAddDashboard}
                          className="w-full flex items-center justify-center gap-2 p-3 mt-2 rounded-xl border border-dashed border-border text-content-secondary hover:border-jeedom-500/50 hover:text-jeedom-500 hover:bg-jeedom-500/5 transition-all"
                      >
                          <Plus size={18} />
                          <span>Nouveau</span>
                      </button>
                  )}
              </div>

              {/* Desktop Footer (Help & Copyright) */}
              <div className="p-4 border-t border-border bg-dark-bg/20 space-y-2">
                <button
                    onClick={() => setIsScenarioModalOpen(true)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-content-secondary hover:bg-input-bg hover:text-content-primary transition-all text-sm font-medium"
                >
                    <Workflow size={18} className="text-jeedom-500" />
                    Scénarios
                </button>
                <div className="h-px bg-border mx-2 my-1"></div>
                <button
                    onClick={() => setIsHelpModalOpen(true)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-content-secondary hover:bg-input-bg hover:text-content-primary transition-all text-sm font-medium"
                >
                    <BookOpen size={18} className="text-jeedom-500" />
                    Aide & Documentation
                </button>
                <button
                    onClick={() => setIsContactModalOpen(true)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-content-secondary hover:bg-input-bg hover:text-content-primary transition-all text-sm font-medium"
                >
                    <Mail size={18} className="text-jeedom-500" />
                    Contact / Support
                </button>
                <div className="mt-4 text-center">
                    <button 
                        onClick={() => setIsReleaseNotesOpen(true)}
                        className="text-[10px] text-content-secondary font-medium opacity-60 hover:opacity-100 hover:text-jeedom-500 transition-all cursor-pointer"
                    >
                        v{APP_VERSION}
                    </button>
                    <span className="text-[10px] text-content-secondary font-medium opacity-60 mx-1">-</span>
                    <span className="text-[10px] text-content-secondary font-medium opacity-60">
                        © <a href="https://www.gauthier-nicolas.fr" target="_blank" rel="noopener noreferrer" className="hover:text-jeedom-500 transition-colors">Gauthier Nicolas</a>
                    </span>
                </div>
            </div>
          </aside>

          {/* Main Content & Mobile Navigation */}
          <div className="flex-1 flex flex-col min-w-0 bg-dark-bg relative transition-colors duration-300">
              
              {/* Mobile Tabs */}
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
                                      onClick={(e) => { e.stopPropagation(); handleEditDashboard(dash); }}
                                      className="ml-2 -mr-1 p-0.5 rounded-full hover:bg-content-primary/10 transition-colors"
                                  >
                                      <Edit3 size={12} />
                                  </div>
                              )}
                              {isEditMode && isActive && dash.id !== 'default' && (
                                  <div 
                                      onClick={(e) => { e.stopPropagation(); handleDeleteDashboard(dash.id); }}
                                      className="ml-1 p-0.5 rounded-full hover:bg-red-500/50 text-red-200"
                                  >
                                      <XCircle size={14} />
                                  </div>
                              )}
                          </button>
                      )
                  })}
                  {isEditMode && (
                      <button
                          onClick={handleAddDashboard}
                          className="flex items-center justify-center w-8 h-8 rounded-full bg-input-bg text-content-secondary border border-border hover:text-jeedom-500 hover:border-jeedom-500 flex-shrink-0"
                      >
                          <Plus size={16} />
                      </button>
                  )}
              </div>

              <main 
                  ref={mainRef}
                  className="flex-1 overflow-y-auto scroll-smooth relative overscroll-contain bg-cover bg-center bg-no-repeat bg-fixed transition-all duration-500"
                  style={{
                      backgroundImage: activeDashboard?.backgroundImage ? `url(${activeDashboard.backgroundImage})` : undefined
                  }}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
              >
                  {/* Background Overlay */}
                  {activeDashboard?.backgroundImage && (
                      <div className="absolute inset-0 bg-dark-bg/70 backdrop-blur-sm z-0 pointer-events-none transition-opacity duration-500" />
                  )}

                  {/* Pull Refresh Indicator */}
                  <div 
                      className="absolute left-0 right-0 flex justify-center pointer-events-none transition-transform duration-200 z-10"
                      style={{ 
                          top: '20px', 
                          transform: `translateY(${pullChange - 60}px)`,
                          opacity: pullChange > 10 ? 1 : 0
                      }}
                  >
                      <div className={`bg-dark-surface p-2 rounded-full shadow-lg border border-border flex items-center justify-center transition-colors ${pullChange > 70 ? 'text-jeedom-500 border-jeedom-500' : 'text-content-secondary'}`}>
                           <RefreshCw size={20} className={`${isLoading && pullChange > 0 ? "animate-spin" : ""} transition-transform`} style={{ transform: `rotate(${pullChange * 3}deg)` }}/>
                      </div>
                  </div>

                  <div 
                    className="p-4 sm:p-6 pb-24 min-h-full flex flex-col relative z-10"
                    style={{ transform: `translateY(${Math.max(0, pullChange * 0.5)}px)`, transition: 'transform 0.1s ease-out' }}
                  >
                    
                    {/* Dashboard Header */}
                    <div className="mb-4">
                        <div className="md:hidden flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-content-primary flex items-center gap-2">
                                {activeDashboard && ICONS[activeDashboard.icon] && React.createElement(ICONS[activeDashboard.icon], {size: 24, className: "text-jeedom-500"})}
                                {activeDashboard?.name}
                            </h2>
                        </div>
                    </div>

                    {currentWidgets.length === 0 && !isLoading && (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 animate-in fade-in zoom-in duration-500 w-full max-w-5xl mx-auto">
                            
                            {isHomeDashboard ? (
                                // --- NOUVELLE VUE D'ACCUEIL (Présentation) ---
                                <div className="w-full space-y-10 py-8">
                                    {/* Header */}
                                    <div className="text-center space-y-4">
                                        <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-jeedom-500 to-blue-600 bg-clip-text text-transparent">
                                            Découvrez EasyDash
                                        </h2>
                                        
                                        {/* Disclaimer */}
                                        <div className="max-w-xl mx-auto bg-jeedom-500/10 border border-jeedom-500/20 rounded-lg p-3 text-xs text-jeedom-600">
                                            <p>
                                                EasyDash est une application indépendante développée par nos soins et n'est pas affiliée, soutenue ou sponsorisée par la société JEEDOM SAS.
                                            </p>
                                        </div>

                                        <p className="text-content-secondary text-lg max-w-2xl mx-auto leading-relaxed">
                                            Une interface fluide pour piloter votre domotique Jeedom. 
                                            <br className="hidden md:block"/>
                                            Créez des tableaux de bord sur mesure en quelques clics.
                                        </p>
                                    </div>

                                    {/* Feature Cards */}
                                    <div className="grid md:grid-cols-3 gap-6 text-left">
                                        {/* 1. Dashboards */}
                                        <div className="bg-dark-card border border-border p-6 rounded-2xl relative overflow-hidden group hover:border-jeedom-500/50 transition-colors">
                                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                                <LayoutDashboard size={80} />
                                            </div>
                                            <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center mb-4">
                                                <LayoutDashboard size={24} />
                                            </div>
                                            <h3 className="text-lg font-bold text-content-primary mb-2">Dashboards Illimités</h3>
                                            <p className="text-sm text-content-secondary">
                                                Organisez votre maison par pièces (Salon, Cuisine...) via le menu. 
                                                La page <span className="text-amber-400 font-medium"><Star size={10} className="inline"/> Favoris</span> regroupe vos widgets préférés.
                                            </p>
                                        </div>

                                        {/* 2. Widgets */}
                                        <div className="bg-dark-card border border-border p-6 rounded-2xl relative overflow-hidden group hover:border-jeedom-500/50 transition-colors">
                                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                                <Layers size={80} />
                                            </div>
                                            <div className="w-12 h-12 bg-jeedom-500/20 text-jeedom-500 rounded-xl flex items-center justify-center mb-4">
                                                <Plus size={24} />
                                            </div>
                                            <h3 className="text-lg font-bold text-content-primary mb-2">Widgets Intelligents</h3>
                                            <p className="text-sm text-content-secondary">
                                                Créez des boutons simples, des interrupteurs ou des <strong>cycles d'actions</strong> complexes (séquences multi-étapes).
                                            </p>
                                        </div>

                                        {/* 3. Editor */}
                                        <div className="bg-dark-card border border-border p-6 rounded-2xl relative overflow-hidden group hover:border-jeedom-500/50 transition-colors">
                                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                                <Edit3 size={80} />
                                            </div>
                                            <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center mb-4">
                                                <Edit3 size={24} />
                                            </div>
                                            <h3 className="text-lg font-bold text-content-primary mb-2">Mode Édition</h3>
                                            <p className="text-sm text-content-secondary">
                                                Cliquez sur le crayon <Edit3 size={12} className="inline mx-1"/> en haut à droite pour déplacer, redimensionner ou supprimer vos widgets à tout moment.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Actions & Setup Info */}
                                    <div className="space-y-6 pt-2 max-w-2xl mx-auto w-full">
                                        
                                        {!isConfigured && (
                                            <div className="bg-jeedom-500/10 border border-jeedom-500/20 rounded-2xl p-6 text-center animate-in fade-in slide-in-from-bottom-4 delay-100">
                                                <h3 className="text-lg font-bold text-jeedom-500 mb-2 flex items-center justify-center gap-2">
                                                    <Settings size={20} />
                                                    Connectez votre Jeedom
                                                </h3>
                                                <p className="text-content-secondary mb-5 text-sm leading-relaxed">
                                                    Pour démarrer et piloter vos équipements réels, vous devez aller dans les <strong>Paramètres</strong> et renseigner l'URL de votre Jeedom ainsi que votre Clé API.
                                                </p>
                                                <button 
                                                    onClick={() => setIsSettingsOpen(true)}
                                                    className="bg-jeedom-600 hover:bg-jeedom-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-jeedom-900/20 transition-transform active:scale-95 flex items-center gap-2 mx-auto"
                                                >
                                                    Ouvrir les paramètres
                                                </button>
                                            </div>
                                        )}

                                        {/* Demo Button */}
                                        {settings.useDemoMode && (
                                            <div className="text-center">
                                                 <p className="text-xs text-content-secondary mb-2">Vous êtes en mode démo.</p>
                                                 <button 
                                                    onClick={handleAddWidget}
                                                    className="text-content-primary hover:text-jeedom-400 font-medium flex items-center justify-center gap-2 mx-auto px-5 py-2.5 rounded-xl hover:bg-dark-card transition-colors border border-transparent hover:border-border"
                                                >
                                                    <Plus size={18} />
                                                    Créer un widget démo
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Release Notes */}
                                    <div className="pt-12 border-t border-border/50">
                                        <h3 className="text-xl font-bold text-content-primary mb-6 flex items-center justify-center gap-2">
                                            <BookOpen size={20} className="text-jeedom-500" />
                                            Dernières nouveautés
                                        </h3>
                                        <div className="text-left max-w-3xl mx-auto bg-dark-card/50 p-6 rounded-2xl border border-border/50">
                                            <ReleaseNotesList />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                // --- ANCIENNE VUE VIDE (Pour les autres dashboards) ---
                                <>
                                    <div className="w-20 h-20 bg-dark-surface rounded-3xl flex items-center justify-center mb-6 text-content-secondary shadow-inner">
                                        {activeFilter === 'all' 
                                            ? (activeDashboardId === 'favorites' ? <Star size={40} className="text-amber-400" /> : <LayoutDashboard size={40} />) 
                                            : <div className="text-jeedom-500"><XCircle size={40} /></div>}
                                    </div>
                                    <h3 className="text-xl font-bold text-content-primary mb-2">
                                        {activeDashboardId === 'favorites' ? 'Aucun favori' : (activeFilter === 'all' ? 'Dashboard Vide' : 'Aucun widget')}
                                    </h3>
                                    <p className="text-content-secondary max-w-xs mb-8">
                                        {activeDashboardId === 'favorites'
                                        ? 'Ajoutez des widgets en favoris depuis vos autres dashboards pour les voir apparaître ici.'
                                        : (activeFilter === 'all' 
                                            ? 'Ajoutez des widgets pour contrôler vos équipements.' 
                                            : `Aucun widget trouvé dans la catégorie "${CATEGORIES.find(c => c.id === activeFilter)?.label}".`)}
                                    </p>
                                    
                                    {activeDashboardId !== 'favorites' && activeFilter === 'all' ? (
                                        <button 
                                            onClick={handleAddWidget}
                                            className="bg-jeedom-600 hover:bg-jeedom-500 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-jeedom-900/20 flex items-center gap-2 transition-transform active:scale-95"
                                        >
                                            <Plus size={20} />
                                            Ajouter un Widget
                                        </button>
                                    ) : activeDashboardId !== 'favorites' && (
                                        <button 
                                            onClick={() => setActiveFilter('all')}
                                            className="text-jeedom-500 hover:underline"
                                        >
                                            Voir tout
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {currentWidgets.length === 0 && isLoading && activeFilter === 'all' && (
                        <div className="flex flex-col items-center justify-center h-[50vh]">
                            <RefreshCw size={32} className="animate-spin text-jeedom-500 mb-4" />
                            <p className="text-content-secondary">Connexion à Jeedom...</p>
                        </div>
                    )}

                    {/* Widget Grid */}
                    <DndContext 
                        sensors={sensors} 
                        collisionDetection={closestCenter} 
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext 
                            items={currentWidgets.map(w => w.id)} 
                            strategy={rectSortingStrategy}
                        >
                            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-4 auto-rows-[120px] sm:auto-rows-[160px]">
                                {currentWidgets.map(widget => (
                                    <SortableWidget 
                                        key={widget.id}
                                        widget={widget}
                                        commands={commands}
                                        scenarios={scenarios}
                                        settings={settings}
                                        editMode={isEditMode}
                                        isConnected={isConnected}
                                        onEdit={handleEditWidget}
                                        onDelete={handleDeleteWidgetClick}
                                        onScenarioClick={handleScenarioClick}
                                        onActionSuccess={() => refreshWidgetValues(currentWidgets)}
                                    />
                                ))}
                                
                                {isEditMode && activeFilter === 'all' && !isHomeDashboard && activeDashboardId !== 'favorites' && (
                                    <button 
                                        onClick={handleAddWidget}
                                        className="col-span-1 row-span-1 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center text-content-secondary hover:text-jeedom-400 hover:border-jeedom-400/50 hover:bg-jeedom-400/5 transition-all group"
                                    >
                                        <div className="bg-input-bg group-hover:bg-jeedom-400/20 rounded-full p-2.5 mb-2 transition-colors">
                                            <Plus size={20} />
                                        </div>
                                        <span className="text-xs font-medium">Ajouter</span>
                                    </button>
                                )}
                            </div>
                        </SortableContext>
                    </DndContext>
                  </div>
              </main>

              {/* Footer Filter Bar */}
              <div className="flex-none bg-dark-surface/95 backdrop-blur border-t border-border z-40 transition-colors duration-300">
                  <div className="flex items-center justify-between px-2 py-2 gap-1 overflow-x-auto no-scrollbar">
                      {CATEGORIES.map(cat => {
                            const isActive = activeFilter === cat.id;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveFilter(cat.id)}
                                    className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-lg transition-all flex-1 min-w-[44px] ${
                                        isActive 
                                        ? 'text-jeedom-500 bg-jeedom-500/10' 
                                        : 'text-content-secondary hover:bg-dark-card hover:text-content-primary'
                                    }`}
                                >
                                    <cat.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                                    <span className={`text-[9px] mt-1 font-medium truncate w-full text-center ${isActive ? 'text-jeedom-500' : ''}`}>
                                        {cat.label}
                                    </span>
                                </button>
                            );
                      })}
                  </div>
              </div>
          </div>
      </div>

      <ReleaseNotesModal 
          isOpen={isReleaseNotesOpen}
          onClose={() => setIsReleaseNotesOpen(false)}
      />

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={(newSettings) => {
            setSettings(newSettings);
        }}
        dashboards={dashboards}
        widgets={widgets}
        onImport={handleImportConfig}
      />

      <WidgetEditorModal 
        isOpen={isWidgetEditorOpen}
        onClose={() => setIsWidgetEditorOpen(false)}
        onSave={handleSaveWidget}
        initialData={editingWidget}
        availableEqLogics={eqLogics}
        availableScenarios={scenarios}
        dashboardId={activeDashboardId}
        settings={settings}
      />

      <DashboardModal
        isOpen={isDashboardModalOpen}
        onClose={() => setIsDashboardModalOpen(false)}
        onSave={handleSaveDashboard}
        initialData={editingDashboard}
        imgbbApiKey={settings.imgbbApiKey}
      />

      <ScenarioModal 
        isOpen={isScenarioModalOpen}
        onClose={() => setIsScenarioModalOpen(false)}
        settings={settings}
      />

      <ScenarioDetailsModal
          isOpen={isScenarioDetailsOpen}
          onClose={() => setIsScenarioDetailsOpen(false)}
          scenario={selectedScenario}
          settings={settings}
          onUpdate={initialLoad}
      />

      <ConfirmationModal
          isOpen={!!deleteWidgetId}
          onClose={() => setDeleteWidgetId(null)}
          onConfirm={confirmDeleteWidget}
          title="Supprimer le widget ?"
          message={widgetToDelete 
            ? `Voulez-vous vraiment supprimer le widget "${widgetToDelete.name}" ?`
            : "Cette action est irréversible. Voulez-vous vraiment supprimer ce widget de votre dashboard ?"
          }
          confirmLabel="Supprimer"
      />

      {/* Confirmation de réinitialisation */}
      <ConfirmationModal
          isOpen={isResetConfirmationOpen}
          onClose={() => setIsResetConfirmationOpen(false)}
          onConfirm={performResetConfig}
          title="Réinitialiser l'application ?"
          message="Attention : Toutes vos données (configuration, dashboards, widgets) seront définitivement supprimées de cet appareil. Cette action est irréversible."
          confirmLabel="Tout effacer"
          cancelLabel="Annuler"
      />

      <HelpModal 
          isOpen={isHelpModalOpen}
          onClose={() => setIsHelpModalOpen(false)}
      />

      <ContactModal
          isOpen={isContactModalOpen}
          onClose={() => setIsContactModalOpen(false)}
      />

    </div>
  );
};

export default App;