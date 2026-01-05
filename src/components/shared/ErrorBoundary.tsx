import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center bg-background-main p-4 text-center font-inter">
                    <div className="bg-surface-card p-8 rounded-xl shadow-lg max-w-md w-full border border-border-divider">
                        <div className="bg-red-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="h-8 w-8 text-red-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-text-primary mb-2">Something went wrong</h1>
                        <p className="text-text-secondary mb-6">
                            We encountered an unexpected error. Please try refreshing the page.
                        </p>
                        {this.state.error && process.env.NODE_ENV !== 'production' && (
                            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-6 text-left overflow-auto max-h-40">
                                <p className="text-xs font-mono text-red-500">{this.state.error.toString()}</p>
                            </div>
                        )}
                        <div className="flex gap-3 justify-center">
                            <Button
                                onClick={() => window.location.reload()}
                                className="bg-primary-action hover:bg-primary-action/90"
                            >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Refresh Page
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => this.setState({ hasError: false, error: null })}
                            >
                                Try Again
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
