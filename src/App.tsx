import React, { useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';

import { useSettings } from './hooks/useSettings';
import { useDashboards } from './hooks/useDashboards';
import { useJeedomData } from './hooks/useJeedomData';
import { useUI } from './hooks/useUI';
import { usePullToRefresh } from './hooks/usePullToRefresh';
import { useDnd } from './hooks/useDnd';
import { usePolling } from './hooks/usePolling';
import { useSwipe } from './hooks/useSwipe';
import { useWebSocket } from './hooks/useWebSocket';
import { useNotifications } from './hooks/useNotifications';

import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import MainContent from './components/layout/MainContent';
import MobileNav from './components/layout/MobileNav';
import Modals from './components/modals/Modals';

import LandingPage from './components/LandingPage';
import PrivacyPolicyPage from './components/PrivacyPolicyPage';
import CookieBanner from './components/CookieBanner';
import RouteTracker from './components/RouteTracker';
import Toast from './components/Toast';
import SEO from './components/SEO';
import { useConnectionStatus } from './hooks/useConnectionStatus';

const App: React.FC = () => {
  const location = useLocation();

  if (location.pathname === '/privacy') {
    return (
      <>
        <RouteTracker />
        <PrivacyPolicyPage />
        <CookieBanner />
      </>
    );
  }

  const { notification, setNotification } = useNotifications();
  const { settings, setSettings, isSettingsLoaded, performResetConfig, handleImportConfig: importSettings } = useSettings();
  
  const { 
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
    handleImportConfig: importDashboards
  } = useDashboards();

  const { eqLogics, commands, scenarios, isLoading, loadAvailableData, refreshWidgetValues, updateCommandValues } = useJeedomData(settings, isSettingsLoaded, widgets, setNotification);
  
  const {
    isSettingsOpen, setIsSettingsOpen,
    isEditMode, setIsEditMode,
    isWidgetEditorOpen, setIsWidgetEditorOpen,
    isDashboardModalOpen, setIsDashboardModalOpen,
    isHelpModalOpen, setIsHelpModalOpen,
    isContactModalOpen, setIsContactModalOpen,
    isScenarioModalOpen, setIsScenarioModalOpen,
    isScenarioDetailsOpen, setIsScenarioDetailsOpen,
    selectedScenario,
    isResetConfirmationOpen, setIsResetConfirmationOpen,
    deleteWidgetId,
    deleteDashboardId,
    editingWidget,
    handleAddWidget, handleEditWidget, handleDeleteWidgetClick, confirmDeleteWidget,
    handleDeleteDashboardClick, cancelDeleteDashboard,
    handleAddDashboard, handleEditDashboard, handleScenarioClick,
    isReleaseNotesOpen, setIsReleaseNotesOpen
  } = useUI(loadAvailableData, dashboards, activeDashboardId, setActiveDashboardId, setDashboards);
  
  const mainRef = useRef<HTMLElement>(null);
  const { pullChange, handleTouchStart: handlePullToRefreshTouchStart, handleTouchMove, handleTouchEnd: handlePullToRefreshTouchEnd } = usePullToRefresh(mainRef, () => refreshWidgetValues(widgets));
  
  const { handleTouchStart: handleSwipeTouchStart, handleTouchEnd: handleSwipeTouchEnd } = useSwipe(dashboards, activeDashboardId, setActiveDashboardId);
  
  const { sensors, handleDragEnd } = useDnd(setWidgets);
  
  usePolling(settings, isSettingsLoaded, refreshWidgetValues, widgets, activeDashboardId);
  useWebSocket(settings, isSettingsLoaded, updateCommandValues);
  
  const handleTouchStart = (e: React.TouchEvent) => {
    handlePullToRefreshTouchStart(e);
    handleSwipeTouchStart(e);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    handlePullToRefreshTouchEnd();
    handleSwipeTouchEnd(e);
  };
  const currentWidgetsMemo = useMemo(() => widgets.filter(w => {
    if (activeDashboardId === "default") return w.isFavorite;
    return w.dashboardId === activeDashboardId;
  }), [widgets, activeDashboardId]);

  const activeDashboard = useMemo(() => dashboards.find(d => d.id === activeDashboardId), [dashboards, activeDashboardId]);
  const widgetToDelete = useMemo(() => widgets.find(w => w.id === deleteWidgetId), [widgets, deleteWidgetId]);
  const dashboardToDelete = useMemo(() => dashboards.find(d => d.id === deleteDashboardId), [dashboards, deleteDashboardId]);


  if (!isSettingsLoaded) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center text-jeedom-500">
        <RefreshCw className="animate-spin" size={32} />
      </div>
    );
  }

  const isConfigured = settings.useDemoMode || !!(settings.jeedomUrl && settings.apiKey);

  if (!isConfigured) {
    return (
      <>
        <LandingPage
          onConnect={() => setIsSettingsOpen(true)}
          onDemo={() => setSettings({ ...settings, useDemoMode: true })}
        />
      </>
    );
  }


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

      <CookieBanner />

      <Header
        isEditMode={isEditMode}
        toggleEditMode={() => setIsEditMode(!isEditMode)}
        openSettings={() => setIsSettingsOpen(true)}
        openScenarios={() => setIsScenarioModalOpen(true)}
        openHelp={() => setIsHelpModalOpen(true)}
        openContact={() => setIsContactModalOpen(true)}
        openResetConfirmation={() => setIsResetConfirmationOpen(true)}
        openReleaseNotes={() => setIsReleaseNotesOpen(true)}
        useDemoMode={settings.useDemoMode}
      />

      <div className="flex h-screen pt-16">
        <Sidebar
          dashboards={dashboards}
          activeDashboardId={activeDashboardId}
          setActiveDashboardId={setActiveDashboardId}
          isEditMode={isEditMode}
          onAddDashboard={() => {
            setEditingDashboard(undefined)
            handleAddDashboard()
          }}
          onEditDashboard={(dashboard) => {
            setEditingDashboard(dashboard)
            handleEditDashboard(dashboard)
          }}
          onDeleteDashboard={handleDeleteDashboardClick}
          openScenarios={() => setIsScenarioModalOpen(true)}
          openHelp={() => setIsHelpModalOpen(true)}
          openContact={() => setIsContactModalOpen(true)}
          openReleaseNotes={() => setIsReleaseNotesOpen(true)}
        />

        <div className="flex-1 flex flex-col min-w-0 bg-dark-bg relative transition-colors duration-300">
          <MobileNav
            dashboards={dashboards}
            activeDashboardId={activeDashboardId}
            setActiveDashboardId={setActiveDashboardId}
            isEditMode={isEditMode}
            onAddDashboard={() => {
                setEditingDashboard(undefined)
                handleAddDashboard()
            }}
            onEditDashboard={(dashboard) => {
                setEditingDashboard(dashboard)
                handleEditDashboard(dashboard)
            }}
            onDeleteDashboard={handleDeleteDashboardClick}
          />
          <MainContent
            scenarios={scenarios}
            settings={settings}
            onAddWidget={handleAddWidget}
            onScenarioClick={(scenarioId: string) => {
              const scenario = scenarios.find(s => s.id === scenarioId);
              if (scenario) handleScenarioClick(scenario);
            }}
            mainRef={mainRef}
            pullChange={pullChange}
            isLoading={isLoading}
            activeDashboard={activeDashboard}
            currentWidgets={currentWidgetsMemo}
            commands={commands}
            isEditMode={isEditMode}
            sensors={sensors}
            handleDragEnd={handleDragEnd}
            onEditWidget={handleEditWidget}
            onDeleteWidget={handleDeleteWidgetClick}
            isConfigured={isConfigured}
            handleTouchStart={handleTouchStart}
            handleTouchMove={handleTouchMove}
            handleTouchEnd={handleTouchEnd}
          />
        </div>
      </div>

      <Modals
        isSettingsOpen={isSettingsOpen}
        closeSettings={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={setSettings}
        dashboards={dashboards}
        widgets={widgets}
        onImportConfig={(data, mode) => {
          importDashboards(data, mode);
          importSettings(data);
          setIsSettingsOpen(false);
        }}
        isWidgetEditorOpen={isWidgetEditorOpen}
        closeWidgetEditor={() => setIsWidgetEditorOpen(false)}
        editingWidget={editingWidget}
        onSaveWidget={(widget) => handleSaveWidget(widget, editingWidget)}
        eqLogics={eqLogics}
        commands={commands}
        activeDashboardId={activeDashboardId}
        isDashboardModalOpen={isDashboardModalOpen}
        closeDashboardModal={() => {
            setIsDashboardModalOpen(false)
            setEditingDashboard(undefined)
        }}
        editingDashboard={editingDashboard}
        onSaveDashboard={(dashboard) => {
            handleSaveDashboard(dashboard)
            setIsDashboardModalOpen(false)
        }}
        deleteWidgetId={deleteWidgetId}
        confirmDeleteWidget={() => confirmDeleteWidget(() => setWidgets(widgets.filter(w => w.id !== deleteWidgetId)))}
        cancelDeleteWidget={() => handleDeleteWidgetClick('')}
        widgetToDelete={widgetToDelete}
        deleteDashboardId={deleteDashboardId}
        confirmDeleteDashboard={() => { if (deleteDashboardId) handleDeleteDashboard(deleteDashboardId); cancelDeleteDashboard(); }}
        cancelDeleteDashboard={cancelDeleteDashboard}
        dashboardToDelete={dashboardToDelete}
        isHelpModalOpen={isHelpModalOpen}
        closeHelpModal={() => setIsHelpModalOpen(false)}
        isContactModalOpen={isContactModalOpen}
        closeContactModal={() => setIsContactModalOpen(false)}
        isScenarioModalOpen={isScenarioModalOpen}
        closeScenarioModal={() => setIsScenarioModalOpen(false)}
        scenarios={scenarios}
        onScenarioClick={(scenario) => handleScenarioClick(scenario)}
        isScenarioDetailsOpen={isScenarioDetailsOpen}
        closeScenarioDetails={() => setIsScenarioDetailsOpen(false)}
        selectedScenario={selectedScenario}
        isResetConfirmationOpen={isResetConfirmationOpen}
        closeResetConfirmation={() => setIsResetConfirmationOpen(false)}
        performResetConfig={performResetConfig}
        isReleaseNotesOpen={isReleaseNotesOpen}
        closeReleaseNotes={() => setIsReleaseNotesOpen(false)}
      />
    </div>
  );
};

export default App;
