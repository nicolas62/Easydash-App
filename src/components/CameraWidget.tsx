import React, { useState, useEffect, useRef } from 'react';
import { WidgetConfig, AppSettings } from '../types';
import { getSecretApiKey } from '../services/cryptoService';
import { Maximize2, Loader2, VideoOff } from 'lucide-react';

interface CameraWidgetProps {
    widget: WidgetConfig;
    settings: AppSettings;
    isColorized: boolean;
}

const CameraWidget: React.FC<CameraWidgetProps> = ({ widget, settings }) => {
    const [imageUrl, setImageUrl] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const blobUrlRef = useRef<string>('');

    // Revoke blob URL on unmount to avoid memory leaks
    useEffect(() => {
        return () => {
            if (blobUrlRef.current) {
                URL.revokeObjectURL(blobUrlRef.current);
                blobUrlRef.current = '';
            }
        };
    }, []);

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
            setIsLoading(false);
            return;
        }

        let intervalId: ReturnType<typeof setInterval> | undefined;
        let currentController: AbortController | null = null;
        let isCancelled = false;

        const buildUrl = () => {
            let url = widget.streamUrl!;
            try {
                const parsed = new URL(url);
                if (!['http:', 'https:'].includes(parsed.protocol)) {
                    throw new Error('Invalid protocol');
                }
            } catch {
                setError(true);
                return '';
            }
            const effectiveKey = settings.apiKey || getSecretApiKey();
            if (!url.includes('apikey=') && effectiveKey) {
                url += `${url.includes('?') ? '&' : '?'}apikey=${encodeURIComponent(effectiveKey)}`;
            }
            return url;
        };

        const updateUrl = async () => {
            const targetUrl = buildUrl();
            if (!targetUrl) {
                setIsLoading(false);
                return;
            }

            // When the proxy is enabled and it's a snapshot, fetch through the server
            // so the API key never appears in the <img src> or browser cache.
            if (settings.useProxy && isSnapshot) {
                if (currentController) currentController.abort();
                currentController = new AbortController();
                try {
                    const response = await fetch('/api/camera', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ url: targetUrl }),
                        signal: currentController.signal,
                    });
                    if (!response.ok) throw new Error('proxy error');
                    const blob = await response.blob();
                    if (isCancelled) return;
                    if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
                    blobUrlRef.current = URL.createObjectURL(blob);
                    setImageUrl(blobUrlRef.current);
                    setError(false);
                } catch (e: any) {
                    if (e?.name === 'AbortError' || isCancelled) return;
                    setError(true);
                }
                if (!isCancelled) setIsLoading(false);
                return;
            }

            // Direct mode or MJPEG stream
            let url = targetUrl;
            if (isSnapshot) {
                url += `${url.includes('?') ? '&' : '?'}t=${Date.now()}`;
            }
            setImageUrl(url);
            setIsLoading(true);
        };

        updateUrl();

        if (isSnapshot) {
            intervalId = setInterval(updateUrl, Math.max(1000, widget.refreshInterval || 5000));
        }

        return () => {
            isCancelled = true;
            if (currentController) currentController.abort();
            if (intervalId) clearInterval(intervalId);
        };
    }, [isVisible, widget.streamUrl, widget.refreshInterval, settings.apiKey, settings.useProxy, isSnapshot]);

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
            setIsFullscreen(document.fullscreenElement === containerRef.current && !!containerRef.current);
        };
        document.addEventListener('fullscreenchange', handleFsChange);
        return () => document.removeEventListener('fullscreenchange', handleFsChange);
    }, []);

    return (
        <div ref={containerRef} className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden rounded-xl">
            {isLoading && !error && (
                <div className="absolute inset-0 flex items-center justify-center z-10 bg-dark-bg/20 backdrop-blur-sm">
                    <Loader2 size={24} className="animate-spin text-white" />
                </div>
            )}

            {error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-content-secondary p-4 z-10 bg-dark-card">
                    <VideoOff size={32} className="mb-2 opacity-50" />
                    <span className="text-xs text-center">Flux indisponible</span>
                </div>
            )}
            
            {imageUrl && (
                <img 
                    ref={imgRef}
                    src={imageUrl} 
                    alt={widget.name}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${isLoading || error ? 'opacity-0' : 'opacity-100'}`}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    referrerPolicy="no-referrer"
                />
            )}

            {/* Overlay Controls */}
            {!error && (
                <div className={`absolute top-2 right-2 z-20 transition-opacity duration-200 ${isFullscreen ? 'opacity-0 hover:opacity-100' : ''}`}>
                    <button 
                        onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
                        className="p-1.5 bg-dark-bg/40 hover:bg-dark-bg/60 text-white rounded-full backdrop-blur-md transition-colors"
                        title="Plein écran"
                    >
                        <Maximize2 size={16} />
                    </button>
                </div>
            )}

            {/* Name Overlay (Bottom) */}
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent pointer-events-none z-20">
                <h3 className="text-white text-xs font-medium text-center truncate shadow-sm">
                    {widget.name}
                </h3>
            </div>
        </div>
    );
};

export default CameraWidget;
