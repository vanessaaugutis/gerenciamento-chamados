import React from 'react'
import { FiX } from 'react-icons/fi'

interface ModalProps {
  visible: boolean
  title?: string
  onClose: () => void
  children: React.ReactNode
}

export default function Modal({ visible, title, onClose, children }: ModalProps) {
  if (!visible) return null

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h3>{title}</h3>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Fechar">
            <FiX size={20} />
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  )
}
