import React, { useState, useEffect } from 'react'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import EquipmentModal from './components/EquipmentModal'
import LoanModal from './components/LoanModal'

const MOCK_PEOPLE = [
  { id: 'p-1', name: 'Amanda Silva' },
  { id: 'p-2', name: 'Bruno Rodrigues' },
  { id: 'p-3', name: 'Clara Souza' },
  { id: 'p-4', name: 'Diego Santos' },
  { id: 'p-5', name: 'Mariana Costa' }
]

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
  const [isAdmin, setIsAdmin] = useState(false)
  const [sharedPassword, setSharedPassword] = useState('producao2026')
  const [adminPassword, setAdminPassword] = useState('admin2026')

  // Database
  const [equipment, setEquipment] = useState([])
  const [logs, setLogs] = useState([])
  const [people, setPeople] = useState([])
  const [supabaseActive, setSupabaseActive] = useState(false)
  const [dbDiagnostics, setDbDiagnostics] = useState({
    status: 'Desconectado',
    equipmentTable: 'Não testado',
    logsTable: 'Não testado',
    peopleTable: 'Não testado',
    settingsTable: 'Não testado',
    lastError: null
  })

  // Modal Controls
  const [isEqModalOpen, setIsEqModalOpen] = useState(false)
  const [equipmentToEdit, setEquipmentToEdit] = useState(null)
  
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false)
  const [equipmentForLoan, setEquipmentForLoan] = useState(null)

  // 1. Initial Load and Polling loop
  useEffect(() => {
    // Loaded shared password from local storage as initial cache
    const savedPassword = localStorage.getItem('peixevoador_shared_password')
    if (savedPassword) {
      setSharedPassword(savedPassword)
    } else {
      localStorage.setItem('peixevoador_shared_password', 'producao2026')
    }

    // Checked if session is active and not expired
    const INACTIVITY_TIMEOUT = 30 * 60 * 1000 // 30 minutes in ms
    const activeSession = localStorage.getItem('peixevoador_session_active')
    const lastActivity = localStorage.getItem('peixevoador_last_activity')
    
    if (activeSession === 'true' && lastActivity) {
      const diff = Date.now() - parseInt(lastActivity, 10)
      if (diff <= INACTIVITY_TIMEOUT) {
        setIsLoggedIn(true)
        const adminSession = localStorage.getItem('peixevoador_session_admin')
        setIsAdmin(adminSession === 'true')
        localStorage.setItem('peixevoador_last_activity', Date.now().toString())
      } else {
        localStorage.removeItem('peixevoador_session_active')
        localStorage.removeItem('peixevoador_session_admin')
        localStorage.removeItem('peixevoador_last_activity')
      }
    }

    const savedAdminPassword = localStorage.getItem('peixevoador_admin_password')
    if (savedAdminPassword) {
      setAdminPassword(savedAdminPassword)
    } else {
      localStorage.setItem('peixevoador_admin_password', 'admin2026')
    }

    const fetchAllData = async () => {
      try {
        setDbDiagnostics(prev => ({
          ...prev,
          status: 'Conectado (Atualizando...)',
          lastError: null
        }))

        // Fetch Equipment
        const resEq = await fetch('/api/equipment')
        if (!resEq.ok) throw new Error(`Erro ao buscar equipamentos: ${resEq.statusText}`)
        const dataEq = await resEq.json()
        setEquipment(dataEq)
        localStorage.setItem('peixevoador_equipment', JSON.stringify(dataEq))
        setDbDiagnostics(prev => ({ ...prev, equipmentTable: `OK (${dataEq.length} registros)` }))

        // Fetch Logs
        const resLogs = await fetch('/api/logs')
        if (!resLogs.ok) throw new Error(`Erro ao buscar logs: ${resLogs.statusText}`)
        const dataLogs = await resLogs.json()
        setLogs(dataLogs)
        localStorage.setItem('peixevoador_logs', JSON.stringify(dataLogs))
        setDbDiagnostics(prev => ({ ...prev, logsTable: `OK (${dataLogs.length} registros)` }))

        // Fetch People
        const resPeople = await fetch('/api/people')
        if (!resPeople.ok) throw new Error(`Erro ao buscar pessoas: ${resPeople.statusText}`)
        const dataPeople = await resPeople.json()
        setPeople(dataPeople)
        localStorage.setItem('peixevoador_people', JSON.stringify(dataPeople))
        setDbDiagnostics(prev => ({ ...prev, peopleTable: `OK (${dataPeople.length} registros)` }))

        // Fetch Settings
        const resSettings = await fetch('/api/settings')
        if (!resSettings.ok) throw new Error(`Erro ao buscar configurações: ${resSettings.statusText}`)
        const dataSettings = await resSettings.json()
        
        if (dataSettings && dataSettings.value) {
          if (dataSettings.value.sharedPassword) {
            setSharedPassword(dataSettings.value.sharedPassword)
            localStorage.setItem('peixevoador_shared_password', dataSettings.value.sharedPassword)
          }
          if (dataSettings.value.adminPassword) {
            setAdminPassword(dataSettings.value.adminPassword)
            localStorage.setItem('peixevoador_admin_password', dataSettings.value.adminPassword)
          }
        }
        
        setDbDiagnostics(prev => ({ ...prev, settingsTable: 'OK', status: 'Conectado e Ativo' }))
        setSupabaseActive(true)

      } catch (err) {
        console.error("Erro na sincronização com o backend:", err)
        setSupabaseActive(false)
        setDbDiagnostics(prev => ({
          ...prev,
          status: `Erro de Conexão: ${err.message}`,
          lastError: err.message
        }))

        // Fallback to local storage
        const savedEquipment = localStorage.getItem('peixevoador_equipment')
        const savedLogs = localStorage.getItem('peixevoador_logs')
        const savedPeople = localStorage.getItem('peixevoador_people')

        if (savedEquipment) setEquipment(JSON.parse(savedEquipment))
        if (savedLogs) setLogs(JSON.parse(savedLogs))
        if (savedPeople) setPeople(JSON.parse(savedPeople))
      }
    }

    // Initial Fetch
    fetchAllData()

    // 5-Second Polling Loop
    const interval = setInterval(fetchAllData, 5000)

    return () => clearInterval(interval)
  }, [])

  // Write database updates via backend proxy
  const updateEquipmentList = async (newEquipment) => {
    // Unconditionally update React state and localStorage cache for instant UI response and offline copy
    setEquipment(newEquipment)
    localStorage.setItem('peixevoador_equipment', JSON.stringify(newEquipment))

    const deleted = equipment.filter(e => !newEquipment.some(ne => ne.id === e.id))
    const addedOrModified = newEquipment.filter(ne => {
      const existing = equipment.find(e => e.id === ne.id)
      if (!existing) return true
      return JSON.stringify(existing) !== JSON.stringify(ne)
    })

    try {
      for (const item of deleted) {
        const res = await fetch(`/api/equipment/${item.id}`, { method: 'DELETE' })
        if (!res.ok) throw new Error(await res.text())
      }
      if (addedOrModified.length > 0) {
        const res = await fetch('/api/equipment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(addedOrModified)
        })
        if (!res.ok) throw new Error(await res.text())
      }
    } catch (e) {
      console.error("Erro ao sincronizar equipamentos com o backend:", e)
      setDbDiagnostics(prev => ({ ...prev, lastError: e.message || String(e) }))
    }
  }

  const updateLogsList = async (newLogs) => {
    // Unconditionally update React state and localStorage cache
    setLogs(newLogs)
    localStorage.setItem('peixevoador_logs', JSON.stringify(newLogs))

    const deleted = logs.filter(l => !newLogs.some(nl => nl.id === l.id))
    const addedOrModified = newLogs.filter(nl => {
      const existing = logs.find(l => l.id === nl.id)
      if (!existing) return true
      return JSON.stringify(existing) !== JSON.stringify(nl)
    })

    try {
      for (const item of deleted) {
        const res = await fetch(`/api/logs/${item.id}`, { method: 'DELETE' })
        if (!res.ok) throw new Error(await res.text())
      }
      if (addedOrModified.length > 0) {
        const res = await fetch('/api/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(addedOrModified)
        })
        if (!res.ok) throw new Error(await res.text())
      }
    } catch (e) {
      console.error("Erro ao sincronizar logs com o backend:", e)
      setDbDiagnostics(prev => ({ ...prev, lastError: e.message || String(e) }))
    }
  }

  const updatePeopleList = async (newPeople) => {
    // Unconditionally update React state and localStorage cache
    setPeople(newPeople)
    localStorage.setItem('peixevoador_people', JSON.stringify(newPeople))

    const deleted = people.filter(p => !newPeople.some(np => np.id === p.id))
    const addedOrModified = newPeople.filter(np => {
      const existing = people.find(p => p.id === np.id)
      if (!existing) return true
      return JSON.stringify(existing) !== JSON.stringify(np)
    })

    try {
      for (const item of deleted) {
        const res = await fetch(`/api/people/${item.id}`, { method: 'DELETE' })
        if (!res.ok) throw new Error(await res.text())
      }
      if (addedOrModified.length > 0) {
        const res = await fetch('/api/people', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(addedOrModified)
        })
        if (!res.ok) throw new Error(await res.text())
      }
    } catch (e) {
      console.error("Erro ao sincronizar pessoas com o backend:", e)
      setDbDiagnostics(prev => ({ ...prev, lastError: e.message || String(e) }))
    }
  }

  // 2. Auth Actions
  const handleLogin = (adminRole) => {
    setIsLoggedIn(true)
    setIsAdmin(adminRole)
    localStorage.setItem('peixevoador_session_active', 'true')
    localStorage.setItem('peixevoador_session_admin', adminRole ? 'true' : 'false')
    localStorage.setItem('peixevoador_last_activity', Date.now().toString())
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setIsAdmin(false)
    localStorage.removeItem('peixevoador_session_active')
    localStorage.removeItem('peixevoador_session_admin')
    localStorage.removeItem('peixevoador_last_activity')
  }

  // 2.1 Inactivity Timer & Global Listeners
  useEffect(() => {
    if (!isLoggedIn) return

    const INACTIVITY_TIMEOUT = 30 * 60 * 1000 // 30 mins

    const updateActivity = () => {
      localStorage.setItem('peixevoador_last_activity', Date.now().toString())
    }

    let lastWrite = 0
    const handleUserActivity = () => {
      const now = Date.now()
      if (now - lastWrite > 2000) { // throttle to once every 2 seconds
        updateActivity()
        lastWrite = now
      }
    }

    // Set initial activity when logging in
    updateActivity()

    // Add listeners for activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    events.forEach(event => {
      window.addEventListener(event, handleUserActivity)
    })

    // Periodic check every 15 seconds to auto-logout if inactive while page is open
    const interval = setInterval(() => {
      const lastActivity = localStorage.getItem('peixevoador_last_activity')
      if (lastActivity) {
        const diff = Date.now() - parseInt(lastActivity, 10)
        if (diff > INACTIVITY_TIMEOUT) {
          handleLogout()
          alert('Sua sessão expirou por inatividade de 30 minutos.')
        }
      }
    }, 15000)

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleUserActivity)
      })
      clearInterval(interval)
    }
  }, [isLoggedIn])

  const handleChangePassword = (currentPass, newPass, isChangingAdmin = false) => {
    if (isChangingAdmin) {
      if (currentPass === adminPassword) {
        setAdminPassword(newPass)
        localStorage.setItem('peixevoador_admin_password', newPass)
        // Background sync settings to backend
        fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            key: 'passwords',
            value: { sharedPassword, adminPassword: newPass }
          })
        }).catch(err => console.error("Erro ao sincronizar senha do admin com o backend:", err))
        return true
      }
    } else {
      if (currentPass === sharedPassword) {
        setSharedPassword(newPass)
        localStorage.setItem('peixevoador_shared_password', newPass)
        // Background sync settings to backend
        fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            key: 'passwords',
            value: { sharedPassword: newPass, adminPassword }
          })
        }).catch(err => console.error("Erro ao sincronizar senha compartilhada com o backend:", err))
        return true
      }
    }
    return false
  }

  // Upload local data to Supabase database via backend
  const handleUploadLocalDataToSupabase = async () => {
    try {
      if (equipment.length > 0) {
        const res = await fetch('/api/equipment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(equipment)
        })
        if (!res.ok) throw new Error(await res.text())
      }

      if (logs.length > 0) {
        const res = await fetch('/api/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(logs)
        })
        if (!res.ok) throw new Error(await res.text())
      }

      if (people.length > 0) {
        const res = await fetch('/api/people', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(people)
        })
        if (!res.ok) throw new Error(await res.text())
      }

      const resSettings = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'passwords',
          value: { sharedPassword, adminPassword }
        })
      })
      if (!resSettings.ok) throw new Error(await resSettings.text())

      alert('Todos os dados locais foram enviados com sucesso para o Banco de Dados (via Backend)!')
    } catch (e) {
      console.error(e)
      alert(`Erro ao subir dados locais: ${e.message}`)
    }
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
  const handleAddPerson = (name) => {
    const trimmed = name.trim()
    if (!trimmed) return
    if (people.some(p => p.name.toLowerCase() === trimmed.toLowerCase())) {
      alert('Esta pessoa já está cadastrada.')
      return
    }
    const newPerson = {
      id: `p-${Date.now()}`,
      name: trimmed
    }
    updatePeopleList([...people, newPerson])
  }

  const handleEditPerson = (id, newName) => {
    const trimmed = newName.trim()
    if (!trimmed) return
    
    const person = people.find(p => p.id === id)
    if (!person) return

    if (person.name === trimmed) return

    if (people.some(p => p.id !== id && p.name.toLowerCase() === trimmed.toLowerCase())) {
      alert('Esta pessoa já está cadastrada com esse nome.')
      return
    }

    const oldName = person.name

    const updatedPeople = people.map(p => p.id === id ? { ...p, name: trimmed } : p)
    updatePeopleList(updatedPeople)

    const updatedEquipment = equipment.map(e => e.borrowerName === oldName ? { ...e, borrowerName: trimmed } : e)
    updateEquipmentList(updatedEquipment)

    const updatedLogs = logs.map(l => l.borrowerName === oldName ? { ...l, borrowerName: trimmed } : l)
    updateLogsList(updatedLogs)
  }

  const handleDeletePerson = (id) => {
    const personToDelete = people.find(p => p.id === id)
    if (!personToDelete) return
    const isAssigned = equipment.some(e => e.status === 'Em Uso' && e.borrowerName === personToDelete.name)
    if (isAssigned) {
      const confirmDelete = confirm(`ATENÇÃO: ${personToDelete.name} está atualmente com equipamentos emprestados. Tem certeza de que deseja excluí-la do cadastro?`)
      if (!confirmDelete) return
    }
    const updated = people.filter(p => p.id !== id)
    updatePeopleList(updated)
  }

  const handleImportData = (importedEq, importedLogs, importedPeople) => {
    updateEquipmentList(importedEq)
    updateLogsList(importedLogs)
    if (importedPeople) {
      updatePeopleList(importedPeople)
    }
  }

  const handleLoadMockData = () => {
    updateEquipmentList(MOCK_EQUIPMENT)
    updateLogsList(MOCK_LOGS)
    updatePeopleList(MOCK_PEOPLE)
  }

  const handleClearAllData = () => {
    updateEquipmentList([])
    updateLogsList([])
    updatePeopleList([])
  }

  const handleQuickStatusChange = (id, newStatus, borrowerName = null) => {
    const targetEq = equipment.find(e => e.id === id)
    if (!targetEq) return

    let updatedEquipment = [...equipment]
    let newLogs = [...logs]

    // If it was Em Uso and we are changing the status or borrower, log a return
    if (targetEq.status === 'Em Uso' && (newStatus !== 'Em Uso' || targetEq.borrowerName !== borrowerName)) {
      const returnLog = {
        id: `log-${Date.now()}-ret`,
        timestamp: new Date().toISOString(),
        equipmentId: id,
        equipmentName: targetEq.name,
        serialNumber: targetEq.serialNumber,
        action: 'devolucao',
        borrowerName: targetEq.borrowerName || 'Sistema',
        notes: newStatus === 'Em Manutenção' ? 'Retornado para manutenção.' : 'Devolução registrada via alteração rápida.'
      }
      newLogs.push(returnLog)
    }

    // If the new status is Em Uso, log a withdrawal
    if (newStatus === 'Em Uso') {
      const checkoutLog = {
        id: `log-${Date.now()}-out`,
        timestamp: new Date().toISOString(),
        equipmentId: id,
        equipmentName: targetEq.name,
        serialNumber: targetEq.serialNumber,
        action: 'retirada',
        borrowerName: borrowerName,
        notes: 'Direcionado via seleção rápida no inventário.'
      }
      newLogs.push(checkoutLog)
    }

    updatedEquipment = equipment.map(e => {
      if (e.id === id) {
        return {
          ...e,
          status: newStatus,
          borrowerName: newStatus === 'Em Uso' ? borrowerName : null,
          loanDate: newStatus === 'Em Uso' ? new Date().toISOString() : null,
          expectedReturnDate: null,
          notes: newStatus === 'Em Uso' ? 'Direcionado via seleção rápida no inventário.' : (newStatus === 'Em Manutenção' ? 'Enviado para manutenção.' : null)
        }
      }
      return e
    })

    updateEquipmentList(updatedEquipment)
    updateLogsList(newLogs)
  }

  const handleSaveBatchEquipment = (newEqs) => {
    const formatted = newEqs.map((eq, index) => ({
      id: `eq-${Date.now()}-${Math.random()}-${index}`,
      name: eq.name.trim(),
      category: eq.category || 'Outros',
      serialNumber: eq.serialNumber ? String(eq.serialNumber).trim() : '',
      description: eq.description ? String(eq.description).trim() : '',
      status: 'Disponível',
      borrowerName: null,
      loanDate: null,
      expectedReturnDate: null
    }))
    updateEquipmentList([...equipment, ...formatted])
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
          people={people}
          isAdmin={isAdmin}
          onAddEquipment={handleOpenAddModal}
          onUpdateEquipment={handleOpenEditModal}
          onDeleteEquipment={handleDeleteEquipment}
          onLendEquipment={handleOpenLoanModal}
          onReturnEquipment={handleReturnEquipment}
          onChangePassword={handleChangePassword}
          onImportData={handleImportData}
          onLoadMockData={handleLoadMockData}
          onClearAllData={handleClearAllData}
          onAddPerson={handleAddPerson}
          onEditPerson={handleEditPerson}
          onDeletePerson={handleDeletePerson}
          onQuickStatusChange={handleQuickStatusChange}
          supabaseActive={supabaseActive}
          onUploadLocalData={handleUploadLocalDataToSupabase}
          dbDiagnostics={dbDiagnostics}
        />
      ) : (
        <Login
          onLogin={handleLogin}
          sharedPassword={sharedPassword}
          adminPassword={adminPassword}
        />
      )}

      {/* Equipment Register / Edit Modal */}
      <EquipmentModal
        isOpen={isEqModalOpen}
        onClose={() => setIsEqModalOpen(false)}
        onSave={handleSaveEquipment}
        onSaveBatch={handleSaveBatchEquipment}
        equipmentToEdit={equipmentToEdit}
      />

      {/* Loan Direction Modal */}
      <LoanModal
        isOpen={isLoanModalOpen}
        onClose={() => setIsLoanModalOpen(false)}
        onConfirm={handleConfirmLoan}
        equipment={equipmentForLoan}
        people={people}
      />
    </>
  )
}
