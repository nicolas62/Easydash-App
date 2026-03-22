import { useState, useEffect } from 'react';
import { jeedomWs } from '../services/jeedomWs';

export const useJeedomCommand = (cmdId: string | undefined, initialValue: string | number | undefined) => {
    const [value, setValue] = useState<string | number | undefined>(initialValue);

    useEffect(() => {
        if (!cmdId) return;

        const handleUpdate = (newValue: any) => {
            setValue(newValue);
        };

        // Subscribe
        jeedomWs.subscribe(cmdId, handleUpdate);

        // Cleanup
        return () => {
            jeedomWs.unsubscribe(cmdId, handleUpdate);
        };
    }, [cmdId]);

    // Update local state if initialValue changes (e.g. from polling)
    useEffect(() => {
        if (initialValue !== undefined) {
            setValue(initialValue);
        }
    }, [initialValue]);

    return value;
};
