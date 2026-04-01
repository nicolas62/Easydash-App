import React, { Suspense, lazy } from 'react';
import ConfirmationModal from '../ConfirmationModal';

const SettingsModal      = lazy(() => import('../SettingsModal'));
const WidgetEditorModal  = lazy(() => import('../WidgetEditorModal'));
const DashboardModal     = lazy(() => import('../DashboardModal'));
const HelpModal          = lazy(() => import('../HelpModal'));
const ContactModal       = lazy(() => import('../ContactModal'));
const ScenarioModal      = lazy(() => import('../ScenarioModal'));
const ScenarioDetailsModal = lazy(() => import('../ScenarioDetailsModal'));
const ReleaseNotesModal  = lazy(() => import('../ReleaseNotesModal'));
import { AppSettings, Dashboard, WidgetConfig, JeedomEqLogic, JeedomCommand, JeedomScenario } from '../../types';

interface ModalsProps {
  isSettingsOpen: boolean;
  closeSettings: () => void;
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  dashboards: Dashboard[];
  widgets: WidgetConfig[];
  commands: JeedomCommand[];
  alertHistoryRefreshKey?: number;
  onImportConfig: (data: any, mode: 'replace' | 'merge') => void;
  isWidgetEditorOpen: boolean;
  closeWidgetEditor: () => void;
  editingWidget?: WidgetConfig;
  onSaveWidget: (widget: WidgetConfig) => void;
  eqLogics: JeedomEqLogic[];
  activeDashboardId: string;
  isDashboardModalOpen: boolean;
  closeDashboardModal: () => void;
  editingDashboard?: Dashboard;
  onSaveDashboard: (dashboard: Dashboard) => void;
  deleteWidgetId: string | null;
  confirmDeleteWidget: () => void;
  cancelDeleteWidget: () => void;
  widgetToDelete?: WidgetConfig;
  deleteDashboardId: string | null;
  confirmDeleteDashboard: () => void;
  cancelDeleteDashboard: () => void;
  dashboardToDelete?: Dashboard;
  isHelpModalOpen: boolean;
  closeHelpModal: () => void;
  isContactModalOpen: boolean;
  closeContactModal: () => void;
  isScenarioModalOpen: boolean;
  closeScenarioModal: () => void;
  scenarios: JeedomScenario[];
  onScenarioClick: (scenario: JeedomScenario) => void;
  isScenarioDetailsOpen: boolean;
  closeScenarioDetails: () => void;
  selectedScenario: JeedomScenario | null;
  isResetConfirmationOpen: boolean;
  closeResetConfirmation: () => void;
  performResetConfig: () => void;
  isReleaseNotesOpen: boolean;
  closeReleaseNotes: () => void;
}

const Modals: React.FC<ModalsProps> = ({
  isSettingsOpen,
  closeSettings,
  settings,
  onSaveSettings,
  dashboards,
  widgets,
  commands,
  alertHistoryRefreshKey,
  onImportConfig,
  isWidgetEditorOpen,
  closeWidgetEditor,
  editingWidget,
  onSaveWidget,
  eqLogics,
  activeDashboardId,
  isDashboardModalOpen,
  closeDashboardModal,
  editingDashboard,
  onSaveDashboard,
  deleteWidgetId,
  confirmDeleteWidget,
  cancelDeleteWidget,
  widgetToDelete,
  deleteDashboardId,
  confirmDeleteDashboard,
  cancelDeleteDashboard,
  dashboardToDelete,
  isHelpModalOpen,
  closeHelpModal,
  isContactModalOpen,
  closeContactModal,
  isScenarioModalOpen,
  closeScenarioModal,
  scenarios,
  onScenarioClick,
  isScenarioDetailsOpen,
  closeScenarioDetails,
  selectedScenario,
  isResetConfirmationOpen,
  closeResetConfirmation,
  performResetConfig,
  isReleaseNotesOpen,
  closeReleaseNotes,
}) => {
  return (
    <Suspense fallback={null}>
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={closeSettings}
        settings={settings}
        onSave={onSaveSettings}
        dashboards={dashboards}
        widgets={widgets}
        commands={commands}
        alertHistoryRefreshKey={alertHistoryRefreshKey}
        onImport={onImportConfig}
      />
      <WidgetEditorModal
        isOpen={isWidgetEditorOpen}
        onClose={closeWidgetEditor}
        initialData={editingWidget}
        onSave={onSaveWidget}
        availableEqLogics={eqLogics}
        dashboardId={activeDashboardId}
        settings={settings}
      />
      <DashboardModal
        isOpen={isDashboardModalOpen}
        onClose={closeDashboardModal}
        initialData={editingDashboard}
        onSave={onSaveDashboard}
      />
      <ConfirmationModal
        isOpen={!!deleteWidgetId}
        onConfirm={confirmDeleteWidget}
        onClose={cancelDeleteWidget}
        title="Supprimer le widget"
        message={`Êtes-vous sûr de vouloir supprimer le widget "${widgetToDelete?.name}" ?`}
      />
      <ConfirmationModal
        isOpen={!!deleteDashboardId}
        onConfirm={confirmDeleteDashboard}
        onClose={cancelDeleteDashboard}
        title="Supprimer le dashboard"
        message={`Supprimer "${dashboardToDelete?.name}" et tous ses widgets ?`}
        confirmLabel="Supprimer"
      />
      <HelpModal isOpen={isHelpModalOpen} onClose={closeHelpModal} />
      <ContactModal isOpen={isContactModalOpen} onClose={closeContactModal} />
      <ScenarioModal
        isOpen={isScenarioModalOpen}
        onClose={closeScenarioModal}
        settings={settings}
      />
      <ScenarioDetailsModal
        isOpen={isScenarioDetailsOpen}
        onClose={closeScenarioDetails}
        scenario={selectedScenario}
        settings={settings}
        onUpdate={() => {}}
      />
      <ConfirmationModal
        isOpen={isResetConfirmationOpen}
        onConfirm={performResetConfig}
        onClose={closeResetConfirmation}
        title="Réinitialiser la configuration"
        message="Toute votre configuration locale (widgets, dashboards) sera perdue. Les données sur votre Jeedom ne seront pas affectées. Continuer ?"
        confirmLabel="Réinitialiser"
      />
      <ReleaseNotesModal isOpen={isReleaseNotesOpen} onClose={closeReleaseNotes} />
    </Suspense>
  );
};

export default Modals;
