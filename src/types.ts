

// App specific types
export type WidgetCategory = 'all' | 'light' | 'climate' | 'security' | 'multimedia' | 'outlet' | 'opening' | 'other';

export interface WidgetConfig {
  id: string;
  dashboardId: string;
  name: string;
  type: 'info' | 'action' | 'toggle' | 'slider' | 'scenario' | 'chart' | 'camera' | 'thermostat' | 'weather' | 'alarm';
  category?: WidgetCategory; // New field for filtering
  isFavorite?: boolean; // New field for Home/Favorites display
  historyPeriod?: '24h' | '7d' | '30d' | 'custom'; // For chart widgets
  chartType?: 'line' | 'bar'; // New field for chart type
  chartAggregation?: 'none' | 'daily_avg' | 'daily_max' | 'daily_sum'; // New field for data aggregation
  chartCustomStart?: string; // ISO date 'YYYY-MM-DD' quand historyPeriod === 'custom'
  chartCustomEnd?: string;
  
  // Camera specific
  streamUrl?: string;
  refreshInterval?: number; // For snapshots (ms)

  // Thermostat specific
  currentTempCmdId?: string;
  setpointCmdId?: string;
  actionUpCmdId?: string;
  actionDownCmdId?: string;
  stateCmdId?: string; // e.g. "heating", "cooling", "off"
  modeInfoCmdId?: string; // commande info pour le mode actuel (absent, eco, …)
  awayModeCmdId?: string; // commande action pour activer le mode Absent
  ecoModeCmdId?: string;  // commande action pour activer le mode Éco

  // Weather specific
  tempCmdId?: string;
  conditionCmdId?: string;
  minCmdId?: string;
  maxCmdId?: string;

  // Slider specific
  sliderInfoId?: string;   // commande info pour lire la valeur courante
  sliderActionId?: string; // commande action (subType: slider) pour envoyer la valeur
  sliderMin?: number;
  sliderMax?: number;
  sliderStep?: number;

  // Alarm specific
  alarmActivateCmdId?: string;   // command action to arm the alarm
  alarmDeactivateCmdId?: string; // command action to disarm the alarm
  alarmStateId?: string;         // optional: info command for current alarm state
  alarmCodeHash?: string;        // SHA-256 hash of the disarm PIN (plain text never stored)
  alarmArmedValue?: string;      // value that means "armed" (default: '1')

  commandId?: string; // The ID to execute action or read info
  commandOffId?: string; // Specific ID for OFF action (for toggles)
  scenarioId?: string; // The ID of the scenario to execute
  scenarioTags?: { name: string; value: string }[]; // Tags passés au scénario au lancement
  additionalCommandIds?: string[]; // For batch actions or legacy sequence
  sequenceSteps?: string[][]; // For multi-command sequence steps
  actionExecutionMode?: 'sequence' | 'batch'; // 'sequence' = cycle (1 click = 1 step), 'batch' = all at once
  infoId?: string; // For toggles, the state feedback ID
  displayInfoId?: string; // Secondary info ID to display on large cards
  icon: string;
  color: string;
  borderColor?: string; // Custom border color
  size: 'small' | 'medium' | 'large' | 'wide';
}

export interface Dashboard {
  id: string;
  name: string;
  icon: string;
  backgroundImage?: string;
}

export interface AppSettings {
  jeedomUrl: string;
  apiKey: string;
  refreshInterval: number;
  useDemoMode: boolean;
  useProxy: boolean; // New option for CORS bypass
  useWebSocket?: boolean; // Option to disable WebSocket
  theme: 'light' | 'dark';
  imgbbApiKey?: string;
}

// Jeedom API Types (Simplified)
export interface JeedomCommand {
  id: string;
  logicalId: string;
  generic_type: string;
  eqType: string;
  name: string;
  order: string;
  type: string; // 'info' or 'action'
  subType: string; // 'binary', 'numeric', 'string', 'other'
  eqLogic_id: string;
  isHistorized: string;
  unite: string;
  configuration: any;
  template: any;
  display: any;
  value?: string | number; // Current value if available in fullData
  isVisible: string;
}

export interface JeedomEqLogic {
  id: string;
  name: string;
  eqType_name: string;
  isVisible: string;
  isEnable: string;
  object_id: string;
  cmds: JeedomCommand[];
}

export interface JeedomScenario {
    id: string;
    name: string;
    isActive: string | number | boolean; // "1", 1, true
    group: string;
    mode: string;
    state: string; // "stop", "run"
    lastLaunch: string;
    object_id: string;
    isVisible: string;
}

export interface JeedomFullDataResponse {
  eqLogics: JeedomEqLogic[];
  scenes: any[];
}

// ─── Alert System ────────────────────────────────────────────────────────────

export type AlertConditionType = 'above' | 'below' | 'equals' | 'change';
export type AlertSeverity = 'info' | 'warning' | 'critical';
export type AlertChannel = 'toast' | 'notification' | 'both';

export interface AlertRule {
  id: string;
  name: string;
  cmdId: string;
  cmdName?: string;         // cache du nom pour l'affichage
  cmdUnit?: string;         // cache de l'unité
  conditionType: AlertConditionType;
  threshold: number | string;
  severity: AlertSeverity;
  channel: AlertChannel;
  enabled: boolean;
  cooldownMs: number;       // délai minimum entre deux déclenchements (ms)
  hysteresis?: number;      // marge évitant les oscillations autour du seuil
  enabledFrom?: string;     // HH:MM — plage horaire de début
  enabledTo?: string;       // HH:MM — plage horaire de fin
  createdAt: number;
}

export interface AlertHistory {
  id: string;
  ruleId: string;
  ruleName: string;
  cmdId: string;
  cmdName?: string;
  value: string | number;
  threshold: string | number;
  conditionType: AlertConditionType;
  severity: AlertSeverity;
  triggeredAt: number;
  acknowledged: boolean;
}

export interface AlertState {
  ruleId: string;
  lastValue: string | number | undefined;
  lastAlertAt: number;      // timestamp du dernier déclenchement
}

// ─────────────────────────────────────────────────────────────────────────────

export interface JeedomHealthItem {
  id: string;
  name: string;
  state: 'OK' | 'NOK' | 'WARNING';
  details: string;
  type: 'database' | 'filesystem' | 'cpu' | 'date' | 'network' | 'other';
}