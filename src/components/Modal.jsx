// Modal con animación de cierre suave y fix de teclado
import { useState, useEffect, useRef } from 'react'

export default function Modal({ onClose, children, title }) {
  const [closing, setClosing] = useState(false)
  const overlayRef = useRef()

  const handleClose = () => {
    setClosing(true)
    setTimeout(onClose, 200)
  }

  // Fix teclado: cuando se abre un input dentro del modal, scroll para que no quede tapado
  useEffect(() => {
    const handleFocus = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
        setTimeout(() => {
          e.target.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }, 300)
      }
    }
    document.addEventListener('focusin', handleFocus)
    return () => document.removeEventListener('focusin', handleFocus)
  }, [])

  return (
    <div
      ref={overlayRef}
      className={`modal-overlay${closing ? ' closing' : ''}`}
      onClick={handleClose}
    >
      <div
        className="modal"
        onClick={e => e.stopPropagation()}
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
      >
        {title && <div className="modal-title">{title}</div>}
        {children}
      </div>
    </div>
  )
}
