import React, { RefObject } from 'react';
import { RefreshCw, LayoutDashboard, Layers, Edit3, Plus, Settings, Star } from 'lucide-react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { WidgetConfig, Dashboard } from '../../types';
import SortableWidget from '../SortableWidget';
import { ICONS } from '../../constants';
import WidgetCard from '../WidgetCard';
import { JeedomCommand } from '../../types';

interface MainContentProps {
  mainRef: RefObject<HTMLElement>;
  pullChange: number;
  isLoading: boolean;
  activeDashboard?: Dashboard;
  currentWidgets: WidgetConfig[];
  commands: JeedomCommand[];
  scenarios: any[];
  settings: any;
  onScenarioClick: (scenarioId: string) => void;
  isEditMode: boolean;
  onAddWidget?: () => void;
  sensors: any;
  handleDragEnd: (event: DragEndEvent) => void;
  onEditWidget: (widget: WidgetConfig) => void;
  onDeleteWidget: (id: string) => void;
  isConfigured: boolean;
  handleTouchStart: (e: React.TouchEvent) => void;
  handleTouchMove: (e: React.TouchEvent) => void;
  handleTouchEnd: (e: React.TouchEvent) => void;
}

const MainContent: React.FC<MainContentProps> = ({
  mainRef,
  pullChange,
  isLoading,
  activeDashboard,
  currentWidgets,
  commands,
  scenarios,
  settings,
  onScenarioClick,
  isEditMode,
  onAddWidget,
  sensors,
  handleDragEnd,
  onEditWidget,
  onDeleteWidget,
  isConfigured,
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
}) => {
  const isHomeDashboard = activeDashboard?.id === 'default';

  return (
    <main
      ref={mainRef}
      className="flex-1 overflow-y-auto scroll-smooth relative overscroll-contain bg-cover bg-center bg-no-repeat bg-fixed transition-all duration-500"
      style={{
        backgroundImage: activeDashboard?.backgroundImage ? `url(${activeDashboard.backgroundImage})` : undefined,
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {activeDashboard?.backgroundImage && (
        <div className="absolute inset-0 bg-dark-bg/70 backdrop-blur-sm z-0 pointer-events-none transition-opacity duration-500" />
      )}

      <div
        className="absolute left-0 right-0 flex justify-center pointer-events-none transition-transform duration-200 z-10"
        style={{
          top: '20px',
          transform: `translateY(${pullChange - 60}px)`,
          opacity: pullChange > 10 ? 1 : 0,
        }}
      >
        <div className={`bg-dark-surface p-2 rounded-full shadow-lg border border-border flex items-center justify-center transition-colors ${pullChange > 70 ? 'text-jeedom-500 border-jeedom-500' : 'text-content-secondary'}`}>
          <RefreshCw size={20} className={`${isLoading && pullChange > 0 ? 'animate-spin' : ''} transition-transform`} style={{ transform: `rotate(${pullChange * 3}deg)` }} />
        </div>
      </div>

      <div
        className="p-4 sm:p-6 pb-24 min-h-full flex flex-col relative z-10"
        style={{ transform: `translateY(${Math.max(0, pullChange * 0.5)}px)`, transition: 'transform 0.1s ease-out' }}
      >
        <div className="mb-4">
          <div className="md:hidden flex items-center justify-between">
            <h2 className="text-2xl font-bold text-content-primary flex items-center gap-2">
              {activeDashboard && ICONS[activeDashboard.icon] && React.createElement(ICONS[activeDashboard.icon], { size: 24, className: 'text-jeedom-500' })}
              {activeDashboard?.name}
            </h2>
          </div>
        </div>

        {currentWidgets.length === 0 && !isLoading && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 animate-in fade-in zoom-in duration-500 w-full max-w-5xl mx-auto">
            {isHomeDashboard ? (
              <div className="w-full space-y-10 py-8">
                <div className="text-center space-y-4">
                  <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-jeedom-500 to-blue-600 bg-clip-text text-transparent">
                    Découvrez EasyDash
                  </h2>
                  <div className="max-w-xl mx-auto bg-jeedom-500/10 border border-jeedom-500/20 rounded-lg p-3 text-xs text-jeedom-600">
                    <p>EasyDash est une application indépendante développée par nos soins et n'est pas affiliée, soutenue ou sponsorisée par la société JEEDOM SAS.</p>
                  </div>
                  <p className="text-content-secondary text-lg max-w-2xl mx-auto leading-relaxed">
                    Une interface fluide pour piloter votre domotique Jeedom. <br className="hidden md:block" />
                    Créez des tableaux de bord sur mesure en quelques clics.
                  </p>
                </div>
                <div className="grid md:grid-cols-3 gap-6 text-left">
                  <div className="bg-dark-card border border-border p-6 rounded-2xl relative overflow-hidden group hover:border-jeedom-500/50 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><LayoutDashboard size={80} /></div>
                    <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center mb-4"><LayoutDashboard size={24} /></div>
                    <h3 className="text-lg font-bold text-content-primary mb-2">Dashboards Illimités</h3>
                    <p className="text-sm text-content-secondary">
                      Organisez votre maison par pièces (Salon, Cuisine...) via le menu. La page <span className="text-amber-400 font-medium"><Star size={10} className="inline"/> Favoris</span> regroupe vos widgets préférés.
                    </p>
                  </div>
                  <div className="bg-dark-card border border-border p-6 rounded-2xl relative overflow-hidden group hover:border-jeedom-500/50 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Layers size={80} /></div>
                    <div className="w-12 h-12 bg-jeedom-500/20 text-jeedom-500 rounded-xl flex items-center justify-center mb-4"><Plus size={24} /></div>
                    <h3 className="text-lg font-bold text-content-primary mb-2">Widgets Intelligents</h3>
                    <p className="text-sm text-content-secondary">Créez des boutons simples, des interrupteurs ou des <strong>cycles d'actions</strong> complexes (séquences multi-étapes).</p>
                  </div>
                  <div className="bg-dark-card border border-border p-6 rounded-2xl relative overflow-hidden group hover:border-jeedom-500/50 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Edit3 size={80} /></div>
                    <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center mb-4"><Edit3 size={24} /></div>
                    <h3 className="text-lg font-bold text-content-primary mb-2">Mode Édition</h3>
                    <p className="text-sm text-content-secondary">
                      Cliquez sur le crayon <Edit3 size={12} className="inline mx-1"/> en haut à droite pour déplacer, redimensionner ou supprimer vos widgets à tout moment.
                    </p>
                  </div>
                </div>
                {!isConfigured && (
                  <div className="bg-jeedom-500/10 border border-jeedom-500/20 rounded-2xl p-6 text-center animate-in fade-in slide-in-from-bottom-4 delay-100">
                    <h3 className="text-lg font-bold text-jeedom-500 mb-2 flex items-center justify-center gap-2"><Settings size={20} /> Connectez votre Jeedom</h3>
                  </div>
                )}
              </div>
            ) : (
              <>
                <LayoutDashboard size={48} className="text-content-tertiary mb-4" />
                <h3 className="text-xl font-bold text-content-primary">Dashboard Vide</h3>
                <p className="text-content-secondary max-w-sm">
                  Cliquez sur le bouton <Edit3 size={12} className="inline mx-1"/> en haut à droite pour ajouter votre premier widget.
                </p>
              </>
            )}
          </div>
        )}

        {currentWidgets.length > 0 && (
          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <SortableContext items={currentWidgets.map(w => w.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {currentWidgets.map(widget => (
                  <SortableWidget key={widget.id} id={widget.id} size={widget.size || "small"} isEditMode={isEditMode}>
                    <WidgetCard
                      widget={widget}
                      commands={commands}
                      scenarios={scenarios}
                      settings={settings}
                      editMode={isEditMode}
                      onEdit={() => onEditWidget(widget)}
                      onDelete={() => onDeleteWidget(widget.id)}
                      onScenarioClick={onScenarioClick}
                    />
                  </SortableWidget>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* FAB — Ajouter un widget (visible uniquement en mode édition) */}
      {isEditMode && onAddWidget && (
        <button
          onClick={onAddWidget}
          className="absolute bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-jeedom-500 hover:bg-jeedom-400 text-white rounded-full shadow-lg shadow-jeedom-500/30 hover:scale-105 active:scale-95 transition-all animate-in zoom-in duration-200"
          title="Ajouter un widget"
        >
          <Plus size={18} />
          <span className="text-sm font-medium">Widget</span>
        </button>
      )}
    </main>
  );
};

export default MainContent;
