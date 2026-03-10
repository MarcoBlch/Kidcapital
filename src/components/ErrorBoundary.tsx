import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
}

/**
 * Global error boundary — catches any unhandled render/lifecycle errors
 * and shows a friendly recovery screen instead of a blank white page.
 */
export default class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(): State {
        return { hasError: true };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error('ErrorBoundary caught:', error, info.componentStack);
    }

    handleRestart = () => {
        this.setState({ hasError: false });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div
                    style={{
                        minHeight: '100dvh',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(160deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                        color: 'white',
                        fontFamily: "'Baloo 2', cursive, sans-serif",
                        padding: '2rem',
                        textAlign: 'center',
                    }}
                >
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🐷</div>
                    <h1 style={{ fontSize: '1.5rem', color: '#fbbf24', marginBottom: '0.5rem' }}>
                        Oops! Something went wrong
                    </h1>
                    <p style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '2rem', maxWidth: '300px' }}>
                        Penny got confused! Tap the button below to try again.
                    </p>
                    <button
                        onClick={this.handleRestart}
                        style={{
                            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                            color: '#1a1a2e',
                            border: 'none',
                            borderRadius: '9999px',
                            padding: '0.75rem 2rem',
                            fontSize: '1.1rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            fontFamily: "'Baloo 2', cursive, sans-serif",
                        }}
                    >
                        🔄 Try Again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
