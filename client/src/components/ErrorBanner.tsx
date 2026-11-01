import React from 'react';
import { AlertTriangle, RefreshCw, XCircle } from 'lucide-react';

interface ErrorBannerProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({
  title = 'Case File Anomaly',
  message,
  onRetry,
  onDismiss,
}) => {
  return (
    <div className="rounded-lg border border-red-500/30 bg-red-950/40 p-4 text-red-200 shadow-md backdrop-blur-sm animate-fade-in">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-red-300 font-serif">{title}</h4>
          <p className="text-xs text-red-300/80 mt-1 leading-relaxed">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-red-900/60 hover:bg-red-800/80 text-red-100 border border-red-500/40 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry Action
            </button>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-red-400 hover:text-red-200 p-1 rounded"
            aria-label="Dismiss error"
          >
            <XCircle className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
