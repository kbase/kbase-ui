import { Component, PropsWithChildren } from 'react';
import ErrorMessage from '../../components/ErrorMessage';

export type ErrorBoundaryProps = PropsWithChildren<{}>;

interface ErrorBoundaryState {
    hasError: boolean;
    error: any;
}

export default class ErrorBoundary extends Component<
    ErrorBoundaryProps,
    ErrorBoundaryState
> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
        };
    }

    static getDerivedStateFromError(error: any) {
        return {
            hasError: true,
        };
    }

    componentDidCatch(error: any, errorInfo: any) {
        console.error('ERROR', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <ErrorMessage message="An error has been caught by the Error Boundary" />
            );
        }
        return this.props.children || null;
    }
}
