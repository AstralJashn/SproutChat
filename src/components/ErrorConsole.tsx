import { useState, useEffect, useRef } from 'react';
import { X, Terminal, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

interface LogEntry {
  id: string;
  type: 'log' | 'error' | 'warn' | 'info';
  message: string;
  timestamp: Date;
  stack?: string;
}

interface ErrorConsoleProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function ErrorConsole({ isOpen, onToggle }: ErrorConsoleProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    const originalConsoleInfo = console.info;

    const addLog = (type: LogEntry['type'], args: any[]) => {
      const message = args.map(arg => {
        if (typeof arg === 'object') {
          try {
            return JSON.stringify(arg, null, 2);
          } catch {
            return String(arg);
          }
        }
        return String(arg);
      }).join(' ');

      const entry: LogEntry = {
        id: Date.now() + Math.random().toString(),
        type,
        message,
        timestamp: new Date(),
      };

      setLogs(prev => [...prev, entry].slice(-100));
    };

    console.log = (...args: any[]) => {
      originalConsoleLog(...args);
      addLog('log', args);
    };

    console.error = (...args: any[]) => {
      originalConsoleError(...args);
      addLog('error', args);
    };

    console.warn = (...args: any[]) => {
      originalConsoleWarn(...args);
      addLog('warn', args);
    };

    console.info = (...args: any[]) => {
      originalConsoleInfo(...args);
      addLog('info', args);
    };

    window.addEventListener('error', (event) => {
      addLog('error', [event.message, event.error?.stack]);
    });

    window.addEventListener('unhandledrejection', (event) => {
      addLog('error', ['Unhandled Promise Rejection:', event.reason]);
    });

    return () => {
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
      console.info = originalConsoleInfo;
    };
  }, []);

  useEffect(() => {
    if (isExpanded) {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isExpanded]);

  const clearLogs = () => {
    setLogs([]);
  };

  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'error':
        return 'text-red-400 border-l-red-500';
      case 'warn':
        return 'text-yellow-400 border-l-yellow-500';
      case 'info':
        return 'text-blue-400 border-l-blue-500';
      default:
        return 'text-slate-300 border-l-slate-500';
    }
  };

  const getLogIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'error':
        return '❌';
      case 'warn':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '▸';
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-24 right-4 w-12 h-12 bg-slate-800/90 backdrop-blur-xl text-emerald-400 rounded-full shadow-lg border border-slate-700/50 flex items-center justify-center hover:bg-slate-700/90 transition-all duration-200 z-40"
        title="Open Console"
      >
        <Terminal size={20} strokeWidth={2.5} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl flex flex-col z-40 overflow-hidden">
      <div className="bg-slate-800/80 border-b border-slate-700/50 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal size={16} className="text-emerald-400" strokeWidth={2.5} />
          <span className="text-sm font-semibold text-white">Console</span>
          <span className="text-xs text-slate-400">({logs.length})</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-slate-400 hover:text-white transition-colors p-1"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
          <button
            onClick={clearLogs}
            className="text-slate-400 hover:text-red-400 transition-colors p-1"
            title="Clear logs"
          >
            <Trash2 size={16} />
          </button>
          <button
            onClick={onToggle}
            className="text-slate-400 hover:text-white transition-colors p-1"
            title="Close console"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="overflow-y-auto h-96 p-2 font-mono text-xs space-y-1">
          {logs.length === 0 ? (
            <div className="text-slate-500 text-center py-8">No logs yet</div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className={`p-2 rounded border-l-2 bg-slate-800/40 ${getLogColor(log.type)}`}
              >
                <div className="flex items-start gap-2">
                  <span className="flex-shrink-0">{getLogIcon(log.type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] text-slate-500 mb-0.5">
                      {log.timestamp.toLocaleTimeString()}
                    </div>
                    <div className="whitespace-pre-wrap break-words">{log.message}</div>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={logsEndRef} />
        </div>
      )}
    </div>
  );
}
