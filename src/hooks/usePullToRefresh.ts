import { useState, useRef, RefObject } from 'react';

export function usePullToRefresh(mainRef: RefObject<HTMLElement>, onRefresh: () => Promise<void>) {
  const [pullChange, setPullChange] = useState(0);
  const touchStartRef = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (mainRef.current && mainRef.current.scrollTop <= 0) {
      touchStartRef.current = e.targetTouches[0].clientY;
    } else {
      touchStartRef.current = 0;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartRef.current > 0) {
      const diff = e.targetTouches[0].clientY - touchStartRef.current;
      if (diff > 0) {
        setPullChange(Math.min(diff * 0.4, 150));
      } else {
        setPullChange(0);
      }
    }
  };

  const handleTouchEnd = async () => {
    if (touchStartRef.current > 0 && pullChange > 70) {
      setPullChange(60);
      await onRefresh();
      setPullChange(0);
      touchStartRef.current = 0;
      return;
    }
    setPullChange(0);
    touchStartRef.current = 0;
  };

  return { pullChange, handleTouchStart, handleTouchMove, handleTouchEnd };
}
