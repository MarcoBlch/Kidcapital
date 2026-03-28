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
                        background: '#2B6A4E',
                        color: 'white',
                        fontFamily: "'Baloo 2', cursive, sans-serif",
                        padding: '2rem',
                        textAlign: 'center',
                    }}
                >
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>😵</div>
                    <h1 style={{ fontSize: '1.5rem', color: '#FFD700', marginBottom: '0.5rem' }}>
                        Oops! Something went wrong
                    </h1>
                    <p style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '2rem', maxWidth: '300px' }}>
                        Penny got confused! Tap the button below to try again.
                    </p>
                    <button
                        onClick={this.handleRestart}
                        style={{
                            background: '#FFD700',
                            color: '#4A3800',
                            border: 'none',
                            borderRadius: '16px',
                            padding: '0.75rem 2rem',
                            fontSize: '1.1rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            fontFamily: "'Baloo 2', cursive, sans-serif",
                            boxShadow: '0 5px 0 #B8860B, 0 8px 16px rgba(0,0,0,0.2)',
                        }}
                    >
                        Try Again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
