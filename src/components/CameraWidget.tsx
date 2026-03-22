import React, { useState, useEffect, useRef } from 'react';
import { WidgetConfig, AppSettings } from '../types';
import { Maximize2, Loader2, VideoOff } from 'lucide-react';

interface CameraWidgetProps {
    widget: WidgetConfig;
    settings: AppSettings;
    isColorized: boolean;
}

const CameraWidget: React.FC<CameraWidgetProps> = ({ widget, settings, isColorized }) => {
    const [imageUrl, setImageUrl] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const isSnapshot = (widget.refreshInterval && widget.refreshInterval > 0) || false;

    // Lazy load: only start streaming when the widget is in the viewport
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => setIsVisible(entry.isIntersecting),
            { threshold: 0.1 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isVisible) return;
        if (!widget.streamUrl) {
            setError(true);
            return;
        }

        let intervalId: NodeJS.Timeout;

        const updateUrl = () => {
            let url = widget.streamUrl!;

            if (url.includes('apikey=') === false && settings.apiKey) {
                const separator = url.includes('?') ? '&' : '?';
                url += `${separator}apikey=${settings.apiKey}`;
            }

            if (isSnapshot) {
                const separator = url.includes('?') ? '&' : '?';
                url += `${separator}t=${Date.now()}`;
            }

            setImageUrl(url);
            setIsLoading(true);
        };

        updateUrl();

        if (isSnapshot) {
            intervalId = setInterval(updateUrl, widget.refreshInterval || 5000);
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [isVisible, widget.streamUrl, widget.refreshInterval, settings.apiKey, isSnapshot]);

    const handleImageLoad = () => {
        setIsLoading(false);
        setError(false);
    };

    const handleImageError = () => {
        setIsLoading(false);
        setError(true);
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    useEffect(() => {
        const handleFsChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFsChange);
        return () => document.removeEventListener('fullscreenchange', handleFsChange);
    }, []);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-content-secondary p-4">
                <VideoOff size={32} className="mb-2 opacity-50" />
                <span className="text-xs text-center">Flux indisponible</span>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden rounded-xl">
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center z-10 bg-dark-bg/20 backdrop-blur-sm">
                    <Loader2 size={24} className="animate-spin text-white" />
                </div>
            )}
            
            <img 
                ref={imgRef}
                src={imageUrl || undefined} 
                alt={widget.name}
                className={`w-full h-full object-cover transition-opacity duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'}`}
                onLoad={handleImageLoad}
                onError={handleImageError}
                referrerPolicy="no-referrer"
            />

            {/* Overlay Controls */}
            <div className={`absolute top-2 right-2 z-20 transition-opacity duration-200 ${isFullscreen ? 'opacity-0 hover:opacity-100' : ''}`}>
                <button 
                    onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
                    className="p-1.5 bg-dark-bg/40 hover:bg-dark-bg/60 text-white rounded-full backdrop-blur-md transition-colors"
                    title="Plein écran"
                >
                    <Maximize2 size={16} />
                </button>
            </div>

            {/* Name Overlay (Bottom) */}
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
                <h3 className="text-white text-xs font-medium text-center truncate shadow-sm">
                    {widget.name}
                </h3>
            </div>
        </div>
    );
};

export default CameraWidget;
