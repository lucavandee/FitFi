import React from "react";

type Props = { children: React.ReactNode };

type State = { hasError: boolean; info?: string; error?: string };

export default class GlobalErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error: String(error?.message || error) };
  }

  componentDidCatch(error: any, info: any) {
    // Log in console met component stack
    // eslint-disable-next-line no-console
    console.error("🔴 GlobalErrorBoundary", error, info?.componentStack);
    this.setState({ info: info?.componentStack });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24 }}>
          <h2 style={{ marginBottom: 8 }}>Er ging iets mis in de UI</h2>
          <pre style={{ whiteSpace: "pre-wrap", opacity: 0.8 }}>
            {this.state.error || "Unknown error"}
            {"\n"}
            {this.state.info}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}