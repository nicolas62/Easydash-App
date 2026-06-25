import { useState, useEffect, useCallback, useRef } from 'react';
import { AppSettings } from '../types';
import { fetchVariableValue, setVariableValue } from '../services/jeedomService';

interface VariableWidgetState {
    value: string | null;
    loading: boolean;
    error: boolean;
    writeValue: (newVal: string) => Promise<void>;
}

export function useVariableWidget(
    settings: AppSettings,
    variableName: string | undefined,
    pollInterval = 60,
): VariableWidgetState {
    const [value, setValue] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const fetch = useCallback(async () => {
        if (!variableName) {
            setLoading(false);
            return;
        }
        try {
            const v = await fetchVariableValue(settings, variableName);
            setValue(v);
            setError(false);
        } catch {
            setError(true);
        } finally {
            setLoading(false);
        }
    }, [settings, variableName]);

    // Initial fetch + polling
    useEffect(() => {
        setLoading(true);
        fetch();
        if (!variableName) return;
        const id = setInterval(fetch, Math.max(10, pollInterval) * 1000);
        return () => clearInterval(id);
    }, [fetch, variableName, pollInterval]);

    const writing = useRef(false);
    const writeValue = useCallback(async (newVal: string) => {
        if (!variableName || writing.current) return;
        writing.current = true;
        const prev = value;
        setValue(newVal); // optimistic
        const ok = await setVariableValue(settings, variableName, newVal);
        if (!ok) setValue(prev);
        writing.current = false;
    }, [settings, variableName, value]);

    return { value, loading, error, writeValue };
}
