import React from 'react';
import { Settings, Edit3, Menu, Workflow, BookOpen, Mail, RotateCcw, Lock } from 'lucide-react';
import { useMainMenu } from '../../hooks/useMainMenu';
import { APP_VERSION } from '../../constants';

interface HeaderProps {
  isEditMode: boolean;
  toggleEditMode: () => void;
  openSettings: () => void;
  openScenarios: () => void;
  openHelp: () => void;
  openContact: () => void;
  openResetConfirmation: () => void;
  openReleaseNotes: () => void;
  useDemoMode: boolean;
  isAdminUnlocked?: boolean;
  hasPinProtection?: boolean;
  onLock?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  isEditMode,
  toggleEditMode,
  openSettings,
  openScenarios,
  openHelp,
  openContact,
  openResetConfirmation,
  openReleaseNotes,
  useDemoMode,
  isAdminUnlocked,
  hasPinProtection,
  onLock,
}) => {
  const { isMainMenuOpen, isMainMenuPopping, mainMenuRef, toggleMainMenu, setIsMainMenuOpen } = useMainMenu();

  return (
    <header className="fixed top-0 left-0 right-0 bg-dark-surface/80 backdrop-blur-md border-b border-border h-16 px-4 flex items-center justify-between z-50 transition-colors duration-300">
      <div className="relative" ref={mainMenuRef}>
        <button
          onClick={toggleMainMenu}
          title="Menu Principal"
          className="flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-jeedom-500 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-surface rounded-lg group"
        >
          <div className={`w-8 h-8 rounded-lg overflow-hidden shadow-lg shadow-jeedom-900/50 transition-transform duration-200 ${isMainMenuPopping ? 'animate-pop' : (isMainMenuOpen ? 'scale-90 rotate-3' : 'group-hover:animate-bounce-subtle')}`}>
            <img src="/logo.png" alt="EasyDash" className="w-full h-full object-cover" />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-bold text-lg tracking-tight text-content-primary">EasyDash</h1>
          </div>
          <div className="sm:hidden text-content-secondary">
            <Menu size={16} />
          </div>
        </button>

        {isMainMenuOpen && (
          <div className="absolute top-full left-0 mt-3 w-56 bg-dark-surface border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
            <div className="p-1">
              <button
                onClick={() => { openScenarios(); setIsMainMenuOpen(false); }}
                className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-input-bg flex items-center gap-3 text-sm font-medium text-content-primary transition-colors"
              >
                <Workflow size={18} className="text-jeedom-500" />
                Scénarios
              </button>
              <div className="h-px bg-border my-1 mx-2"></div>
              <button
                onClick={() => { openHelp(); setIsMainMenuOpen(false); }}
                className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-input-bg flex items-center gap-3 text-sm font-medium text-content-primary transition-colors"
              >
                <BookOpen size={18} className="text-jeedom-500" />
                Aide & Documentation
              </button>
              <button
                onClick={() => { openContact(); setIsMainMenuOpen(false); }}
                className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-input-bg flex items-center gap-3 text-sm font-medium text-content-primary transition-colors"
              >
                <Mail size={18} className="text-jeedom-500" />
                Contact / Support
              </button>
              <div className="h-px bg-border my-1 mx-2"></div>
              <button
                onClick={() => { openSettings(); setIsMainMenuOpen(false); }}
                className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-input-bg flex items-center gap-3 text-sm font-medium text-content-primary transition-colors"
              >
                <Settings size={18} className="text-content-secondary" />
                Paramètres
              </button>
              <button
                onClick={() => { openResetConfirmation(); setIsMainMenuOpen(false); }}
                className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-red-500/10 flex items-center gap-3 text-sm font-medium text-red-400 transition-colors"
              >
                <RotateCcw size={18} />
                Réinitialiser
              </button>
              <div className="h-px bg-border my-1 mx-2"></div>
              <div className="px-3 py-2 text-center">
                <button
                  onClick={() => { openReleaseNotes(); setIsMainMenuOpen(false); }}
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

      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-content-secondary mr-2 hidden sm:flex items-center gap-2">
          {useDemoMode ? <span className="bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded border border-orange-500/30">DÉMO</span> : null}
        </span>

        {hasPinProtection && isAdminUnlocked && onLock && (
          <button
            onClick={onLock}
            className="p-2 text-orange-400 hover:bg-orange-500/10 rounded-full transition-colors"
            title="Re-verrouiller l'accès admin"
          >
            <Lock size={20} />
          </button>
        )}

        <button
          onClick={toggleEditMode}
          className={`p-2 rounded-full transition-colors ${isEditMode ? 'bg-jeedom-600 text-white shadow-lg shadow-jeedom-500/30' : 'text-content-secondary hover:bg-input-bg'}`}
          title="Mode Édition"
        >
          <Edit3 size={20} />
        </button>

        <button
          onClick={openSettings}
          className="p-2 text-content-secondary hover:bg-input-bg rounded-full transition-colors hidden sm:block"
          title="Paramètres"
        >
          <Settings size={20} />
        </button>
      </div>
    </header>
  );
};

export default Header;
