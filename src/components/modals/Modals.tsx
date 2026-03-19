import React from 'react';
import SettingsModal from '../SettingsModal';
import WidgetEditorModal from '../WidgetEditorModal';
import DashboardModal from '../DashboardModal';
import ConfirmationModal from '../ConfirmationModal';
import HelpModal from '../HelpModal';
import ContactModal from '../ContactModal';
import ScenarioModal from '../ScenarioModal';
import ScenarioDetailsModal from '../ScenarioDetailsModal';
import ReleaseNotesModal from '../ReleaseNotesModal';
import { AppSettings, Dashboard, WidgetConfig, JeedomEqLogic, JeedomCommand, JeedomScenario } from '../../types';

interface ModalsProps {
  isSettingsOpen: boolean;
  closeSettings: () => void;
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  dashboards: Dashboard[];
  widgets: WidgetConfig[];
  onImportConfig: (data: any, mode: 'replace' | 'merge') => void;
  isWidgetEditorOpen: boolean;
  closeWidgetEditor: () => void;
  editingWidget?: WidgetConfig;
  onSaveWidget: (widget: WidgetConfig) => void;
  eqLogics: JeedomEqLogic[];
  commands: JeedomCommand[];
  activeDashboardId: string;
  isDashboardModalOpen: boolean;
  closeDashboardModal: () => void;
  editingDashboard?: Dashboard;
  onSaveDashboard: (dashboard: Dashboard) => void;
  deleteWidgetId: string | null;
  confirmDeleteWidget: () => void;
  cancelDeleteWidget: () => void;
  widgetToDelete?: WidgetConfig;
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
  onImportConfig,
  isWidgetEditorOpen,
  closeWidgetEditor,
  editingWidget,
  onSaveWidget,
  eqLogics,
  commands,
  activeDashboardId,
  isDashboardModalOpen,
  closeDashboardModal,
  editingDashboard,
  onSaveDashboard,
  deleteWidgetId,
  confirmDeleteWidget,
  cancelDeleteWidget,
  widgetToDelete,
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
    <>
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={closeSettings}
        settings={settings}
        onSave={onSaveSettings}
        dashboards={dashboards}
        widgets={widgets}
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
        dashboard={editingDashboard}
        onSave={onSaveDashboard}
      />
      <ConfirmationModal
        isOpen={!!deleteWidgetId}
        onConfirm={confirmDeleteWidget}
        onCancel={cancelDeleteWidget}
        title="Supprimer le widget"
        message={`Êtes-vous sûr de vouloir supprimer le widget "${widgetToDelete?.name}" ?`}
      />
      <HelpModal isOpen={isHelpModalOpen} onClose={closeHelpModal} />
      <ContactModal isOpen={isContactModalOpen} onClose={closeContactModal} />
      <ScenarioModal
        isOpen={isScenarioModalOpen}
        onClose={closeScenarioModal}
        scenarios={scenarios}
        onScenarioClick={onScenarioClick}
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
        onCancel={closeResetConfirmation}
        title="Réinitialiser la configuration"
        message="Toute votre configuration locale (widgets, dashboards) sera perdue. Les données sur votre Jeedom ne seront pas affectées. Continuer ?"
        confirmText="Réinitialiser"
        isDestructive
      />
      <ReleaseNotesModal isOpen={isReleaseNotesOpen} onClose={closeReleaseNotes} />
    </>
  );
};

export default Modals;
