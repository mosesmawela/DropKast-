import React from 'react';

interface State {
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8 font-mono">
        <div className="max-w-xl w-full space-y-6 border border-white/10 p-10 bg-white/[0.02]">
          <div className="text-[10px] font-black text-primary tracking-[0.4em] uppercase italic">
            System Fault
          </div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter">
            Something broke loading this view.
          </h1>
          <pre className="text-[11px] text-white/50 whitespace-pre-wrap break-words bg-black/50 p-4 border border-white/5 max-h-48 overflow-auto">
            {this.state.error.message}
          </pre>
          <div className="flex gap-3">
            <button
              onClick={() => this.setState({ error: null })}
              className="h-12 px-6 bg-white text-black hover:bg-primary hover:text-white text-[10px] font-black uppercase italic tracking-[0.3em]"
            >
              Try again
            </button>
            <button
              onClick={() => (window.location.href = '/')}
              className="h-12 px-6 border border-white/10 text-white/40 hover:text-white hover:border-white text-[10px] font-black uppercase italic tracking-[0.3em]"
            >
              Home
            </button>
          </div>
        </div>
      </div>
    );
  }
}
