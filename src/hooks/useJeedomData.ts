import { useState, useEffect, useCallback, useRef } from 'react';
import { JeedomEqLogic, JeedomCommand, JeedomScenario, AppSettings, WidgetConfig } from '../types';
import { fetchJeedomFullData, fetchSpecificCommandValues, fetchJeedomScenarios } from '../services/jeedomService';
import { jeedomWs } from '../services/jeedomWs';
import { ToastType } from '../components/Toast';

export function useJeedomData(settings: AppSettings, isSettingsLoaded: boolean, widgets: WidgetConfig[], setNotification: (notification: {message: string, type: ToastType} | null) => void) {
  const [eqLogics, setEqLogics] = useState<JeedomEqLogic[]>(() => {
    const saved = localStorage.getItem('jeedom_eqLogics');
    return saved ? JSON.parse(saved) : [];
  });
  const [commands, setCommands] = useState<JeedomCommand[]>([]);
  const [scenarios, setScenarios] = useState<JeedomScenario[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const isFetchingRef = useRef(false);

  useEffect(() => { localStorage.setItem('jeedom_eqLogics', JSON.stringify(eqLogics)); }, [eqLogics]);

  useEffect(() => {
    const allCmds: JeedomCommand[] = [];
    eqLogics.forEach(eq => {
      if (eq.cmds) allCmds.push(...eq.cmds);
    });
    setCommands(allCmds);
    checkBatteryLevels(eqLogics);
  }, [eqLogics]);

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

  const updateCommandValues = useCallback((updates: Array<{id: string, value: string | number}>) => {
      setCommands(prevCmds => {
          const newCmds = [...prevCmds];
          let hasChanges = false;
          updates.forEach(update => {
              const index = newCmds.findIndex(c => String(c.id) === String(update.id));
              if (index !== -1 && String(newCmds[index].value) !== String(update.value)) {
                   newCmds[index] = { ...newCmds[index], value: update.value };
                   hasChanges = true;
              }
          });
          return hasChanges ? newCmds : prevCmds;
      });
  }, []);

  const refreshWidgetValues = useCallback(async (widgetsToRefresh: WidgetConfig[]) => {
      if (widgetsToRefresh.length === 0) return;
      
      if (isFetchingRef.current) {
          console.log("Skipping refresh: Request already in progress");
          return;
      }

      isFetchingRef.current = true;

      const idsToFetch = new Set<string>();
      widgetsToRefresh.forEach(w => {
          if (w.type === 'info') {
              if (w.infoId) idsToFetch.add(w.infoId);
              if (w.commandId) idsToFetch.add(w.commandId);
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

  const initialLoad = useCallback(async () => {
    if (!isSettingsLoaded) return;
    if (!settings.useDemoMode && (!settings.jeedomUrl || !settings.apiKey)) return;

    setIsLoading(true);
    setNotification(null);
    try {
      // Requête 1 : scénarios
      const scenes = await fetchJeedomScenarios(settings);
      setScenarios(scenes);

      // Requête 2 : structure complète + valeurs cachées Jeedom
      await loadAvailableData();

      // Requête 3 (chunked, max 3 simultanées) : valeurs live des widgets du dashboard courant
      // Nécessaire car jeeObject::full peut retourner des valeurs null pour certains plugins.
      // Sautée si le WebSocket est déjà connecté et prend en charge les mises à jour.
      if (!jeedomWs.isConnected() && widgets.length > 0) {
          await refreshWidgetValues(widgets);
      }

      if (!settings.useDemoMode && scenes.length === 0 && widgets.length === 0) {
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
  }, [settings, isSettingsLoaded, widgets, loadAvailableData, refreshWidgetValues]);

  useEffect(() => {
    if (isSettingsLoaded) {
        initialLoad();
    }
  }, [initialLoad, isSettingsLoaded]);

  return { eqLogics, commands, scenarios, isLoading, loadAvailableData, refreshWidgetValues, updateCommandValues, setCommands };
}
