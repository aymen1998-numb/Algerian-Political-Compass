import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false
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
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 text-center">
          <div className="bg-zinc-900 border border-red-500/20 p-8 rounded-3xl shadow-2xl max-w-md w-full">
            <h1 className="text-2xl font-bold text-white mb-4">عذراً، حدث خطأ غير متوقع</h1>
            <p className="text-zinc-400 mb-6 text-sm">
              يبدو أن هناك مشكلة في النظام. يرجى تحديث الصفحة وحاول مرة أخرى.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-indigo-700 transition-colors w-full"
            >
              تحديث الصفحة
            </button>
            {this.state.error && (
              <div className="mt-6 p-4 bg-black/50 rounded-lg text-left overflow-auto text-xs font-mono text-red-400 max-h-32">
                  {this.state.error.message}
              </div>
            )}
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
