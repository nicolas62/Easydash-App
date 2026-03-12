import { useState } from 'react';
import { WidgetConfig, WidgetCategory, JeedomScenario, Dashboard } from '../types';
import { ICONS } from '../constants';
import React from 'react';
import {
    Settings,
    Plus,
    LayoutDashboard,
    Edit3,
    XCircle,
    RefreshCw,
    Trash2,
    RotateCw,
    RotateCcw,
    HelpCircle,
    BookOpen,
    Menu,
    Mail,
    Workflow,
    Star,
    Layers,
  } from 'lucide-react';

export function useUI(loadAvailableData: () => void, dashboards: Dashboard[], activeDashboardId: string, setActiveDashboardId: (id: string) => void, setDashboards: (d: Dashboard[]) => void) {
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
  const [deleteWidgetId, setDeleteWidgetId] = useState<string | null>(null);
  const [editingWidget, setEditingWidget] = useState<WidgetConfig | undefined>(undefined);
  const [isReleaseNotesOpen, setIsReleaseNotesOpen] = useState(false);

  const handleAddWidget = () => {
    if (activeDashboardId === 'default' || activeDashboardId === 'favorites') {
      const otherDash = dashboards.find(d => d.id !== 'default' && d.id !== 'favorites');
      if (otherDash) {
        setActiveDashboardId(otherDash.id);
      } else {
        const newDash: Dashboard = {
          id: crypto.randomUUID(),
          name: 'Mon Espace',
          icon: 'layout-grid'
        };
        setDashboards(prev => [...prev, newDash]);
        setActiveDashboardId(newDash.id);
      }
    }
    setEditingWidget(undefined);
    loadAvailableData();
    setIsWidgetEditorOpen(true);
  };

  const handleEditWidget = (widget: WidgetConfig) => {
    setEditingWidget(widget);
    loadAvailableData();
    setIsWidgetEditorOpen(true);
  };

  const handleDeleteWidgetClick = (id: string) => {
    setDeleteWidgetId(id);
  };

  const confirmDeleteWidget = (callback: () => void) => {
    callback();
    setDeleteWidgetId(null);
  };
  
  const handleAddDashboard = () => { 
    setIsDashboardModalOpen(true); 
  };
  
  const handleEditDashboard = (dashboard: Dashboard) => {
    setIsDashboardModalOpen(true); 
  };

  const handleScenarioClick = (scenario: JeedomScenario) => {
    setSelectedScenario(scenario);
    setIsScenarioDetailsOpen(true);
  };

  return {
    activeFilter,
    setActiveFilter,
    isSettingsOpen,
    setIsSettingsOpen,
    isEditMode,
    setIsEditMode,
    isWidgetEditorOpen,
    setIsWidgetEditorOpen,
    isDashboardModalOpen,
    setIsDashboardModalOpen,
    isHelpModalOpen,
    setIsHelpModalOpen,
    isContactModalOpen,
    setIsContactModalOpen,
    isScenarioModalOpen,
    setIsScenarioModalOpen,
    isScenarioDetailsOpen,
    setIsScenarioDetailsOpen,
    selectedScenario,
    setSelectedScenario,
    isResetConfirmationOpen,
    setIsResetConfirmationOpen,
    deleteWidgetId,
    setDeleteWidgetId,
    editingWidget,
    setEditingWidget,
    handleAddWidget,
    handleEditWidget,
    handleDeleteWidgetClick,
    confirmDeleteWidget,
    handleAddDashboard,
    handleEditDashboard,
    handleScenarioClick,
    isReleaseNotesOpen,
    setIsReleaseNotesOpen
  };
}
