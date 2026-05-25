import React, { useState, useEffect } from 'react'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import EquipmentModal from './components/EquipmentModal'
import LoanModal from './components/LoanModal'

// Default mock data for testing and initial empty database population
const MOCK_EQUIPMENT = [
  {
    id: 'eq-1',
    name: 'Câmera Sony FX3 Full-Frame Cinema',
    category: 'Câmeras',
    serialNumber: 'SN-FX3-4581',
    description: 'Acompanha gaiola SmallRig, 2 baterias NP-FZ100 e cartão CFexpress de 160GB.',
    status: 'Disponível',
    borrowerName: null,
    loanDate: null,
    expectedReturnDate: null
  },
  {
    id: 'eq-2',
    name: 'Câmera Canon EOS R5 C',
    category: 'Câmeras',
    serialNumber: 'SN-R5C-0029',
    description: 'Acompanha adaptador EF-EOS R, 3 baterias LP-E6NH e carregador duplo.',
    status: 'Em Uso',
    borrowerName: 'Bruno Rodrigues',
    loanDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    expectedReturnDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // in 3 days
    notes: 'Gravação do videoclipe na locação da represa.'
  },
  {
    id: 'eq-3',
    name: 'Lente Sony FE 24-70mm f/2.8 GM II',
    category: 'Lentes',
    serialNumber: 'SN-L2470-9831',
    description: 'Acompanha para-sol original e filtro UV Pro de 82mm.',
    status: 'Disponível',
    borrowerName: null,
    loanDate: null,
    expectedReturnDate: null
  },
  {
    id: 'eq-4',
    name: 'Lente Canon RF 50mm f/1.2 L USM',
    category: 'Lentes',
    serialNumber: 'SN-L50-1092',
    description: 'Lente prime ultraclara. Acompanha tampas traseira e frontal.',
    status: 'Em Uso',
    borrowerName: 'Bruno Rodrigues',
    loanDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    expectedReturnDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Gravação do videoclipe na locação da represa.'
  },
  {
    id: 'eq-5',
    name: 'Iluminador LED Aputure LS 300d II V-Mount',
    category: 'Iluminação',
    serialNumber: 'SN-AP300-8812',
    description: 'Refletor COB de alta potência. Acompanha bolsa de transporte, cabo de força e controle.',
    status: 'Disponível',
    borrowerName: null,
    loanDate: null,
    expectedReturnDate: null
  },
  {
    id: 'eq-6',
    name: 'Microfone Shotgun Sennheiser MKH416',
    category: 'Áudio',
    serialNumber: 'SN-SEN-5541',
    description: 'Microfone de estúdio/externo. Apresenta chiado intermitente no cabo XLR original.',
    status: 'Em Manutenção',
    borrowerName: null,
    loanDate: null,
    expectedReturnDate: null
  },
  {
    id: 'eq-7',
    name: 'Gravador Digital de Áudio Zoom H6',
    category: 'Áudio',
    serialNumber: 'SN-ZOOM-7732',
    description: 'Gravador de 6 canais. Acompanha cápsula XY e estojo de acrílico.',
    status: 'Disponível',
    borrowerName: null,
    loanDate: null,
    expectedReturnDate: null
  },
  {
    id: 'eq-8',
    name: 'Tripé Hidráulico Manfrotto 504HD + 546B',
    category: 'Estabilizadores & Tripés',
    serialNumber: 'SN-MAN-1102',
    description: 'Tripé robusto de alumínio com cabeça fluida para até 12kg.',
    status: 'Disponível',
    borrowerName: null,
    loanDate: null,
    expectedReturnDate: null
  },
  {
    id: 'eq-9',
    name: 'Kit Bastão de LED Nanlite Pavotube II 30C (2 tubos)',
    category: 'Iluminação',
    serialNumber: 'SN-Pavo-3344',
    description: 'Tubos de LED RGBWW com bateria integrada. Acompanha clipes de montagem e carregador.',
    status: 'Em Uso',
    borrowerName: 'Clara Souza',
    loanDate: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    expectedReturnDate: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // in 4 hours
    notes: 'Ensaio fotográfico de moda no estúdio B.'
  }
]

const MOCK_LOGS = [
  {
    id: 'log-1',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    equipmentId: 'eq-2',
    equipmentName: 'Câmera Canon EOS R5 C',
    serialNumber: 'SN-R5C-0029',
    action: 'retirada',
    borrowerName: 'Bruno Rodrigues',
    notes: 'Gravação do videoclipe na locação da represa.'
  },
  {
    id: 'log-2',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    equipmentId: 'eq-4',
    equipmentName: 'Lente Canon RF 50mm f/1.2 L USM',
    serialNumber: 'SN-L50-1092',
    action: 'retirada',
    borrowerName: 'Bruno Rodrigues',
    notes: 'Gravação do videoclipe na locação da represa.'
  },
  {
    id: 'log-3',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    equipmentId: 'eq-9',
    equipmentName: 'Kit Bastão de LED Nanlite Pavotube II 30C (2 tubos)',
    serialNumber: 'SN-Pavo-3344',
    action: 'retirada',
    borrowerName: 'Clara Souza',
    notes: 'Ensaio fotográfico de moda no estúdio B.'
  }
]

export default function App() {
  // Login Session
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [sharedPassword, setSharedPassword] = useState('producao2026')

  // Database
  const [equipment, setEquipment] = useState([])
  const [logs, setLogs] = useState([])

  // Modal Controls
  const [isEqModalOpen, setIsEqModalOpen] = useState(false)
  const [equipmentToEdit, setEquipmentToEdit] = useState(null)
  
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false)
  const [equipmentForLoan, setEquipmentForLoan] = useState(null)

  // 1. Initial Load from LocalStorage
  useEffect(() => {
    // Loaded shared password
    const savedPassword = localStorage.getItem('peixevoador_shared_password')
    if (savedPassword) {
      setSharedPassword(savedPassword)
    } else {
      localStorage.setItem('peixevoador_shared_password', 'producao2026')
    }

    // Checked if session is active
    const activeSession = sessionStorage.getItem('peixevoador_session_active')
    if (activeSession === 'true') {
      setIsLoggedIn(true)
    }

    // Loaded Equipment
    const savedEquipment = localStorage.getItem('peixevoador_equipment')
    const savedLogs = localStorage.getItem('peixevoador_logs')

    if (savedEquipment) {
      setEquipment(JSON.parse(savedEquipment))
    } else {
      // First time use, load mock data for demonstration
      setEquipment(MOCK_EQUIPMENT)
      localStorage.setItem('peixevoador_equipment', JSON.stringify(MOCK_EQUIPMENT))
    }

    if (savedLogs) {
      setLogs(JSON.parse(savedLogs))
    } else {
      setLogs(MOCK_LOGS)
      localStorage.setItem('peixevoador_logs', JSON.stringify(MOCK_LOGS))
    }
  }, [])

  // Write database updates to localStorage
  const updateEquipmentList = (newEquipment) => {
    setEquipment(newEquipment)
    localStorage.setItem('peixevoador_equipment', JSON.stringify(newEquipment))
  }

  const updateLogsList = (newLogs) => {
    setLogs(newLogs)
    localStorage.setItem('peixevoador_logs', JSON.stringify(newLogs))
  }

  // 2. Auth Actions
  const handleLogin = () => {
    setIsLoggedIn(true)
    sessionStorage.setItem('peixevoador_session_active', 'true')
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    sessionStorage.removeItem('peixevoador_session_active')
  }

  const handleChangePassword = (currentPass, newPass) => {
    if (currentPass === sharedPassword) {
      setSharedPassword(newPass)
      localStorage.setItem('peixevoador_shared_password', newPass)
      return true
    }
    return false
  }

  // 3. Equipment CRUD Actions
  const handleOpenAddModal = () => {
    setEquipmentToEdit(null)
    setIsEqModalOpen(true)
  }

  const handleOpenEditModal = (eq) => {
    setEquipmentToEdit(eq)
    setIsEqModalOpen(true)
  }

  const handleSaveEquipment = (formData) => {
    if (equipmentToEdit) {
      // Editing Mode
      const updated = equipment.map(e => {
        if (e.id === equipmentToEdit.id) {
          // If status changes to Available, clear borrower fields
          const statusChanged = e.status !== formData.status
          return {
            ...e,
            ...formData,
            borrowerName: formData.status === 'Disponível' || formData.status === 'Em Manutenção' ? null : e.borrowerName,
            loanDate: formData.status === 'Disponível' || formData.status === 'Em Manutenção' ? null : e.loanDate,
            expectedReturnDate: formData.status === 'Disponível' || formData.status === 'Em Manutenção' ? null : e.expectedReturnDate,
            notes: formData.status === 'Disponível' || formData.status === 'Em Manutenção' ? null : e.notes
          }
        }
        return e
      })

      // If status manually changed from "Em Uso" to "Disponível" or "Em Manutenção", log it as a return
      if (equipmentToEdit.status === 'Em Uso' && (formData.status === 'Disponível' || formData.status === 'Em Manutenção')) {
        const returnLog = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          equipmentId: equipmentToEdit.id,
          equipmentName: equipmentToEdit.name,
          serialNumber: equipmentToEdit.serialNumber,
          action: 'devolucao',
          borrowerName: equipmentToEdit.borrowerName || 'Sistema/Administrador',
          notes: 'Devolução registrada via edição de status.'
        }
        updateLogsList([...logs, returnLog])
      }

      updateEquipmentList(updated)
    } else {
      // Creating Mode
      const newEq = {
        id: `eq-${Date.now()}`,
        ...formData,
        borrowerName: null,
        loanDate: null,
        expectedReturnDate: null
      }
      updateEquipmentList([...equipment, newEq])
    }
    setIsEqModalOpen(false)
  }

  const handleDeleteEquipment = (id) => {
    const updated = equipment.filter(e => e.id !== id)
    updateEquipmentList(updated)
  }

  // 4. Loan System Actions
  const handleOpenLoanModal = (eq) => {
    setEquipmentForLoan(eq)
    setIsLoanModalOpen(true)
  }

  const handleConfirmLoan = (loanData) => {
    if (!equipmentForLoan) return

    // Update equipment status
    const updated = equipment.map(e => {
      if (e.id === equipmentForLoan.id) {
        return {
          ...e,
          status: 'Em Uso',
          borrowerName: loanData.borrowerName,
          loanDate: loanData.loanDate,
          expectedReturnDate: loanData.expectedReturnDate,
          notes: loanData.notes
        }
      }
      return e
    })

    // Log the transaction
    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: loanData.loanDate,
      equipmentId: equipmentForLoan.id,
      equipmentName: equipmentForLoan.name,
      serialNumber: equipmentForLoan.serialNumber,
      action: 'retirada',
      borrowerName: loanData.borrowerName,
      notes: loanData.notes
    }

    updateEquipmentList(updated)
    updateLogsList([...logs, newLog])
    setIsLoanModalOpen(false)
  }

  const handleReturnEquipment = (id) => {
    const targetEq = equipment.find(e => e.id === id)
    if (!targetEq) return

    // Update status to available and clear lender info
    const updated = equipment.map(e => {
      if (e.id === id) {
        return {
          ...e,
          status: 'Disponível',
          borrowerName: null,
          loanDate: null,
          expectedReturnDate: null,
          notes: null
        }
      }
      return e
    })

    // Log return transaction
    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      equipmentId: id,
      equipmentName: targetEq.name,
      serialNumber: targetEq.serialNumber,
      action: 'devolucao',
      borrowerName: targetEq.borrowerName || 'Sem nome registrado',
      notes: 'Equipamento devolvido e verificado como OK.'
    }

    updateEquipmentList(updated)
    updateLogsList([...logs, newLog])
  }

  // 5. Database Management Actions
  const handleImportData = (importedEq, importedLogs) => {
    updateEquipmentList(importedEq)
    updateLogsList(importedLogs)
  }

  const handleLoadMockData = () => {
    updateEquipmentList(MOCK_EQUIPMENT)
    updateLogsList(MOCK_LOGS)
  }

  const handleClearAllData = () => {
    updateEquipmentList([])
    updateLogsList([])
  }

  return (
    <>
      {/* Background Ambience */}
      <div className="ambient-glow-1"></div>
      <div className="ambient-glow-2"></div>

      {isLoggedIn ? (
        <Dashboard
          onLogout={handleLogout}
          equipment={equipment}
          logs={logs}
          onAddEquipment={handleOpenAddModal}
          onUpdateEquipment={handleOpenEditModal}
          onDeleteEquipment={handleDeleteEquipment}
          onLendEquipment={handleOpenLoanModal}
          onReturnEquipment={handleReturnEquipment}
          onChangePassword={handleChangePassword}
          onImportData={handleImportData}
          onLoadMockData={handleLoadMockData}
          onClearAllData={handleClearAllData}
        />
      ) : (
        <Login onLogin={handleLogin} sharedPassword={sharedPassword} />
      )}

      {/* Equipment Register / Edit Modal */}
      <EquipmentModal
        isOpen={isEqModalOpen}
        onClose={() => setIsEqModalOpen(false)}
        onSave={handleSaveEquipment}
        equipmentToEdit={equipmentToEdit}
      />

      {/* Loan Direction Modal */}
      <LoanModal
        isOpen={isLoanModalOpen}
        onClose={() => setIsLoanModalOpen(false)}
        onConfirm={handleConfirmLoan}
        equipment={equipmentForLoan}
      />
    </>
  )
}
