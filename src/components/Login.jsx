import React, { useState } from 'react'
import { Lock, Eye, EyeOff, AlertTriangle } from 'lucide-react'
import logo from '../logo.png'

export default function Login({ onLogin, sharedPassword, adminPassword }) {
  const [loginMode, setLoginMode] = useState('user')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (loginMode === 'admin') {
      if (password === adminPassword) {
        setError('')
        onLogin(true)
      } else {
        setError('Senha de administrador incorreta. Tente novamente.')
      }
    } else {
      if (password === sharedPassword) {
        setError('')
        onLogin(false)
      } else {
        setError('Senha compartilhada incorreta. Tente novamente.')
      }
    }
  }

  return (
    <div style={styles.container}>
      <div className="ambient-glow-1"></div>
      <div className="ambient-glow-2"></div>
      
      <div className="glass-panel" style={styles.card}>
        <div style={styles.logoContainer}>
          <img src={logo} alt="Logo Peixe Voador" style={styles.logoImageLogin} />
          <div style={styles.brandText}>
            <h1 style={styles.title}>PEIXE VOADOR</h1>
            <p style={styles.subtitle}>Controle de Equipamentos</p>
          </div>
        </div>

        <div style={styles.tabContainer}>
          <button
            type="button"
            style={{
              ...styles.loginTab,
              ...(loginMode === 'user' ? styles.loginTabActive : {})
            }}
            onClick={() => { setLoginMode('user'); setError(''); setPassword(''); }}
          >
            Equipe
          </button>
          <button
            type="button"
            style={{
              ...styles.loginTab,
              ...(loginMode === 'admin' ? styles.loginTabActive : {})
            }}
            onClick={() => { setLoginMode('admin'); setError(''); setPassword(''); }}
          >
            Administrador
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div className="form-group" style={{ position: 'relative' }}>
            <label htmlFor="password">
              {loginMode === 'admin' ? 'Senha do Administrador' : 'Senha de Acesso Compartilhada'}
            </label>
            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}>
                <Lock size={18} color="var(--text-muted)" />
              </span>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder={loginMode === 'admin' ? 'Insira a senha do administrador' : 'Insira a senha de produção'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.toggleBtn}
                title={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div style={styles.errorAlert}>
              <AlertTriangle size={18} style={{ minWidth: '18px' }} />
              <span>{error}</span>
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={styles.submitBtn}>
            Acessar Painel
          </button>
        </form>

        <div style={styles.footer}>
          <span>Compartilhado entre membros da equipe e técnicos</span>
        </div>
      </div>
      <footer style={styles.footerGlobal}>
        <p style={styles.footerTextGlobal}>Todos os direitos reservados - 2026</p>
      </footer>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    width: '100%',
    padding: '20px',
    gap: '24px',
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    padding: '40px 30px',
    borderRadius: '24px',
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'center',
  },
  logoContainer: {
    marginBottom: '32px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  logoImageLogin: {
    height: '64px',
    width: 'auto',
    objectFit: 'contain',
  },
  brandText: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'var(--font-heading)',
    fontSize: '2rem',
    fontWeight: '800',
    letterSpacing: '0.1em',
    color: '#ffffff',
    margin: 0,
    background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    fontSize: '0.875rem',
    color: 'var(--text-secondary)',
    marginTop: '6px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    paddingLeft: '44px',
    paddingRight: '44px',
  },
  toggleBtn: {
    position: 'absolute',
    right: '14px',
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: '10px',
    padding: '12px 14px',
    color: '#f87171',
    fontSize: '0.85rem',
    marginBottom: '20px',
  },
  submitBtn: {
    width: '100%',
    padding: '14px',
    fontSize: '1rem',
    marginTop: '10px',
  },
  footer: {
    marginTop: '32px',
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  tabContainer: {
    display: 'flex',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '4px',
    marginBottom: '24px',
  },
  loginTab: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    color: 'var(--text-secondary)',
    padding: '10px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontFamily: 'var(--font-heading)',
    fontSize: '0.9rem',
    fontWeight: '600',
    transition: 'all 0.2s',
  },
  loginTabActive: {
    background: 'rgba(89, 143, 191, 0.15)',
    color: '#ffffff',
    border: '1px solid rgba(89, 143, 191, 0.25)',
  },
  footerGlobal: {
    textAlign: 'center',
    zIndex: 10,
  },
  footerTextGlobal: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-body)',
  }
}
