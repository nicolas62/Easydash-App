import { useState } from 'react';
import { ToastType } from '../components/Toast';

export function useNotifications() {
    const [notification, setNotification] = useState<{ message: string, type: ToastType } | null>(null);
    return { notification, setNotification };
}
