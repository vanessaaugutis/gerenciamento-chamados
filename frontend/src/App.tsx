import { NavLink, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import LoginPage from './pages/Login'
import RegisterPage from './pages/Register'
import DashboardPage from './pages/Dashboard'
import CategoriesPage from './pages/Categories'
import TicketsPage from './pages/Tickets'
import { clearToken, getToken } from './services/auth'

function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const hideNav = location.pathname === '/' || location.pathname === '/login' || location.pathname === '/register'
  const isAuthenticated = Boolean(getToken())

  const handleLogout = () => {
    clearToken()
    navigate('/login')
  }

  return (
    <div className="app-shell">
      {!hideNav && isAuthenticated && (
        <nav className="top-nav">
          <div className="nav-links">
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/categories">Categorias</NavLink>
            <NavLink to="/tickets">Chamados</NavLink>
          </div>
          <button type="button" className="logout-button" onClick={handleLogout}>
            Deslogar
          </button>
        </nav>
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
