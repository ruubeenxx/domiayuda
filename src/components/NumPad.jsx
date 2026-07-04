import { useState } from 'react'

function fmt(n) {
  if (!n || n === '0') return '$0'
  const num = parseFloat(n.replace(/\./g, ''))
  if (isNaN(num)) return '$0'
  return '$' + Math.round(num).toLocaleString('es-CO')
}

// Botones de acceso rápido por denominación colombiana
const RAPIDOS = [
  { label: '1k', val: '1000' },
  { label: '2k', val: '2000' },
  { label: '4k', val: '4000' },
  { label: '5k', val: '5000' },
  { label: '10k', val: '10000' },
  { label: '20k', val: '20000' },
  { label: '50k', val: '50000' },
  { label: '100k', val: '100000' },
]

export default function NumPad({ label = 'Valor', onConfirm, onCancel, inicial = '' }) {
  const [valor, setValor] = useState(inicial ? String(inicial) : '')

  const presionar = (tecla) => {
    if (tecla === 'DEL') {
      setValor(v => v.slice(0, -1))
    } else if (tecla === '000') {
      setValor(v => v === '' ? '' : v + '000')
    } else {
      if (valor.length >= 9) return
      setValor(v => {
        if (v === '0') return tecla
        return v + tecla
      })
    }
  }

  const confirmar = () => {
    const num = parseFloat(valor)
    if (!isNaN(num) && num > 0) onConfirm(num)
  }

  const teclas = ['7','8','9','4','5','6','1','2','3','000','0','DEL']

  return (
    <div>
      {/* Display */}
      <div className="numpad-display">
        <div className="nd-label">{label}</div>
        <div className="nd-value">{valor || '0'}</div>
        <div className="nd-formatted">{fmt(valor)}</div>
      </div>

      {/* Accesos rápidos */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
        {RAPIDOS.map(r => (
          <button key={r.label}
            style={{ padding: '6px 12px', borderRadius: 20, border: '1.5px solid var(--purple)', background: 'var(--purple-light)', color: 'var(--purple)', fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'Nunito, sans-serif' }}
            onClick={() => setValor(r.val)}>
            {r.label}
          </button>
        ))}
      </div>

      {/* Teclado */}
      <div className="numpad-grid">
        {teclas.map(t => (
          <button key={t} className={`numpad-btn${t === 'DEL' ? ' delete' : t === '000' ? ' special' : ''}`}
            onClick={() => presionar(t)}>
            {t === 'DEL' ? '⌫' : t}
          </button>
        ))}
        <button className="numpad-btn confirm" onClick={confirmar}>✓ Listo</button>
        <button className="numpad-btn" style={{ background: '#f0f0f3', color: 'var(--text3)', fontSize: 14 }} onClick={onCancel}>Cancelar</button>
      </div>
    </div>
  )
}
