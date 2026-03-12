import { useState, useEffect, useRef } from 'react';

export function useMainMenu() {
  const [isMainMenuOpen, setIsMainMenuOpen] = useState(false);
  const [isMainMenuPopping, setIsMainMenuPopping] = useState(false);
  const mainMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mainMenuRef.current && !mainMenuRef.current.contains(event.target as Node)) {
        setIsMainMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMainMenu = () => {
    setIsMainMenuPopping(true);
    setTimeout(() => setIsMainMenuPopping(false), 300);
    setIsMainMenuOpen(!isMainMenuOpen);
  };

  return { isMainMenuOpen, isMainMenuPopping, mainMenuRef, toggleMainMenu, setIsMainMenuOpen };
}
