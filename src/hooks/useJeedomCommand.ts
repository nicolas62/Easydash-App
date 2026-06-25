import { useState, useEffect, useRef } from 'react';
import { jeedomWs } from '../services/jeedomWs';

interface CommandState {
    value: string | number | undefined;
    updateTime: number | undefined;
}

export const useJeedomCommand = (
    cmdId: string | undefined,
    initialValue: string | number | undefined,
    initialCollectDate?: string,
) => {
    const initialTime = initialCollectDate
        ? (Date.parse(initialCollectDate) || Date.now())
        : (initialValue !== undefined ? Date.now() : undefined);

    const [state, setState] = useState<CommandState>({
        value: initialValue,
        updateTime: initialTime,
    });

    // Track latest initialValue to detect polling refreshes
    const prevInitialValue = useRef(initialValue);

    useEffect(() => {
        if (!cmdId) return;

        const handleUpdate = (newValue: any) => {
            setState({ value: newValue, updateTime: Date.now() });
        };

        jeedomWs.subscribe(cmdId, handleUpdate);
        return () => { jeedomWs.unsubscribe(cmdId, handleUpdate); };
    }, [cmdId]);

    // Update when initialValue changes (polling refresh)
    useEffect(() => {
        if (initialValue !== undefined && initialValue !== prevInitialValue.current) {
            prevInitialValue.current = initialValue;
            const t = initialCollectDate
                ? (Date.parse(initialCollectDate) || Date.now())
                : Date.now();
            setState({ value: initialValue, updateTime: t });
        }
    }, [initialValue, initialCollectDate]);

    return state;
};
