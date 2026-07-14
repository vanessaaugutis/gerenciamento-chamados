import { useEffect, useState } from 'react'
import { NavLink, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import LoginPage from './pages/Login'
import RegisterPage from './pages/Register'
import DashboardPage from './pages/Dashboard'
import CategoriesPage from './pages/Categories'
import TicketsPage from './pages/Tickets'
import { clearToken, getToken, logoutUser } from './services/auth'

function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const hideNav = location.pathname === '/' || location.pathname === '/login' || location.pathname === '/register'
  const isAuthenticated = Boolean(getToken())

  const handleLogout = async () => {
    await logoutUser()
    setSidebarOpen(false)
    navigate('/login', { state: { logoutMessage: 'Usuário deslogado com sucesso!' } })
  }

  useEffect(() => {
    const handleExpiredSession = () => {
      clearToken()
      navigate('/login', { replace: true })
    }
    window.addEventListener('auth:expired', handleExpiredSession)
    return () => window.removeEventListener('auth:expired', handleExpiredSession)
  }, [navigate])

  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div className="app-shell">
      {!hideNav && isAuthenticated && (
        <>
          <nav className="top-nav">
            <button
              type="button"
              className="hamburger-btn"
              onClick={() => setSidebarOpen(true)}
              aria-label="Abrir menu"
            >
              <span /><span /><span />
            </button>

            <div className="nav-links">
              <NavLink to="/dashboard">Dashboard</NavLink>
              <NavLink to="/tickets">Chamados</NavLink>
              <NavLink to="/categories">Categorias</NavLink>
            </div>

            <button type="button" className="logout-button" onClick={handleLogout}>
              Deslogar
            </button>
          </nav>

          {sidebarOpen && (
            <div className="sidebar-overlay" onClick={closeSidebar} aria-hidden="true" />
          )}

          <aside className={`sidebar${sidebarOpen ? ' sidebar--open' : ''}`}>
            <div className="sidebar-header">
              <span className="sidebar-title">Menu</span>
              <button
                type="button"
                className="sidebar-close-btn"
                onClick={closeSidebar}
                aria-label="Fechar menu"
              >
                ✕
              </button>
            </div>

            <nav className="sidebar-nav">
              <NavLink to="/dashboard" onClick={closeSidebar}>Dashboard</NavLink>
              <NavLink to="/tickets" onClick={closeSidebar}>Chamados</NavLink>
              <NavLink to="/categories" onClick={closeSidebar}>Categorias</NavLink>
            </nav>

            <button type="button" className="logout-button sidebar-logout" onClick={handleLogout}>
              Deslogar
            </button>
          </aside>
        </>
      )}

      <main className="page-container">
        <Routes>
          <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
          <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
          <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />
          <Route path="/dashboard" element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" replace />} />
          <Route path="/categories" element={isAuthenticated ? <CategoriesPage /> : <Navigate to="/login" replace />} />
          <Route path="/tickets" element={isAuthenticated ? <TicketsPage /> : <Navigate to="/login" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
