import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';
import { CheckCircle, AlertTriangle, Info, XCircle, X } from 'lucide-react';
import styles from './Toast.module.css';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastState {
  toasts: ToastItem[];
}

type ToastAction =
  | { type: 'ADD'; payload: ToastItem }
  | { type: 'REMOVE'; payload: number };

/* ------------------------------------------------------------------ */
/*  Reducer                                                            */
/* ------------------------------------------------------------------ */

const MAX_TOASTS = 3;
let nextId = 0;

function toastReducer(state: ToastState, action: ToastAction): ToastState {
  switch (action.type) {
    case 'ADD': {
      const toasts = [...state.toasts, action.payload].slice(-MAX_TOASTS);
      return { toasts };
    }
    case 'REMOVE':
      return {
        toasts: state.toasts.filter((t) => t.id !== action.payload),
      };
    default:
      return state;
  }
}

/* ------------------------------------------------------------------ */
/*  Context                                                            */
/* ------------------------------------------------------------------ */

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used inside <Toast /> (ToastProvider)');
  }
  return ctx;
}

/* ------------------------------------------------------------------ */
/*  Icon helper                                                        */
/* ------------------------------------------------------------------ */

const iconMap: Record<ToastType, ReactNode> = {
  success: <CheckCircle size={18} />,
  error: <XCircle size={18} />,
  warning: <AlertTriangle size={18} />,
  info: <Info size={18} />,
};

/* ------------------------------------------------------------------ */
/*  Toast (provider + renderer)                                        */
/* ------------------------------------------------------------------ */

export function Toast({ children }: { children?: ReactNode }) {
  const [state, dispatch] = useReducer(toastReducer, { toasts: [] });

  const showToast = useCallback(
    (message: string, type: ToastType = 'info') => {
      const id = ++nextId;
      dispatch({ type: 'ADD', payload: { id, message, type } });

      // Auto-dismiss after 4 seconds
      setTimeout(() => {
        dispatch({ type: 'REMOVE', payload: id });
      }, 4000);
    },
    [],
  );

  const dismiss = useCallback((id: number) => {
    dispatch({ type: 'REMOVE', payload: id });
  }, []);

  const contextValue = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}

      {/* Toast container */}
      <div className={styles.container} aria-live="polite" aria-atomic="false">
        {state.toasts.map((toast) => (
          <div
            key={toast.id}
            className={`${styles.toast} ${styles[toast.type]}`}
            role="status"
          >
            <span className={styles.icon}>{iconMap[toast.type]}</span>
            <span className={styles.message}>{toast.message}</span>
            <button
              className={styles.dismiss}
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss"
              type="button"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
