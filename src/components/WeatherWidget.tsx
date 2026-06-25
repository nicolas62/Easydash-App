import React, { useMemo } from 'react';
import { WidgetConfig } from '../types';
import { useJeedomCommand } from '../hooks/useJeedomCommand';
import { 
    Sun, Cloud, CloudRain, CloudSnow, CloudLightning, CloudDrizzle, 
    Wind, Moon, CloudFog, ThermometerSun, Umbrella 
} from 'lucide-react';

interface WeatherWidgetProps {
    widget: WidgetConfig;
    isColorized: boolean;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ widget, isColorized }) => {
    // --- REAL-TIME DATA ---
    const { value: temp } = useJeedomCommand(widget.tempCmdId, undefined);
    const { value: condition } = useJeedomCommand(widget.conditionCmdId, undefined);
    const { value: min } = useJeedomCommand(widget.minCmdId, undefined);
    const { value: max } = useJeedomCommand(widget.maxCmdId, undefined);

    // --- LOGIC ---
    const getIcon = (cond: string | undefined) => {
        if (!cond) return <Sun size={48} className="text-yellow-400 animate-pulse-slow" />;
        
        const c = String(cond).toLowerCase();
        
        if (c.includes('pluie') || c.includes('rain')) return <CloudRain size={48} className="text-blue-400" />;
        if (c.includes('neige') || c.includes('snow')) return <CloudSnow size={48} className="text-white" />;
        if (c.includes('orage') || c.includes('storm') || c.includes('lightning')) return <CloudLightning size={48} className="text-yellow-600" />;
        if (c.includes('nuage') || c.includes('cloud') || c.includes('couvert')) return <Cloud size={48} className="text-content-secondary" />;
        if (c.includes('brouillard') || c.includes('fog') || c.includes('mist')) return <CloudFog size={48} className="text-content-secondary" />;
        if (c.includes('vent') || c.includes('wind')) return <Wind size={48} className="text-slate-400" />;
        if (c.includes('nuit') || c.includes('night') || c.includes('lune')) return <Moon size={48} className="text-indigo-300" />;
        if (c.includes('soleil') || c.includes('sun') || c.includes('clair') || c.includes('dégagé')) return <Sun size={48} className="text-yellow-400 animate-spin-slow" />;
        
        return <ThermometerSun size={48} className="text-orange-400" />;
    };

    const getBgGradient = (cond: string | undefined) => {
        if (!cond) return 'bg-gradient-to-br from-blue-400 to-blue-600'; // Default Day
        
        const c = String(cond).toLowerCase();
        
        if (c.includes('nuit') || c.includes('night')) return 'bg-gradient-to-br from-indigo-900 to-slate-900';
        if (c.includes('pluie') || c.includes('rain')) return 'bg-gradient-to-br from-slate-600 to-slate-800';
        if (c.includes('orage')) return 'bg-gradient-to-br from-slate-700 to-purple-900';
        if (c.includes('neige')) return 'bg-gradient-to-br from-blue-100 to-blue-300 text-slate-800'; // Light theme for snow
        if (c.includes('nuage')) return 'bg-gradient-to-br from-slate-400 to-slate-600';
        if (c.includes('soleil') || c.includes('sun')) return 'bg-gradient-to-br from-blue-400 to-blue-600'; // Nice blue sky
        
        return 'bg-gradient-to-br from-blue-500 to-cyan-600';
    };

    const bgClass = useMemo(() => getBgGradient(String(condition)), [condition]);
    const Icon = useMemo(() => getIcon(String(condition)), [condition]);
    
    // Text Color Adaptation (for snow theme mostly)
    const isLightBg = String(condition).toLowerCase().includes('neige');
    const textColor = isLightBg ? 'text-slate-800' : 'text-white';
    const secondaryTextColor = isLightBg ? 'text-slate-600' : 'text-white/70';

    return (
        <div className={`relative w-full h-full flex flex-col p-4 overflow-hidden rounded-xl transition-all duration-500 ${bgClass}`}>
            
            {/* Header: Location / Name */}
            <div className={`text-xs font-semibold uppercase tracking-wider mb-2 ${secondaryTextColor}`}>
                {widget.name}
            </div>

            {/* Main Content: Icon + Temp */}
            <div className="flex-1 flex flex-col items-center justify-center gap-2 z-10">
                <div className="drop-shadow-lg transform hover:scale-110 transition-transform duration-300">
                    {Icon}
                </div>
                
                <div className="flex items-start">
                    <span className={`text-5xl font-bold tracking-tighter drop-shadow-sm ${textColor}`}>
                        {temp !== undefined ? Math.round(Number(temp)) : '--'}
                    </span>
                    <span className={`text-2xl font-medium mt-1 ${secondaryTextColor}`}>°</span>
                </div>
                
                <div className={`text-sm font-medium capitalize ${secondaryTextColor}`}>
                    {String(condition || 'Chargement...')}
                </div>
            </div>

            {/* Footer: Min / Max */}
            <div className="flex justify-between items-center mt-auto pt-2 border-t border-content-inverted/10">
                <div className="flex flex-col items-center">
                    <span className={`text-[10px] uppercase opacity-60 ${secondaryTextColor}`}>Min</span>
                    <span className={`text-sm font-semibold ${textColor}`}>{min !== undefined ? Math.round(Number(min)) : '--'}°</span>
                </div>
                
                <div className="h-4 w-px bg-content-inverted/20"></div>

                <div className="flex flex-col items-center">
                    <span className={`text-[10px] uppercase opacity-60 ${secondaryTextColor}`}>Max</span>
                    <span className={`text-sm font-semibold ${textColor}`}>{max !== undefined ? Math.round(Number(max)) : '--'}°</span>
                </div>
            </div>

            {/* Background Effects */}
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-content-inverted/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-24 h-24 bg-dark-bg/10 rounded-full blur-2xl pointer-events-none"></div>
        </div>
    );
};

export default WeatherWidget;
