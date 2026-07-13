import React from 'react'

interface ModalProps {
  visible: boolean
  title?: string
  onClose: () => void
  children: React.ReactNode
}

export default function Modal({ visible, title, onClose, children }: ModalProps) {
  if (!visible) return null

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: 'white', padding: 20, borderRadius: 8, width: 'min(100%, 720px)', maxHeight: '90vh', overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 10px' }}>Fechar</button>
        </div>

        {children}
      </div>
    </div>
  )
}
