import { useState, useEffect, useRef } from 'react';
import { AppSettings } from '../types';
import { DEFAULT_SETTINGS } from '../constants';
import { encryptData, decryptData } from '../services/cryptoService';

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);
  // Track the last plaintext apiKey we encrypted to avoid re-encrypting on unrelated changes
  const prevApiKeyRef = useRef<string>('');

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

  useEffect(() => {
    if (!isSettingsLoaded) return;

    const saveSettings = async () => {
      const settingsToSave = { ...settings };
      if (settingsToSave.apiKey) {
        if (settingsToSave.apiKey !== prevApiKeyRef.current) {
          // API key changed — re-encrypt and update the ref
          settingsToSave.apiKey = await encryptData(settingsToSave.apiKey);
          prevApiKeyRef.current = settings.apiKey;
        } else {
          // API key unchanged — reuse the already-encrypted value from storage
          // to avoid a costly Web Crypto operation on every settings change
          try {
            const stored = localStorage.getItem('jeedom_settings');
            const parsed = stored ? JSON.parse(stored) : {};
            if (parsed.apiKey) settingsToSave.apiKey = parsed.apiKey;
          } catch { /* fall back to re-encrypting */ }
        }
      }
      localStorage.setItem('jeedom_settings', JSON.stringify(settingsToSave));
    };
    saveSettings();
  }, [settings, isSettingsLoaded]);
  
    // Theme Application
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
    const metaThemeColor = document.querySelector("meta[name=theme-color]");
    if (metaThemeColor) {
        metaThemeColor.setAttribute("content", settings.theme === 'dark' ? '#121212' : '#f3f4f6');
    }
  }, [settings.theme]);

  const handleImportConfig = (data: { settings?: AppSettings }) => {
    if (data.settings) {
      const s = data.settings;
      if (typeof s.jeedomUrl !== 'string' || typeof s.apiKey !== 'string' || typeof s.refreshInterval !== 'number') {
        console.error("Import ignoré : données settings invalides", s);
        return;
      }
      setSettings({ ...DEFAULT_SETTINGS, ...s });
    }
  };

  const performResetConfig = () => {
      localStorage.removeItem('jeedom_settings');
      localStorage.removeItem('jeedom_dashboards');
      localStorage.removeItem('jeedom_widgets');
      localStorage.removeItem('jeedom_secure_key');
      setSettings(DEFAULT_SETTINGS);
      window.location.reload();
  };

  return { settings, setSettings, isSettingsLoaded, handleImportConfig, performResetConfig };
}
