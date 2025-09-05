import { Component, ErrorInfo, ReactNode } from "react";
import ErrorFallback from "@/components/ui/ErrorFallback";

type Props = { 
  children: ReactNode; 
  fallback?: ReactNode; 
  onError?: (e: Error, info: ErrorInfo) => void; 
};

type State = { 
  hasError: boolean; 
  error: Error | null; 
  info: ErrorInfo | null; 
};

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null, info: null };

  static getDerivedStateFromError(error: Error) { 
    return { hasError: true, error }; 
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.setState({ info }); 
    this.props.onError?.(error, info);
    if (import.meta.env.DEV) console.error("[ErrorBoundary]", error, info);
  }

  reset = () => this.setState({ hasError: false, error: null, info: null });

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <ErrorFallback 
          error={this.state.error || new Error("Onbekende fout")} 
          resetErrorBoundary={this.reset} 
          showDetails={import.meta.env.DEV} 
        />
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
export { ErrorBoundary };