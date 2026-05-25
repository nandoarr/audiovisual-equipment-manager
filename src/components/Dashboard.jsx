import React, { useState } from 'react'
import * as XLSX from 'xlsx'
import logo from '../logo.png'
import {
  Search,
  Filter,
  Plus,
  RefreshCw,
  LogOut,
  Sliders,
  FolderOpen,
  Calendar,
  History,
  Info,
  CheckCircle,
  Clock,
  Settings,
  AlertCircle,
  FileDown,
  FileUp,
  Trash2,
  Edit3,
  UserCheck,
  Send,
  Video,
  Users,
  UserPlus,
  Lock
} from 'lucide-react'

const CATEGORIES = [
  'Todos',
  'Câmeras',
  'Lentes',
  'Iluminação',
  'Áudio',
  'Estabilizadores & Tripés',
  'Acessórios',
  'Outros'
]

export default function Dashboard({
  onLogout,
  equipment,
  logs,
  people = [],
  isAdmin,
  onAddEquipment,
  onUpdateEquipment,
  onDeleteEquipment,
  onLendEquipment,
  onReturnEquipment,
  onChangePassword,
  onImportData,
  onLoadMockData,
  onClearAllData,
  onAddPerson,
  onDeletePerson,
  onQuickStatusChange
}) {
  const [activeTab, setActiveTab] = useState('overview')
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('Todos')
  const [statusFilter, setStatusFilter] = useState('Todos')
  
  // Modals state
  const [isEqModalOpen, setIsEqModalOpen] = useState(false)
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false)
  const [selectedEquipment, setSelectedEquipment] = useState(null)
  
  // History search state
  const [historySearch, setHistorySearch] = useState('')
  
  // Change password state
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' })
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' })

  // People registration state
  const [newPersonName, setNewPersonName] = useState('')

  // Admin password states
  const [adminPasswordForm, setAdminPasswordForm] = useState({ current: '', newPass: '', confirm: '' })
  const [adminPasswordMsg, setAdminPasswordMsg] = useState({ type: '', text: '' })

  const handleAddPersonSubmit = (e) => {
    e.preventDefault()
    if (!newPersonName.trim()) return
    onAddPerson(newPersonName)
    setNewPersonName('')
  }

  const handleAdminPasswordChange = (e) => {
    e.preventDefault()
    if (adminPasswordForm.newPass !== adminPasswordForm.confirm) {
      setAdminPasswordMsg({ type: 'error', text: 'A nova senha e a confirmação não coincidem.' })
      return
    }
    const success = onChangePassword(adminPasswordForm.current, adminPasswordForm.newPass, true)
    if (success) {
      setAdminPasswordMsg({ type: 'success', text: 'Senha do administrador atualizada!' })
      setAdminPasswordForm({ current: '', newPass: '', confirm: '' })
    } else {
      setAdminPasswordMsg({ type: 'error', text: 'Senha atual do administrador incorreta.' })
    }
  }

  // Statistics calculation
  const totalCount = equipment.length
  const inUseCount = equipment.filter(e => e.status === 'Em Uso').length
  const availableCount = equipment.filter(e => e.status === 'Disponível').length
  const maintenanceCount = equipment.filter(e => e.status === 'Em Manutenção').length
  
  // Overdue count (where expectedReturnDate is in the past)
  const overdueCount = equipment.filter(e => {
    if (e.status !== 'Em Uso' || !e.expectedReturnDate) return false
    return new Date(e.expectedReturnDate) < new Date()
  }).length

  // Filtered equipment list
  const filteredEquipment = equipment.filter(e => {
    const matchesSearch = 
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.serialNumber && e.serialNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.borrowerName && e.borrowerName.toLowerCase().includes(searchQuery.toLowerCase()))
      
    const matchesCategory = categoryFilter === 'Todos' || e.category === categoryFilter
    
    let matchesStatus = true
    if (statusFilter !== 'Todos') {
      if (statusFilter === 'Em Atraso') {
        matchesStatus = e.status === 'Em Uso' && e.expectedReturnDate && new Date(e.expectedReturnDate) < new Date()
      } else {
        matchesStatus = e.status === statusFilter
      }
    }
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  // Filtered history list
  const filteredLogs = logs.filter(log => {
    return (
      log.equipmentName.toLowerCase().includes(historySearch.toLowerCase()) ||
      log.borrowerName.toLowerCase().includes(historySearch.toLowerCase()) ||
      (log.serialNumber && log.serialNumber.toLowerCase().includes(historySearch.toLowerCase()))
    )
  }).slice().reverse() // Show newest first

  const handlePasswordChange = (e) => {
    e.preventDefault()
    if (passwordForm.newPass !== passwordForm.confirm) {
      setPasswordMsg({ type: 'error', text: 'A nova senha e a confirmação não coincidem.' })
      return
    }
    const success = onChangePassword(passwordForm.current, passwordForm.newPass)
    if (success) {
      setPasswordMsg({ type: 'success', text: 'Senha atualizada com sucesso!' })
      setPasswordForm({ current: '', newPass: '', confirm: '' })
    } else {
      setPasswordMsg({ type: 'error', text: 'Senha atual incorreta.' })
    }
  }

  const handleBackupExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ equipment, logs, people }))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute("href", dataStr)
    downloadAnchor.setAttribute("download", `peixe_voador_backup_${new Date().toISOString().slice(0,10)}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  const handleBackupImport = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result)
        if (parsed.equipment && parsed.logs) {
          onImportData(parsed.equipment, parsed.logs, parsed.people || [])
          alert('Dados importados com sucesso!')
        } else {
          alert('Arquivo inválido. Certifique-se de que é um backup válido do Peixe Voador Equipamentos.')
        }
      } catch (err) {
        alert('Erro ao processar o arquivo. Verifique o formato JSON.')
      }
    }
    reader.readAsText(file)
  }

  const handleExcelExport = () => {
    try {
      const wsEq = XLSX.utils.json_to_sheet(equipment.map(e => ({
        'ID': e.id,
        'Nome': e.name,
        'Categoria': e.category,
        'Número de Série': e.serialNumber || '',
        'Status': e.status,
        'Responsável': e.borrowerName || '',
        'Data de Empréstimo': e.loanDate ? formatDate(e.loanDate) : '',
        'Devolução Prevista': e.expectedReturnDate ? formatDate(e.expectedReturnDate) : '',
        'Descrição / Observações': e.description || ''
      })));

      const wsLogs = XLSX.utils.json_to_sheet(logs.map(l => ({
        'ID Log': l.id,
        'Data/Hora': formatDate(l.timestamp),
        'Equipamento ID': l.equipmentId,
        'Nome Equipamento': l.equipmentName,
        'Número de Série': l.serialNumber || '',
        'Ação': l.action === 'retirada' ? 'Saída' : 'Devolução',
        'Responsável': l.borrowerName,
        'Observações': l.notes || ''
      })));

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, wsEq, 'Inventário');
      XLSX.utils.book_append_sheet(wb, wsLogs, 'Histórico');
      XLSX.writeFile(wb, `peixe_voador_equipamentos_${new Date().toISOString().slice(0,10)}.xlsx`);
    } catch (err) {
      console.error(err);
      alert('Erro ao exportar a planilha do Excel.');
    }
  }

  const handleExcelImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Parse Sheet 1: Inventário
        const wsEqName = workbook.SheetNames[0];
        const wsEq = workbook.Sheets[wsEqName];
        const eqData = XLSX.utils.sheet_to_json(wsEq);
        
        // Parse Sheet 2: Histórico
        const wsLogsName = workbook.SheetNames[1];
        const wsLogs = workbook.Sheets[wsLogsName];
        const logsData = XLSX.utils.sheet_to_json(wsLogs);
        
        if (!eqData || eqData.length === 0) {
          alert('A planilha de inventário está vazia ou no formato inválido.');
          return;
        }

        // Helper function to parse dates back to ISO strings
        const parseExcelDate = (dateStr) => {
          if (!dateStr || dateStr === '-') return null;
          // Format expected: "DD/MM/YYYY, HH:MM"
          const parts = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4}),\s*(\d{2}):(\d{2})$/);
          if (parts) {
            const [_, day, month, year, hour, minute] = parts;
            return new Date(year, month - 1, day, hour, minute).toISOString();
          }
          return new Date(dateStr).toISOString();
        };
        
        // Map back to equipment schema
        const parsedEquipment = eqData.map(row => ({
          id: row['ID'] || `eq-${Date.now()}-${Math.random()}`,
          name: row['Nome'] || 'Equipamento sem nome',
          category: row['Categoria'] || 'Outros',
          serialNumber: row['Número de Série'] || '',
          status: row['Status'] || 'Disponível',
          borrowerName: row['Responsável'] || null,
          loanDate: row['Data de Empréstimo'] ? parseExcelDate(row['Data de Empréstimo']) : null,
          expectedReturnDate: row['Devolução Prevista'] ? parseExcelDate(row['Devolução Prevista']) : null,
          description: row['Descrição / Observações'] || ''
        }));
        
        // Map back to logs schema
        const parsedLogs = (logsData || []).map(row => ({
          id: row['ID Log'] || `log-${Date.now()}-${Math.random()}`,
          timestamp: row['Data/Hora'] ? parseExcelDate(row['Data/Hora']) : new Date().toISOString(),
          equipmentId: row['Equipamento ID'] || '',
          equipmentName: row['Nome Equipamento'] || '',
          serialNumber: row['Número de Série'] || '',
          action: row['Ação'] === 'Saída' ? 'retirada' : 'devolucao',
          borrowerName: row['Responsável'] || 'Desconhecido',
          notes: row['Observações'] || ''
        }));
        
        onImportData(parsedEquipment, parsedLogs);
        alert('Planilha importada e carregada com sucesso!');
      } catch (err) {
        console.error(err);
        alert('Erro ao ler a planilha Excel. Verifique se o arquivo segue o formato de exportação padrão.');
      }
    };
    reader.readAsArrayBuffer(file);
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRelativeTimeString = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Agora mesmo'
    if (diffMins < 60) return `Há ${diffMins} min`
    if (diffHours < 24) return `Há ${diffHours} hora(s)`
    return `Há ${diffDays} dia(s)`
  }

  return (
    <div style={styles.dashboardContainer}>
      {/* Header */}
      <header style={styles.header} className="glass-panel">
        <div style={styles.headerBrand}>
          <img src={logo} alt="Logo Peixe Voador" style={styles.logoImageHeader} />
          <div>
            <h1 style={styles.headerTitle}>PEIXE VOADOR</h1>
            <span style={styles.headerSubtitle}>Controle de Equipamentos</span>
          </div>
        </div>

        <nav style={styles.nav}>
          <button 
            style={{...styles.navBtn, ...(activeTab === 'overview' ? styles.navActive : {})}}
            onClick={() => setActiveTab('overview')}
          >
            <FolderOpen size={16} /> Painel Geral
          </button>
          <button 
            style={{...styles.navBtn, ...(activeTab === 'inventory' ? styles.navActive : {})}}
            onClick={() => setActiveTab('inventory')}
          >
            <Sliders size={16} /> Inventário
          </button>
          <button 
            style={{...styles.navBtn, ...(activeTab === 'history' ? styles.navActive : {})}}
            onClick={() => setActiveTab('history')}
          >
            <History size={16} /> Histórico
          </button>
          <button 
            style={{...styles.navBtn, ...(activeTab === 'settings' ? styles.navActive : {})}}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={16} /> Configurações
          </button>
        </nav>

        <div style={styles.headerUser}>
          <span style={styles.userBadge}>Acesso Compartilhado</span>
          <button onClick={onLogout} style={styles.logoutBtn} title="Sair do painel">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={styles.main}>
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div style={styles.tabContent}>
            {/* Stat Cards */}
            <div style={styles.statsGrid}>
              <div className="glass-panel" style={styles.statCard}>
                <div style={styles.statHeader}>
                  <span style={styles.statTitle}>Total de Equipamentos</span>
                  <div style={{...styles.statIconCircle, background: 'rgba(255, 255, 255, 0.05)'}}>
                    <Sliders size={20} color="var(--text-secondary)" />
                  </div>
                </div>
                <div style={styles.statValue}>{totalCount}</div>
                <div style={styles.statDesc}>Itens registrados no acervo</div>
              </div>

              <div className="glass-panel" style={styles.statCard}>
                <div style={styles.statHeader}>
                  <span style={styles.statTitle}>Disponíveis para Uso</span>
                  <div style={{...styles.statIconCircle, background: 'rgba(16, 185, 129, 0.1)'}}>
                    <CheckCircle size={20} color="var(--color-success)" />
                  </div>
                </div>
                <div style={{...styles.statValue, color: 'var(--color-success)'}}>{availableCount}</div>
                <div style={styles.statDesc}>Livres para retirada imediata</div>
              </div>

              <div className="glass-panel" style={styles.statCard}>
                <div style={styles.statHeader}>
                  <span style={styles.statTitle}>Em Uso (Emprestados)</span>
                  <div style={{...styles.statIconCircle, background: 'rgba(245, 158, 11, 0.1)'}}>
                    <UserCheck size={20} color="var(--color-warning)" />
                  </div>
                </div>
                <div style={{...styles.statValue, color: 'var(--color-warning)'}}>{inUseCount}</div>
                <div style={styles.statDesc}>
                  {totalCount > 0 ? `${Math.round((inUseCount / totalCount) * 100)}%` : '0%'} do acervo movimentado
                </div>
              </div>

              <div className="glass-panel" style={styles.statCard}>
                <div style={styles.statHeader}>
                  <span style={styles.statTitle}>Em Atraso / Manutenção</span>
                  <div style={{...styles.statIconCircle, background: 'rgba(239, 68, 68, 0.1)'}}>
                    <Clock size={20} color="var(--color-danger)" />
                  </div>
                </div>
                <div style={{...styles.statValue, color: 'var(--color-danger)'}}>
                  {overdueCount + maintenanceCount}
                </div>
                <div style={styles.statDesc}>
                  {overdueCount} atrasado(s) • {maintenanceCount} em reparo
                </div>
              </div>
            </div>

            {/* Recent Log */}
            <div className="glass-panel" style={{...styles.overviewCard, width: '100%'}}>
              <h3 style={styles.cardTitle}>Atividade Recente</h3>
                <div style={styles.recentActivityList}>
                  {logs.length === 0 ? (
                    <div style={styles.emptyState}>Sem registros de atividades recentes.</div>
                  ) : (
                    logs.slice(-5).reverse().map((log) => (
                      <div key={log.id} style={styles.activityItem}>
                        <div style={{
                          ...styles.activityIndicator, 
                          backgroundColor: log.action === 'retirada' ? 'var(--color-warning)' : 'var(--color-success)'
                        }}></div>
                        <div style={styles.activityBody}>
                          <span style={styles.activityText}>
                            <strong>{log.borrowerName}</strong> {log.action === 'retirada' ? 'retirou' : 'devolveu'}{' '}
                            <span style={styles.activityEqName}>{log.equipmentName}</span>
                          </span>
                          <span style={styles.activityTime}>{getRelativeTimeString(log.timestamp)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
          </div>
        )}

        {/* TAB 2: INVENTORY */}
        {activeTab === 'inventory' && (
          <div style={styles.tabContent}>
            {/* Toolbar: Search, Filters, Add Button */}
            <div style={styles.toolbar}>
              <div style={styles.searchWrapper}>
                <Search size={18} style={styles.searchIcon} color="var(--text-muted)" />
                <input
                  type="text"
                  placeholder="Buscar por equipamento, número de série ou responsável..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={styles.searchInput}
                />
              </div>

              <div style={styles.filterGroup}>
                <div style={styles.selectWrapper}>
                  <Filter size={16} style={styles.selectIcon} color="var(--text-secondary)" />
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    style={styles.toolbarSelect}
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat === 'Todos' ? 'Todas Categorias' : cat}</option>
                    ))}
                  </select>
                </div>

                <div style={styles.selectWrapper}>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={styles.toolbarSelect}
                  >
                    <option value="Todos">Todos os Status</option>
                    <option value="Disponível">Disponíveis</option>
                    <option value="Em Uso">Em Uso</option>
                    <option value="Em Atraso">Atrasados</option>
                    <option value="Em Manutenção">Em Manutenção</option>
                  </select>
                </div>

                {isAdmin && (
                  <button 
                    className="btn btn-primary" 
                    onClick={() => { setSelectedEquipment(null); onAddEquipment(); }}
                  >
                    <Plus size={16} /> Cadastrar
                  </button>
                )}
              </div>
            </div>

            {/* Inventory List and People Registration */}
            <div style={styles.inventoryLayout}>
              {/* Left Column: Equipment Table */}
              <div className="glass-panel" style={{ ...styles.tableCard, flex: '2.5 1 650px', marginBottom: 0 }}>
                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Equipamento</th>
                        <th style={styles.th}>Categoria</th>
                        <th style={styles.th}>Identificador / Série</th>
                        <th style={styles.th}>Com quem está?</th>
                        <th style={styles.th}>Desde</th>
                        {isAdmin && <th style={{...styles.th, textAlign: 'right'}}>Ações</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEquipment.length === 0 ? (
                        <tr>
                          <td colSpan={isAdmin ? 6 : 5} style={styles.tdEmpty}>
                            Nenhum equipamento encontrado com os filtros aplicados.
                          </td>
                        </tr>
                      ) : (
                        filteredEquipment.map(eq => {
                          const isOverdue = eq.status === 'Em Uso' && eq.expectedReturnDate && new Date(eq.expectedReturnDate) < new Date()
                          return (
                            <tr key={eq.id} style={styles.tr}>
                              <td style={styles.td}>
                                <div style={styles.eqCellHeader}>
                                  <span style={styles.eqCellName}>{eq.name}</span>
                                  <span className={
                                    eq.status === 'Disponível' ? 'badge badge-available' : 
                                    eq.status === 'Em Uso' ? 'badge badge-inuse' : 
                                    'badge badge-maintenance'
                                  } style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                                    {eq.status}
                                  </span>
                                  {isOverdue && (
                                    <span style={styles.overdueBadge} title="Devolução pendente / atrasada!">
                                      Atrasado
                                    </span>
                                  )}
                                </div>
                                {eq.description && (
                                  <div style={styles.eqCellDesc}>{eq.description}</div>
                                )}
                              </td>
                              <td style={styles.td}>
                                <span style={styles.categoryLabel}>{eq.category}</span>
                              </td>
                              <td style={styles.td}>
                                <span style={styles.serialLabel}>{eq.serialNumber || '-'}</span>
                              </td>
                              <td style={styles.td}>
                                <select
                                  value={eq.status === 'Em Uso' ? eq.borrowerName : (eq.status === 'Em Manutenção' ? 'manutencao' : '')}
                                  onChange={(e) => {
                                    const val = e.target.value
                                    if (val === 'manutencao') {
                                      onQuickStatusChange(eq.id, 'Em Manutenção')
                                    } else if (val === '') {
                                      onQuickStatusChange(eq.id, 'Disponível')
                                    } else {
                                      onQuickStatusChange(eq.id, 'Em Uso', val)
                                    }
                                  }}
                                  style={{
                                    ...styles.selectInline,
                                    color: eq.status === 'Em Uso' ? 'var(--color-warning)' : (eq.status === 'Em Manutenção' ? '#fca5a5' : 'var(--color-success)'),
                                    borderColor: eq.status === 'Em Uso' ? 'rgba(245, 158, 11, 0.25)' : (eq.status === 'Em Manutenção' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(110, 185, 133, 0.25)')
                                  }}
                                  disabled={eq.status === 'Em Manutenção' && !isAdmin}
                                >
                                  <option value="" style={styles.option}>🟢 Disponível</option>
                                  {people.map(p => (
                                    <option key={p.id} value={p.name} style={styles.option}>
                                      👤 {p.name}
                                    </option>
                                  ))}
                                  <option value="manutencao" style={styles.option}>🔧 Em Manutenção</option>
                                </select>
                              </td>
                              <td style={styles.td}>
                                {eq.status === 'Em Uso' ? (
                                  <div style={styles.dateCell} title={formatDate(eq.loanDate)}>
                                    {formatDate(eq.loanDate)}
                                    {eq.expectedReturnDate && (
                                      <div style={{fontSize: '0.7rem', color: isOverdue ? '#ef4444' : 'var(--text-muted)'}}>
                                        Prev: {formatDate(eq.expectedReturnDate)}
                                      </div>
                                    )}
                                  </div>
                                ) : '-'}
                              </td>
                              {isAdmin && (
                                <td style={{...styles.td, textAlign: 'right'}}>
                                  <div style={styles.actionsWrapper}>
                                    <button 
                                      className="btn btn-secondary btn-icon" 
                                      onClick={() => onUpdateEquipment(eq)}
                                      title="Editar Cadastro"
                                    >
                                      <Edit3 size={15} />
                                    </button>
                                    <button 
                                      className="btn btn-danger btn-icon" 
                                      onClick={() => { if(confirm(`Deseja excluir ${eq.name}?`)) onDeleteEquipment(eq.id) }}
                                      title="Excluir"
                                    >
                                      <Trash2 size={15} />
                                    </button>
                                  </div>
                                </td>
                              )}
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Column: Actions & People */}
              <div style={styles.rightColumnLayout}>
                {/* Card 1: Ações Rápidas */}
                <div className="glass-panel" style={styles.peopleCard}>
                  <div style={styles.peopleHeader}>
                    <Sliders size={20} color="var(--color-primary)" />
                    <h3 style={styles.peopleTitle}>Ações Rápidas</h3>
                  </div>
                  <div style={styles.actionButtonsContainer}>
                    {isAdmin && (
                      <button 
                        className="btn btn-primary" 
                        onClick={() => { setSelectedEquipment(null); onAddEquipment(); }}
                        style={styles.rightActionBtn}
                      >
                        <Plus size={18} /> Novo Equipamento
                      </button>
                    )}
                    <button 
                      className="btn btn-secondary" 
                      onClick={() => setStatusFilter('Disponível')}
                      style={styles.rightActionBtn}
                    >
                      <Send size={16} /> Filtrar Disponíveis
                    </button>
                    <button 
                      className="btn btn-secondary" 
                      onClick={() => setStatusFilter('Em Uso')}
                      style={styles.rightActionBtn}
                    >
                      <RefreshCw size={16} /> Filtrar Em Uso
                    </button>
                  </div>
                </div>

                {/* Card 2: Cadastro de Pessoas */}
                <div className="glass-panel" style={styles.peopleCard}>
                  <div style={styles.peopleHeader}>
                    <Users size={20} color="var(--color-primary)" />
                    <h3 style={styles.peopleTitle}>Cadastro de Pessoas</h3>
                  </div>

                  {isAdmin ? (
                    <>
                      <p style={styles.peopleDesc}>
                        Cadastre as pessoas autorizadas a retirar equipamentos.
                      </p>

                      <form onSubmit={handleAddPersonSubmit} style={styles.peopleForm}>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Nome completo..."
                          value={newPersonName}
                          onChange={(e) => setNewPersonName(e.target.value)}
                          required
                          style={{ padding: '10px 12px', fontSize: '0.9rem', flex: 1 }}
                        />
                        <button type="submit" className="btn btn-primary" style={{ padding: '10px 14px' }} title="Cadastrar Responsável">
                          <UserPlus size={16} />
                        </button>
                      </form>
                    </>
                  ) : (
                    <div style={styles.adminRestrictionNotice}>
                      <Lock size={16} color="var(--text-muted)" style={{ minWidth: '16px' }} />
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Cadastro restrito a administradores.
                      </span>
                    </div>
                  )}

                  <div style={styles.peopleList}>
                    {people.length === 0 ? (
                      <div style={styles.peopleEmpty}>Nenhuma pessoa cadastrada.</div>
                    ) : (
                      people.map(person => {
                        const isAssigned = equipment.some(e => e.status === 'Em Uso' && e.borrowerName === person.name)
                        return (
                          <div key={person.id} style={styles.personItem}>
                            <span style={styles.personName} title={person.name}>{person.name}</span>
                            {isAssigned && (
                              <span style={styles.personBadge} title="Possui equipamentos em uso">
                                Em Uso
                              </span>
                            )}
                            {isAdmin && (
                              <button
                                type="button"
                                className="btn btn-secondary btn-icon"
                                onClick={() => onDeletePerson(person.id)}
                                style={styles.personDeleteBtn}
                                title={`Remover ${person.name}`}
                              >
                                <Trash2 size={13} color="#fca5a5" />
                              </button>
                            )}
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: HISTORY */}
        {activeTab === 'history' && (
          <div style={styles.tabContent}>
            {/* History Search & Toolbar */}
            <div style={styles.toolbar}>
              <div style={{...styles.searchWrapper, maxWidth: '400px'}}>
                <Search size={18} style={styles.searchIcon} color="var(--text-muted)" />
                <input
                  type="text"
                  placeholder="Buscar no histórico por equipamento ou pessoa..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  style={styles.searchInput}
                />
              </div>
              <div style={styles.toolbarInfo}>
                Mostrando {filteredLogs.length} registro(s) de movimentações.
              </div>
            </div>

            {/* History Table */}
            <div className="glass-panel" style={styles.tableCard}>
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Data & Hora</th>
                      <th style={styles.th}>Equipamento</th>
                      <th style={styles.th}>Nº de Série</th>
                      <th style={styles.th}>Movimentação</th>
                      <th style={styles.th}>Responsável</th>
                      <th style={styles.th}>Observações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={styles.tdEmpty}>
                          Nenhum registro de movimentação encontrado.
                        </td>
                      </tr>
                    ) : (
                      filteredLogs.map(log => (
                        <tr key={log.id} style={styles.tr}>
                          <td style={{...styles.td, whiteSpace: 'nowrap'}}>
                            {formatDate(log.timestamp)}
                          </td>
                          <td style={styles.td}>
                            <strong>{log.equipmentName}</strong>
                          </td>
                          <td style={styles.td}>
                            <span style={styles.serialLabel}>{log.serialNumber || '-'}</span>
                          </td>
                          <td style={styles.td}>
                            <span style={{
                              ...styles.historyActionBadge,
                              color: log.action === 'retirada' ? 'var(--color-warning)' : 'var(--color-success)',
                              backgroundColor: log.action === 'retirada' ? 'var(--color-warning-bg)' : 'var(--color-success-bg)',
                              border: `1px solid ${log.action === 'retirada' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`
                            }}>
                              {log.action === 'retirada' ? 'Saída' : 'Devolução'}
                            </span>
                          </td>
                          <td style={styles.td}>
                            <strong>{log.borrowerName}</strong>
                          </td>
                          <td style={styles.td}>
                            <span style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>
                              {log.notes || '-'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SETTINGS */}
        {activeTab === 'settings' && (
          <div style={{...styles.tabContent, maxWidth: '800px', margin: '0 auto'}}>
            <div style={styles.settingsGrid}>
              
              {/* Change Password Block */}
              {isAdmin && (
                <div className="glass-panel" style={styles.settingsCard}>
                  <h3 style={styles.cardTitle}>Senha do Painel Compartilhado</h3>
                  <p style={styles.cardDescription}>
                    A senha é única e compartilhada com todos os usuários dos equipamentos. A alteração afeta o próximo login.
                  </p>

                  <form onSubmit={handlePasswordChange} style={{marginTop: '20px'}}>
                    <div className="form-group">
                      <label htmlFor="currentPass">Senha Atual</label>
                      <input
                        type="password"
                        id="currentPass"
                        className="form-input"
                        required
                        value={passwordForm.current}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, current: e.target.value }))}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="newPass">Nova Senha Compartilhada</label>
                      <input
                        type="password"
                        id="newPass"
                        className="form-input"
                        required
                        value={passwordForm.newPass}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, newPass: e.target.value }))}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="confirmPass">Confirmar Nova Senha</label>
                      <input
                        type="password"
                        id="confirmPass"
                        className="form-input"
                        required
                        value={passwordForm.confirm}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, confirm: e.target.value }))}
                      />
                    </div>

                    {passwordMsg.text && (
                      <div style={{
                        ...styles.msgBox,
                        color: passwordMsg.type === 'success' ? '#34d399' : '#f87171',
                        background: passwordMsg.type === 'success' ? 'rgba(52, 211, 153, 0.1)' : 'rgba(248, 113, 113, 0.1)',
                        border: `1px solid ${passwordMsg.type === 'success' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(248, 113, 113, 0.2)'}`
                      }}>
                        {passwordMsg.text}
                      </div>
                    )}

                    <button type="submit" className="btn btn-primary" style={{marginTop: '10px'}}>
                      Atualizar Senha
                    </button>
                  </form>
                </div>
              )}

              {/* Change Admin Password Block (Admin Only) */}
              {isAdmin && (
                <div className="glass-panel" style={styles.settingsCard}>
                  <h3 style={styles.cardTitle}>Senha do Administrador</h3>
                  <p style={styles.cardDescription}>
                    Altere a senha de acesso administrativo ao painel.
                  </p>

                  <form onSubmit={handleAdminPasswordChange} style={{marginTop: '20px'}}>
                    <div className="form-group">
                      <label htmlFor="currentAdminPass">Senha Atual do Administrador</label>
                      <input
                        type="password"
                        id="currentAdminPass"
                        className="form-input"
                        required
                        value={adminPasswordForm.current}
                        onChange={(e) => setAdminPasswordForm(prev => ({ ...prev, current: e.target.value }))}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="newAdminPass">Nova Senha do Administrador</label>
                      <input
                        type="password"
                        id="newAdminPass"
                        className="form-input"
                        required
                        value={adminPasswordForm.newPass}
                        onChange={(e) => setAdminPasswordForm(prev => ({ ...prev, newPass: e.target.value }))}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="confirmAdminPass">Confirmar Nova Senha</label>
                      <input
                        type="password"
                        id="confirmAdminPass"
                        className="form-input"
                        required
                        value={adminPasswordForm.confirm}
                        onChange={(e) => setAdminPasswordForm(prev => ({ ...prev, confirm: e.target.value }))}
                      />
                    </div>

                    {adminPasswordMsg.text && (
                      <div style={{
                        ...styles.msgBox,
                        color: adminPasswordMsg.type === 'success' ? '#34d399' : '#f87171',
                        background: adminPasswordMsg.type === 'success' ? 'rgba(52, 211, 153, 0.1)' : 'rgba(248, 113, 113, 0.1)',
                        border: `1px solid ${adminPasswordMsg.type === 'success' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(248, 113, 113, 0.2)'}`
                      }}>
                        {adminPasswordMsg.text}
                      </div>
                    )}

                    <button type="submit" className="btn btn-primary" style={{marginTop: '10px'}}>
                      Atualizar Senha Admin
                    </button>
                  </form>
                </div>
              )}

              {/* Data Backup & Restore Block */}
              <div className="glass-panel" style={styles.settingsCard}>
                <h3 style={styles.cardTitle}>Dados & Backup</h3>
                <p style={styles.cardDescription}>
                  Como os dados ficam armazenados localmente neste navegador, faça backups regulares para não perder seus dados.
                </p>

                <div style={styles.backupActions}>
                  <div style={styles.backupRow}>
                    <div>
                      <h4 style={styles.backupActionTitle}>Exportar Relatório Excel</h4>
                      <p style={styles.backupActionDesc}>Baixe a planilha organizada (.xlsx) com o inventário e histórico.</p>
                    </div>
                    <button className="btn btn-secondary" onClick={handleExcelExport} style={styles.backupBtn}>
                      <FileDown size={18} /> Exportar Excel
                    </button>
                  </div>

                  <div style={styles.backupRow}>
                    <div>
                      <h4 style={styles.backupActionTitle}>Importar Relatório Excel</h4>
                      <p style={styles.backupActionDesc}>Substitua os dados atuais por uma planilha do Excel (.xlsx).</p>
                    </div>
                    <label className="btn btn-secondary" style={{...styles.backupBtn, cursor: 'pointer'}}>
                      <FileUp size={18} /> Importar Excel
                      <input
                        type="file"
                        accept=".xlsx, .xls"
                        onChange={handleExcelImport}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>

                  <div style={styles.backupRow}>
                    <div>
                      <h4 style={styles.backupActionTitle}>Backup Completo (JSON)</h4>
                      <p style={styles.backupActionDesc}>Exportar/importar dados brutos no formato de backup técnico JSON.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-secondary" onClick={handleBackupExport} style={{ padding: '8px 12px', fontSize: '0.85rem' }}>
                        <FileDown size={16} /> Exportar JSON
                      </button>
                      <label className="btn btn-secondary" style={{ padding: '8px 12px', fontSize: '0.85rem', cursor: 'pointer' }}>
                        <FileUp size={16} /> Importar JSON
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleBackupImport}
                          style={{ display: 'none' }}
                        />
                      </label>
                    </div>
                  </div>

                  <hr style={styles.divider} />

                  <div style={styles.backupRow}>
                    <div>
                      <h4 style={{...styles.backupActionTitle, color: 'var(--color-primary)'}}>Carregar Dados Fictícios</h4>
                      <p style={styles.backupActionDesc}>Preenche o sistema com equipamentos de teste e histórico simulado.</p>
                    </div>
                    <button className="btn btn-secondary" onClick={() => {if(confirm('Carregar dados simulados irá substituir todo o banco de dados atual. Deseja continuar?')) onLoadMockData()}} style={styles.backupBtn}>
                      Carregar Demo
                    </button>
                  </div>

                  <div style={styles.backupRow}>
                    <div>
                      <h4 style={{...styles.backupActionTitle, color: '#f87171'}}>Limpar Banco de Dados</h4>
                      <p style={styles.backupActionDesc}>Apaga permanentemente todos os equipamentos e histórico.</p>
                    </div>
                    <button className="btn btn-danger" onClick={() => {if(confirm('ATENÇÃO: Isso apagará permanentemente todos os seus dados. Deseja prosseguir?')) onClearAllData()}} style={styles.backupBtn}>
                      <Trash2 size={18} /> Limpar Tudo
                    </button>
                  </div>

                </div>
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  )
}

const styles = {
  dashboardContainer: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    width: '100%',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 30px',
    margin: '20px 20px 0 20px',
    borderRadius: '16px',
    zIndex: 10,
    flexWrap: 'wrap',
    gap: '20px',
  },
  headerBrand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logoImageHeader: {
    height: '42px',
    width: 'auto',
    objectFit: 'contain',
  },
  headerTitle: {
    fontFamily: 'var(--font-heading)',
    fontSize: '1.25rem',
    fontWeight: '800',
    letterSpacing: '0.05em',
    color: '#ffffff',
    lineHeight: 1,
  },
  headerSubtitle: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
  },
  nav: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  navBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-secondary)',
    padding: '8px 16px',
    borderRadius: '8px',
    fontFamily: 'var(--font-heading)',
    fontWeight: '600',
    fontSize: '0.9rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s',
  },
  navActive: {
    background: 'rgba(168, 85, 247, 0.1)',
    color: 'var(--color-primary-hover)',
    border: '1px solid rgba(168, 85, 247, 0.2)',
  },
  headerUser: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  userBadge: {
    fontSize: '0.75rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    padding: '4px 10px',
    borderRadius: '20px',
    color: 'var(--text-secondary)',
  },
  logoutBtn: {
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    color: '#fca5a5',
    padding: '8px',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },
  main: {
    flex: 1,
    padding: '24px 20px',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    maxWidth: '1440px',
    margin: '0 auto',
  },
  tabContent: {
    width: '100%',
    animation: 'fadeIn 0.3s ease',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
  },
  statCard: {
    padding: '24px',
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
  },
  statHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
  },
  statTitle: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  statIconCircle: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontFamily: 'var(--font-heading)',
    fontSize: '2.25rem',
    fontWeight: '700',
    color: '#ffffff',
    lineHeight: 1,
    marginBottom: '8px',
  },
  statDesc: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  overviewGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    flexWrap: 'wrap',
  },
  // If screens are small, wrap overviewGrid: handled by CSS or flex, we'll keep grid with auto-fit or flex
  '@media (max-width: 800px)': {
    overviewGrid: {
      gridTemplateColumns: '1fr',
    }
  },
  overviewCard: {
    padding: '30px',
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
  },
  cardTitle: {
    fontFamily: 'var(--font-heading)',
    fontSize: '1.2rem',
    fontWeight: '700',
    marginBottom: '20px',
    color: '#ffffff',
  },
  cardDescription: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    marginBottom: '15px',
  },
  actionButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '20px',
  },
  actionBtn: {
    width: '100%',
    padding: '14px',
    justifyContent: 'flex-start',
  },
  quickInfoBox: {
    background: 'rgba(6, 182, 212, 0.05)',
    border: '1px solid rgba(6, 182, 212, 0.15)',
    borderRadius: '10px',
    padding: '14px',
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-start',
  },
  recentActivityList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    flex: 1,
  },
  emptyState: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    color: 'var(--text-muted)',
    fontSize: '0.9rem',
    border: '1px dashed rgba(255,255,255,0.05)',
    borderRadius: '10px',
    padding: '30px',
  },
  activityItem: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
  },
  activityIndicator: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    marginTop: '6px',
  },
  activityBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  activityText: {
    fontSize: '0.9rem',
    color: 'var(--text-primary)',
  },
  activityEqName: {
    color: 'var(--color-primary-hover)',
    fontWeight: '500',
  },
  activityTime: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  searchWrapper: {
    position: 'relative',
    flex: 1,
    minWidth: '280px',
  },
  searchIcon: {
    position: 'absolute',
    left: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
  },
  searchInput: {
    width: '100%',
    background: 'rgba(22, 20, 31, 0.5)',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    padding: '10px 16px 10px 44px',
    color: 'var(--text-primary)',
    fontSize: '0.9rem',
  },
  filterGroup: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  selectWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  selectIcon: {
    position: 'absolute',
    left: '12px',
    pointerEvents: 'none',
  },
  toolbarSelect: {
    background: 'rgba(22, 20, 31, 0.5)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-primary)',
    borderRadius: '10px',
    padding: '10px 16px',
    paddingLeft: '36px',
    fontSize: '0.9rem',
    cursor: 'pointer',
    appearance: 'none',
    backgroundPosition: 'right 12px center',
    backgroundRepeat: 'no-repeat',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%25239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
    backgroundSize: '12px',
    paddingRight: '32px',
  },
  tableCard: {
    borderRadius: '16px',
    overflow: 'hidden',
  },
  tableWrapper: {
    overflowX: 'auto',
    width: '100%',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '0.9rem',
  },
  th: {
    background: 'rgba(10, 10, 15, 0.4)',
    color: 'var(--text-secondary)',
    fontWeight: '600',
    padding: '16px 20px',
    borderBottom: '1px solid var(--border-color)',
    fontFamily: 'var(--font-heading)',
  },
  tr: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
    transition: 'background-color 0.2s',
  },
  'tr:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
  },
  td: {
    padding: '16px 20px',
    verticalAlign: 'middle',
  },
  tdEmpty: {
    padding: '40px',
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '0.95rem',
  },
  eqCellName: {
    fontWeight: '700',
    color: '#ffffff',
  },
  eqCellDesc: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    marginTop: '2px',
    maxWidth: '250px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  categoryLabel: {
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    padding: '3px 8px',
    borderRadius: '6px',
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
  },
  serialLabel: {
    fontFamily: 'monospace',
    color: 'var(--text-secondary)',
    fontSize: '0.85rem',
  },
  borrowerCell: {
    fontSize: '0.9rem',
    color: 'var(--text-primary)',
  },
  dateCell: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
  },
  overdueBadge: {
    marginLeft: '6px',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#ef4444',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '0.7rem',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  actionsWrapper: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
  },
  actionRowBtn: {
    padding: '6px 12px',
    fontSize: '0.8rem',
    background: 'rgba(168, 85, 247, 0.08)',
    border: '1px solid rgba(168, 85, 247, 0.2)',
  },
  actionRowBtnDone: {
    padding: '6px 12px',
    fontSize: '0.8rem',
    background: 'rgba(16, 185, 129, 0.08)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
  },
  btnLabelInline: {
    marginLeft: '4px',
    fontFamily: 'var(--font-heading)',
    fontWeight: '600',
  },
  toolbarInfo: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
  },
  historyActionBadge: {
    padding: '3px 8px',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  settingsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  settingsCard: {
    padding: '30px',
    borderRadius: '16px',
  },
  settingsCardRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '20px',
    flexWrap: 'wrap',
  },
  backupActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    marginTop: '24px',
  },
  backupRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '20px',
    padding: '16px 0',
    borderBottom: '1px solid rgba(255,255,255,0.03)',
    flexWrap: 'wrap',
  },
  backupActionTitle: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#ffffff',
  },
  backupActionDesc: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    marginTop: '2px',
  },
  backupBtn: {
    minWidth: '150px',
  },
  divider: {
    border: 'none',
    borderBottom: '1px solid var(--border-color)',
    margin: '10px 0',
  },
  msgBox: {
    padding: '12px',
    borderRadius: '10px',
    fontSize: '0.85rem',
    marginBottom: '15px',
    textAlign: 'center',
  },
  inventoryLayout: {
    display: 'flex',
    gap: '20px',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    width: '100%',
  },
  peopleCard: {
    flex: '1 1 300px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  peopleHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  peopleTitle: {
    fontFamily: 'var(--font-heading)',
    fontSize: '1.2rem',
    fontWeight: '700',
    color: '#ffffff',
  },
  peopleDesc: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.4',
  },
  peopleForm: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  peopleList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    maxHeight: '320px',
    overflowY: 'auto',
    marginTop: '8px',
    paddingRight: '4px',
  },
  peopleEmpty: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    textAlign: 'center',
    padding: '20px',
    border: '1px dashed rgba(255, 255, 255, 0.05)',
    borderRadius: '10px',
  },
  personItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '8px',
    transition: 'background 0.2s',
  },
  personName: {
    fontSize: '0.85rem',
    fontWeight: '500',
    color: '#ffffff',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    flex: 1,
  },
  personBadge: {
    fontSize: '0.7rem',
    fontWeight: '700',
    color: 'var(--color-warning)',
    background: 'var(--color-warning-bg)',
    border: '1px solid rgba(245, 158, 11, 0.2)',
    padding: '2px 6px',
    borderRadius: '4px',
    textTransform: 'uppercase',
  },
  personDeleteBtn: {
    padding: '4px',
    borderRadius: '6px',
    background: 'rgba(239, 68, 68, 0.05)',
    border: '1px solid rgba(239, 68, 68, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  rightColumnLayout: {
    flex: '1 1 300px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  actionButtonsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginTop: '6px',
  },
  rightActionBtn: {
    width: '100%',
    padding: '10px 14px',
    justifyContent: 'flex-start',
    fontSize: '0.85rem',
  },
  adminRestrictionNotice: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px dashed rgba(255, 255, 255, 0.08)',
    borderRadius: '10px',
    padding: '12px 14px',
    marginBottom: '4px',
  },
  selectInline: {
    background: 'rgba(22, 20, 31, 0.5)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '6px 10px',
    fontSize: '0.85rem',
    cursor: 'pointer',
    appearance: 'none',
    backgroundPosition: 'right 10px center',
    backgroundRepeat: 'no-repeat',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%25239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
    backgroundSize: '12px',
    paddingRight: '28px',
    fontFamily: 'var(--font-body)',
    width: '100%',
    minWidth: '160px',
    maxWidth: '220px',
    fontWeight: '600',
    transition: 'all 0.2s',
  },
  eqCellHeader: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '4px',
  }
}
