import React from "react";

function CrashOverlay({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <div className="fixed inset-0 z-[2147483647] bg-[#0b1120] text-[#E6E7EA] p-6 overflow-auto">
      <div className="max-w-3xl mx-auto">
        <div className="mb-3 text-sm opacity-80">Nova • Crash Report</div>
        <h2 className="text-2xl font-semibold mb-4">Er ging iets mis</h2>
        <pre className="bg-[#0f172a] border border-[#1f2937] rounded-lg p-4 whitespace-pre-wrap text-sm overflow-auto">
          {String(error?.stack || error?.message || error)}
        </pre>
        <div className="mt-4 flex gap-2">
          <button
            className="px-3 h-9 rounded-md border border-[#243040] hover:bg-[#11182a]"
            onClick={onRetry}
          >
            Opnieuw proberen
          </button>
        </div>
      </div>
    </div>
  );
}

type CrashGateState = { error: Error | null };

export default class CrashGate extends React.Component<React.PropsWithChildren, CrashGateState> {
  state: CrashGateState = { error: null };

  static getDerivedStateFromError(error: Error): CrashGateState {
    return { error };
  }

  componentDidCatch(error: Error) {
    // nooit throwen; eventueel: console.error(error);
  }

  render() {
    if (this.state.error) {
      return (
        <CrashOverlay
          error={this.state.error}
          onRetry={() => this.setState({ error: null })}
        />
      );
    }
    return this.props.children;
  }
}