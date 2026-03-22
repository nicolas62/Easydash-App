import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
    widgetName?: string;
    children: React.ReactNode;
}

interface State {
    hasError: boolean;
    message: string;
}

class WidgetErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, message: '' };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, message: error.message || 'Erreur inconnue' };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error(`[WidgetErrorBoundary] Widget "${this.props.widgetName}" a planté:`, error, info.componentStack);
    }

    handleRetry = () => {
        this.setState({ hasError: false, message: '' });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="h-full w-full flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-red-500/30 bg-red-500/5 text-center">
                    <AlertTriangle size={20} className="text-red-400 flex-shrink-0" />
                    <p className="text-xs font-medium text-red-400 truncate w-full">
                        {this.props.widgetName || 'Widget'}
                    </p>
                    <p className="text-[10px] text-content-secondary leading-tight line-clamp-2">
                        {this.state.message}
                    </p>
                    <button
                        onClick={this.handleRetry}
                        className="mt-1 text-[10px] text-jeedom-500 hover:underline"
                    >
                        Réessayer
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default WidgetErrorBoundary;
