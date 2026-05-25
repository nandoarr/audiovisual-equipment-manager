import React, { useState, useEffect } from 'react'
import { X, Send } from 'lucide-react'

export default function LoanModal({ isOpen, onClose, onConfirm, equipment }) {
  const [borrowerName, setBorrowerName] = useState('')
  const [loanDate, setLoanDate] = useState('')
  const [expectedReturnDate, setExpectedReturnDate] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (isOpen) {
      setBorrowerName('')
      // Set default loan date to current local date/time in ISO-like format for datetime-local input
      const now = new Date()
      const offsetMs = now.getTimezoneOffset() * 60 * 1000
      const localISOTime = new Date(now.getTime() - offsetMs).toISOString().slice(0, 16)
      setLoanDate(localISOTime)
      
      // Default expected return date to empty (not required)
      setExpectedReturnDate('')
      setNotes('')
    }
  }, [isOpen])

  if (!isOpen || !equipment) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!borrowerName.trim()) return

    onConfirm({
      borrowerName: borrowerName.trim(),
      loanDate: new Date(loanDate).toISOString(),
      expectedReturnDate: expectedReturnDate ? new Date(expectedReturnDate).toISOString() : null,
      notes: notes.trim()
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="glass-panel modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>

        <h2 className="modal-title">Direcionar Equipamento</h2>
        
        <div style={styles.equipmentInfo}>
          <span style={styles.label}>Equipamento selecionado:</span>
          <span style={styles.eqName}>{equipment.name}</span>
          {equipment.serialNumber && (
            <span style={styles.eqSerial}>S/N: {equipment.serialNumber}</span>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="borrowerName">Nome do Responsável / Usuário *</label>
            <input
              type="text"
              id="borrowerName"
              className="form-input"
              required
              placeholder="Ex: Amanda Silva (Diretora de Fotografia)"
              value={borrowerName}
              onChange={(e) => setBorrowerName(e.target.value)}
              autoFocus
            />
          </div>

          <div style={styles.row}>
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="loanDate">Data de Entrega</label>
              <input
                type="datetime-local"
                id="loanDate"
                className="form-input"
                required
                value={loanDate}
                onChange={(e) => setLoanDate(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="expectedReturnDate">Previsão de Devolução (Opcional)</label>
              <input
                type="datetime-local"
                id="expectedReturnDate"
                className="form-input"
                value={expectedReturnDate}
                onChange={(e) => setExpectedReturnDate(e.target.value)}
                min={loanDate}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="loanNotes">Finalidade / Observações de Saída</label>
            <textarea
              id="loanNotes"
              className="form-input"
              placeholder="Ex: Gravação do comercial da marca X no estúdio B."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={styles.actions}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              <Send size={18} />
              Confirmar Entrega
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const styles = {
  equipmentInfo: {
    background: 'rgba(168, 85, 247, 0.08)',
    border: '1px solid rgba(168, 85, 247, 0.15)',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  label: {
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    fontWeight: '600',
    letterSpacing: '0.05em',
  },
  eqName: {
    fontSize: '1.15rem',
    fontWeight: '700',
    color: '#ffffff',
  },
  eqSerial: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    fontFamily: 'monospace',
  },
  row: {
    display: 'flex',
    gap: '15px',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '25px',
  }
}
