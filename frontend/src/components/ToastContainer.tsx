import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi'
import type { Toast } from '../hooks/useToast'

interface ToastContainerProps {
  toasts: Toast[]
  onRemove: (id: number) => void
}

const icons = {
  success: <FiCheckCircle size={18} />,
  error: <FiAlertCircle size={18} />,
  info: <FiInfo size={18} />,
}

export default function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast--${toast.type}`}>
          <span className="toast__icon">{icons[toast.type]}</span>
          <span className="toast__message">{toast.message}</span>
          <button
            className="toast__close"
            onClick={() => onRemove(toast.id)}
            aria-label="Fechar notificação"
          >
            <FiX size={16} />
          </button>
        </div>
      ))}
    </div>
  )
}
