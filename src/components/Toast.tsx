import { useState, useCallback } from 'react';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

let toastFn: ((msg: string, type?: Toast['type']) => void) | null = null;

export function useToast() {
  return { toast: (msg: string, type: Toast['type'] = 'success') => toastFn?.(msg, type) };
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  toastFn = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = Date.now();
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  }, []);

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
