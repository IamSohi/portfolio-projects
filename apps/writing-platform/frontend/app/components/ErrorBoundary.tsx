import React, { ErrorInfo, ReactNode } from 'react';

type ErrorBoundaryProps = {
    children?: ReactNode;
};

type ErrorBoundaryState = {
    hasError: boolean;
};

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log error to monitoring service
        console.error('Uncaught error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return <h1>Something went wrong. Please refresh.</h1>;
        }

        return this.props.children;
    }
}