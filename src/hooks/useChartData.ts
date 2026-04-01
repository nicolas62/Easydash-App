import { useState, useEffect } from 'react';
import { AppSettings, WidgetConfig } from '../types';
import { getJeedomHistory } from '../services/jeedomService';
import { cacheService } from '../services/cacheService';

const aggregateChartData = (data: { time: number; value: number }[], method: string = 'none') => {
    if (!data || data.length === 0) return [];
    if (method === 'none') return data;

    const grouped: { [key: string]: number[] } = {};
    data.forEach(item => {
        const date = new Date(item.time).toISOString().split('T')[0];
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(item.value);
    });

    return Object.keys(grouped).sort().map(date => {
        const values = grouped[date];
        let aggregatedValue = 0;
        if (method === 'daily_avg') aggregatedValue = values.reduce((a, b) => a + b, 0) / values.length;
        else if (method === 'daily_max') aggregatedValue = Math.max(...values);
        else if (method === 'daily_sum') aggregatedValue = values.reduce((a, b) => a + b, 0);
        return { time: new Date(date + 'T12:00:00').getTime(), value: parseFloat(aggregatedValue.toFixed(2)) };
    });
};

const CACHE_TTL: Record<string, number> = {
    '24h':    15 * 60 * 1000,
    '7d':      2 * 60 * 60 * 1000,
    '30d':     6 * 60 * 60 * 1000,
    'custom': 30 * 60 * 1000,
};

export function useChartData(widget: WidgetConfig, settings: AppSettings, isChart: boolean) {
    const [chartData, setChartData] = useState<{ time: number; value: number }[]>([]);
    const [chartError, setChartError] = useState<string | null>(null);
    const [chartPeriod, setChartPeriod] = useState<string>(widget.historyPeriod || '24h');
    const [customStart, setCustomStart] = useState(widget.chartCustomStart || '');
    const [customEnd, setCustomEnd] = useState(widget.chartCustomEnd || '');

    useEffect(() => {
        if (!isChart || !widget.commandId) return;
        if (chartPeriod === 'custom' && (!customStart || !customEnd)) return;

        const fetchHistory = async () => {
            const formatDate = (d: Date) => d.toISOString().slice(0, 19).replace('T', ' ');
            let start: Date, end: Date;

            if (chartPeriod === 'custom') {
                start = new Date(customStart + 'T00:00:00');
                end   = new Date(customEnd   + 'T23:59:59');
            } else {
                end   = new Date();
                start = new Date();
                if (chartPeriod === '7d')       start.setDate(end.getDate() - 7);
                else if (chartPeriod === '30d') start.setDate(end.getDate() - 30);
                else                            start.setDate(end.getDate() - 1);
            }

            const cacheKey = `chart_${widget.commandId}_${chartPeriod}_${customStart}_${customEnd}_${widget.chartAggregation || 'none'}`;
            const cachedData = cacheService.get<{ time: number; value: number }[]>(cacheKey, CACHE_TTL[chartPeriod] ?? CACHE_TTL['24h']);
            if (cachedData) { setChartData(cachedData); return; }

            try {
                const data = await getJeedomHistory(settings, widget.commandId!, formatDate(start), formatDate(end));
                const rawData = data.map((item: any) => ({
                    time:  new Date(item.datetime).getTime(),
                    value: parseFloat(item.value),
                })).filter((p: { time: number; value: number }) => !isNaN(p.value));

                const aggregated = aggregateChartData(rawData, widget.chartAggregation || 'none');
                if (aggregated.length > 0) {
                    cacheService.set(cacheKey, aggregated);
                    setChartError(null);
                } else {
                    setChartError('Aucune donnée historique. Vérifiez que la commande est historisée dans Jeedom.');
                }
                setChartData(aggregated);
            } catch (e: any) {
                console.error('Failed to load chart data', e);
                setChartError(e?.message?.includes('CORS') || e?.message?.includes('fetch')
                    ? 'Erreur réseau — activez le Mode Proxy dans les paramètres.'
                    : 'Erreur lors du chargement des données.');
            }
        };

        fetchHistory();
    }, [isChart, widget.commandId, chartPeriod, customStart, customEnd, widget.chartAggregation, settings]);

    return { chartData, chartError, chartPeriod, setChartPeriod, customStart, customEnd, setCustomStart, setCustomEnd };
}
