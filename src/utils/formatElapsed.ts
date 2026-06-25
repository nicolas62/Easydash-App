export function formatElapsed(ts: number | undefined): string | null {
    if (ts === undefined || ts === 0) return null;
    const diff = Date.now() - ts;
    if (diff < 0) return null;
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return 'à l\'instant';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `il y a ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `il y a ${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `il y a ${days}j`;
    return new Date(ts).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}
