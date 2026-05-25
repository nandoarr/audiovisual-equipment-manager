import React, { useState, useEffect } from 'react'
import { X, Save } from 'lucide-react'

const CATEGORIES = [
  'Câmeras',
  'Lentes',
  'Iluminação',
  'Áudio',
  'Estabilizadores & Tripés',
  'Acessórios',
  'Outros'
]

export default function EquipmentModal({ isOpen, onClose, onSave, equipmentToEdit }) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Câmeras',
    serialNumber: '',
    description: '',
    status: 'Disponível'
  })

  useEffect(() => {
    if (equipmentToEdit) {
      setFormData({
        name: equipmentToEdit.name || '',
        category: equipmentToEdit.category || 'Câmeras',
        serialNumber: equipmentToEdit.serialNumber || '',
        description: equipmentToEdit.description || '',
        status: equipmentToEdit.status || 'Disponível'
      })
    } else {
      setFormData({
        name: '',
        category: 'Câmeras',
        serialNumber: '',
        description: '',
        status: 'Disponível'
      })
    }
  }, [equipmentToEdit, isOpen])

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name.trim()) return
    onSave(formData)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="glass-panel modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>

        <h2 className="modal-title">
          {equipmentToEdit ? 'Editar Equipamento' : 'Cadastrar Equipamento'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Nome do Equipamento *</label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-input"
              required
              placeholder="Ex: Câmera Sony FX3"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div style={styles.row}>
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="category">Categoria</label>
              <select
                id="category"
                name="category"
                className="form-input"
                value={formData.category}
                onChange={handleChange}
                style={styles.select}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat} style={styles.option}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="serialNumber">Nº de Série / ID</label>
              <input
                type="text"
                id="serialNumber"
                name="serialNumber"
                className="form-input"
                placeholder="Ex: SN-FX3-1029"
                value={formData.serialNumber}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Descrição / Notas de Estado</label>
            <textarea
              id="description"
              name="description"
              className="form-input"
              placeholder="Ex: Sensor limpo, acompanha 2 baterias e case de transporte."
              value={formData.description}
              onChange={handleChange}
              rows={3}
              style={{ resize: 'vertical' }}
            />
          </div>

          {equipmentToEdit && (
            <div className="form-group">
              <label htmlFor="status">Status do Equipamento</label>
              <select
                id="status"
                name="status"
                className="form-input"
                value={formData.status}
                onChange={handleChange}
                style={styles.select}
                disabled={formData.status === 'Em Uso'} /* Em Uso deve ser gerenciado via empréstimo/devolução */
              >
                <option value="Disponível" style={styles.option}>Disponível</option>
                <option value="Em Manutenção" style={styles.option}>Em Manutenção</option>
                {formData.status === 'Em Uso' && (
                  <option value="Em Uso" style={styles.option}>Em Uso (Gerenciado via empréstimo)</option>
                )}
              </select>
              {formData.status === 'Em Uso' && (
                <span style={styles.helpText}>
                  Equipamentos "Em Uso" são liberados ao registrar a devolução no painel.
                </span>
              )}
            </div>
          )}

          <div style={styles.actions}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={18} />
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const styles = {
  row: {
    display: 'flex',
    gap: '15px',
  },
  select: {
    appearance: 'none',
    backgroundPosition: 'right 16px center',
    backgroundRepeat: 'no-repeat',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2523f3f4f6'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
    backgroundSize: '16px',
    cursor: 'pointer',
  },
  option: {
    backgroundColor: '#16141f',
    color: '#f3f4f6',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '25px',
  },
  helpText: {
    display: 'block',
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    marginTop: '6px',
  }
}
