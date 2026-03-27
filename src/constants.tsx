import React from 'react';
import { 
    Lightbulb, 
    LightbulbOff,
    Thermometer, 
    Wind, 
    Droplets, 
    Tv, 
    Lock, 
    Unlock, 
    Zap, 
    Activity, 
    Home, 
    Music, 
    Video, 
    Wifi, 
    WifiOff,
    Battery,
    Sun,
    Moon,
    ToggleLeft,
    Power,
    PowerOff,
    Eye,
    EyeOff,
    Volume2,
    VolumeX,
    Bell,
    BellOff,
    Shield,
    ShieldOff,
    LayoutGrid,
    Square,
    MoreHorizontal,
    Blinds,
    Play
} from 'lucide-react';
import { AppSettings, WidgetCategory } from './types';

export const ICONS: Record<string, React.FC<any>> = {
    'play': Play,
    'light': Lightbulb,
    'light-off': LightbulbOff,
    'temp': Thermometer,
    'wind': Wind,
    'water': Droplets,
    'tv': Tv,
    'lock': Lock,
    'unlock': Unlock,
    'power': Zap,
    'activity': Activity,
    'home': Home,
    'music': Music,
    'video': Video,
    'wifi': Wifi,
    'wifi-off': WifiOff,
    'battery': Battery,
    'sun': Sun,
    'moon': Moon,
    'switch': ToggleLeft,
    'button': Power,
    'button-off': PowerOff,
    'sensor': Eye,
    'sensor-off': EyeOff,
    'sound': Volume2,
    'mute': VolumeX,
    'bell': Bell,
    'bell-off': BellOff,
    'shield': Shield,
    'shield-off': ShieldOff,
    'blinds': Blinds
};

// Map defining the "Inactive" version of an icon.
// Key = Active Icon, Value = Inactive Icon
export const DYNAMIC_ICONS: Record<string, string> = {
    'light': 'light-off',
    'lock': 'unlock', // Lock = Active (Secured), Unlock = Inactive
    'wifi': 'wifi-off',
    'button': 'button-off',
    'sensor': 'sensor-off',
    'sound': 'mute',
    'bell': 'bell-off',
    'shield': 'shield-off'
};

export const COLORS = [
    { name: 'Blue', value: 'bg-blue-500' },
    { name: 'Green', value: 'bg-green-500' },
    { name: 'Red', value: 'bg-red-500' },
    { name: 'Orange', value: 'bg-orange-500' },
    { name: 'Purple', value: 'bg-purple-500' },
    { name: 'Pink', value: 'bg-pink-500' },
    { name: 'Gray', value: 'bg-gray-600' },
    { name: 'Jeedom', value: 'bg-jeedom-500' },
];

export const CATEGORIES: { id: WidgetCategory; label: string; icon: React.FC<any> }[] = [
    { id: 'all', label: 'Tout', icon: LayoutGrid },
    { id: 'light', label: 'Lumières', icon: Lightbulb },
    { id: 'climate', label: 'Confort', icon: Thermometer },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'opening', label: 'Ouvrants', icon: Blinds },
    { id: 'multimedia', label: 'Média', icon: Tv },
    { id: 'outlet', label: 'Prises', icon: Zap },
    { id: 'other', label: 'Autre', icon: MoreHorizontal },
];

export const DEFAULT_SETTINGS: AppSettings = {
    jeedomUrl: '',
    apiKey: '',
    refreshInterval: 5000,
    useDemoMode: true,
    useProxy: false,
    useWebSocket: true,
    theme: 'dark',
    imgbbApiKey: ''
};

export const APP_VERSION = '0.9.1';