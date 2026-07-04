// Input que muestra formato de miles mientras escribes
// Ej: 4000 → $4.000, 22500 → $22.500
import { useState } from 'react'

export default function MoneyInput({ value, onChange, placeholder, style, autoFocus }) {
  const [display, setDisplay] = useState(value ? Number(value).toLocaleString('es-CO') : '')

  const handleChange = (e) => {
    // Solo números
    const raw = e.target.value.replace(/\D/g, '')
    const num = parseInt(raw) || 0
    setDisplay(raw === '' ? '' : num.toLocaleString('es-CO'))
    onChange(raw === '' ? '' : String(num))
  }

  return (
    <div style={{ position: 'relative', ...style }}>
      {display && (
        <span style={{
          position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
          fontSize: 13, color: 'var(--text3)', fontWeight: 600, pointerEvents: 'none'
        }}>$</span>
      )}
      <input
        className="inp"
        style={{ paddingLeft: display ? 22 : 12 }}
        value={display}
        onChange={handleChange}
        placeholder={placeholder || 'Valor en pesos'}
        autoFocus={autoFocus}
        inputMode="numeric"
      />
    </div>
  )
}
