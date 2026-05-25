import React, { useState, useEffect } from 'react'
import { X, Save, FileUp, AlertCircle, Check } from 'lucide-react'
import * as XLSX from 'xlsx'

const CATEGORIES = [
  'Câmeras',
  'Lentes',
  'Iluminação',
  'Áudio',
  'Estabilizadores & Tripés',
  'Drones',
  'Acessórios',
  'Outros'
]

export default function EquipmentModal({ isOpen, onClose, onSave, onSaveBatch, equipmentToEdit }) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Câmeras',
    serialNumber: '',
    description: '',
    status: 'Disponível'
  })

  // Batch import state
  const [activeTab, setActiveTab] = useState('single') // 'single' | 'batch'
  const [fileName, setFileName] = useState('')
  const [parsedItems, setParsedItems] = useState([])
  const [parseError, setParseError] = useState('')
  const [dragOver, setDragOver] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setActiveTab('single')
      setFileName('')
      setParsedItems([])
      setParseError('')
      setDragOver(false)
      
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

  // File parsing logic
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    parseExcelFile(file)
  }

  const parseExcelFile = (file) => {
    setFileName(file.name)
    setParseError('')
    setParsedItems([])

    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)

        if (!jsonData || jsonData.length === 0) {
          setParseError('A planilha parece estar vazia.')
          return
        }

        const items = []
        jsonData.forEach((row) => {
          // Identify columns intelligently
          const nameKey = Object.keys(row).find(k => 
            /^(nome|name|equipamento|titulo|title|item)$/i.test(k.trim())
          )
          const categoryKey = Object.keys(row).find(k => 
            /^(categoria|category|tipo)$/i.test(k.trim())
          )
          const serialKey = Object.keys(row).find(k => 
            /^(s[eé]rie|n[oº]\s*de\s*s[eé]rie|serial|serialnumber|id)$/i.test(k.trim())
          )
          const descKey = Object.keys(row).find(k => 
            /^(descri[cç][aã]o|description|obs|observa[cç][aã]o|observa[cç][oõ]es|detalhes)$/i.test(k.trim())
          )

          const nameVal = nameKey ? row[nameKey] : null

          // Valid row must have a name
          if (nameVal && String(nameVal).trim()) {
            // Check category matching
            let categoryVal = 'Outros'
            if (categoryKey && row[categoryKey]) {
              const parsedCat = String(row[categoryKey]).trim()
              const matchedCat = CATEGORIES.find(c => c.toLowerCase() === parsedCat.toLowerCase())
              if (matchedCat) {
                categoryVal = matchedCat
              }
            }

            items.push({
              name: String(nameVal).trim(),
              category: categoryVal,
              serialNumber: serialKey && row[serialKey] ? String(row[serialKey]).trim() : '',
              description: descKey && row[descKey] ? String(row[descKey]).trim() : ''
            })
          }
        })

        if (items.length === 0) {
          setParseError('Não foi possível identificar equipamentos válidos. Certifique-se de que há uma coluna com o cabeçalho "Nome".')
        } else {
          setParsedItems(items)
        }
      } catch (err) {
        console.error(err)
        setParseError('Erro ao ler a planilha. Verifique se o arquivo está corrompido.')
      }
    }
    reader.readAsArrayBuffer(file)
  }

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      parseExcelFile(file)
    } else {
      setParseError('Por favor, envie apenas arquivos Excel (.xlsx ou .xls).')
    }
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

        {!equipmentToEdit && (
          <div style={styles.tabHeaders}>
            <button
              type="button"
              style={{...styles.tabBtn, ...(activeTab === 'single' ? styles.tabActive : {})}}
              onClick={() => setActiveTab('single')}
            >
              Cadastro Individual
            </button>
            <button
              type="button"
              style={{...styles.tabBtn, ...(activeTab === 'batch' ? styles.tabActive : {})}}
              onClick={() => setActiveTab('batch')}
            >
              Importar Planilha Excel
            </button>
          </div>
        )}

        {activeTab === 'batch' && !equipmentToEdit ? (
          <div>
            <div style={styles.instructions}>
              <strong style={{ color: '#ffffff' }}>Instruções de Importação:</strong>
              <p style={{ margin: '4px 0 0 0' }}>
                A planilha deve conter cabeçalhos na primeira linha. Colunas mapeadas automaticamente:
              </p>
              <ul style={{ margin: '6px 0 0 16px', padding: 0 }}>
                <li><strong>Nome</strong> (obrigatório): Nome/modelo do item.</li>
                <li><strong>Categoria</strong> (opcional): Câmeras, Lentes, Iluminação, Áudio, etc.</li>
                <li><strong>Nº de Série</strong> (opcional): Série ou identificador único.</li>
                <li><strong>Descrição</strong> (opcional): Descrição ou observações de estado.</li>
              </ul>
            </div>

            {!parsedItems.length ? (
              <div
                style={{
                  ...styles.dropzone,
                  ...(dragOver ? styles.dropzoneActive : {})
                }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('excel-file-input').click()}
              >
                <FileUp size={40} color={dragOver ? 'var(--color-primary-hover)' : 'var(--text-muted)'} style={{ transition: 'color 0.2s' }} />
                <span style={{ fontSize: '0.95rem', fontWeight: '600', color: '#ffffff' }}>
                  Arraste a planilha de equipamentos aqui
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Ou clique para selecionar o arquivo (.xlsx, .xls)
                </span>
                <input
                  type="file"
                  id="excel-file-input"
                  accept=".xlsx, .xls"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </div>
            ) : (
              <div style={styles.previewContainer}>
                <div style={styles.previewHeader}>
                  <span style={styles.previewTitle}>Arquivo: <strong style={{ color: 'var(--color-primary-hover)' }}>{fileName}</strong></span>
                  <span style={styles.previewCount}>{parsedItems.length} itens detectados</span>
                </div>

                <div style={styles.previewList}>
                  {parsedItems.map((item, idx) => (
                    <div key={idx} style={styles.previewItem}>
                      <span style={styles.previewItemName} title={item.name}>
                        {idx + 1}. {item.name}
                      </span>
                      <div style={styles.previewItemMeta}>
                        <span style={styles.previewTag}>{item.category}</span>
                        {item.serialNumber && <span style={styles.previewTag}>{item.serialNumber}</span>}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setParsedItems([])
                      setFileName('')
                    }}
                  >
                    Escolher Outro
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      onSaveBatch(parsedItems)
                      onClose()
                    }}
                  >
                    <Check size={18} /> Cadastrar {parsedItems.length} Equipamentos
                  </button>
                </div>
              </div>
            )}

            {parseError && (
              <div style={styles.errorBox}>
                <AlertCircle size={18} style={{ minWidth: '18px' }} />
                <span>{parseError}</span>
              </div>
            )}
          </div>
        ) : (
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
                  disabled={formData.status === 'Em Uso'}
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
        )}
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
  },
  tabHeaders: {
    display: 'flex',
    gap: '10px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    marginBottom: '20px',
    paddingBottom: '2px',
  },
  tabBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    padding: '8px 16px',
    fontSize: '0.9rem',
    cursor: 'pointer',
    position: 'relative',
    fontWeight: '600',
    fontFamily: 'var(--font-heading)',
    transition: 'all 0.2s',
  },
  tabActive: {
    color: 'var(--color-primary-hover)',
    borderBottom: '2px solid var(--color-primary)',
  },
  dropzone: {
    border: '2px dashed rgba(168, 85, 247, 0.3)',
    borderRadius: '12px',
    background: 'rgba(22, 20, 31, 0.3)',
    padding: '30px 20px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
  },
  dropzoneActive: {
    border: '2px dashed var(--color-primary-hover)',
    background: 'rgba(168, 85, 247, 0.05)',
  },
  previewContainer: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    padding: '16px',
    marginTop: '15px',
  },
  previewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
    flexWrap: 'wrap',
    gap: '8px',
  },
  previewTitle: {
    fontSize: '0.9rem',
    fontWeight: '700',
    color: '#ffffff',
  },
  previewCount: {
    fontSize: '0.8rem',
    background: 'rgba(16, 185, 129, 0.1)',
    color: 'var(--color-success)',
    padding: '2px 8px',
    borderRadius: '20px',
    fontWeight: '600',
  },
  previewList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    maxHeight: '180px',
    overflowY: 'auto',
    marginBottom: '15px',
    paddingRight: '4px',
  },
  previewItem: {
    background: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid rgba(255, 255, 255, 0.03)',
    borderRadius: '8px',
    padding: '8px 12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '10px',
  },
  previewItemName: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#ffffff',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    flex: '1',
  },
  previewItemMeta: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    display: 'flex',
    gap: '8px',
  },
  previewTag: {
    background: 'rgba(255, 255, 255, 0.04)',
    padding: '1px 6px',
    borderRadius: '4px',
    fontSize: '0.7rem',
  },
  instructions: {
    background: 'rgba(255, 255, 255, 0.02)',
    borderRadius: '8px',
    padding: '12px 14px',
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.4',
    marginBottom: '15px',
  },
  errorBox: {
    display: 'flex',
    gap: '8px',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: '8px',
    padding: '12px',
    color: '#f87171',
    fontSize: '0.8rem',
    marginTop: '15px',
    alignItems: 'flex-start',
  }
}

