import { useState, useEffect } from 'react';
import { formatElapsed } from '../utils/formatElapsed';

export function useElapsedTime(ts: number | undefined): string | null {
    const [elapsed, setElapsed] = useState<string | null>(() => formatElapsed(ts));

    useEffect(() => {
        setElapsed(formatElapsed(ts));
        if (ts === undefined || ts === 0) return;
        const id = setInterval(() => setElapsed(formatElapsed(ts)), 60_000);
        return () => clearInterval(id);
    }, [ts]);

    return elapsed;
}
