import { useRef } from 'react';
import { Dashboard } from '../types';

export function useSwipe(dashboards: Dashboard[], activeDashboardId: string, setActiveDashboardId: (id: string) => void) {
    const touchStartXRef = useRef<number>(0);
    const touchStartYRef = useRef<number>(0);

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartXRef.current = e.targetTouches[0].clientX;
        touchStartYRef.current = e.targetTouches[0].clientY;
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const diffX = endX - touchStartXRef.current;
        const diffY = endY - touchStartYRef.current;

        if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY)) {
            const currentIndex = dashboards.findIndex(d => d.id === activeDashboardId);
            if (currentIndex === -1) return;

            if (diffX > 0) {
                if (currentIndex > 0) {
                    setActiveDashboardId(dashboards[currentIndex - 1].id);
                }
            } else {
                if (currentIndex < dashboards.length - 1) {
                    setActiveDashboardId(dashboards[currentIndex + 1].id);
                }
            }
        }
    };

    return { handleTouchStart, handleTouchEnd };
}
