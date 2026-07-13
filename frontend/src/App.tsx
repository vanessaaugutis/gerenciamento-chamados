import { NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import LoginPage from './pages/Login'
import RegisterPage from './pages/Register'
import DashboardPage from './pages/Dashboard'
import CategoriesPage from './pages/Categories'

function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const hideNav = location.pathname === '/' || location.pathname === '/login' || location.pathname === '/register'

  const handleLogout = () => {
    navigate('/login')
  }

  return (
    <div className="app-shell">
      {!hideNav && (
        <nav className="top-nav">
          <div className="nav-links">
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/categories">Categories</NavLink>
          </div>
          <button type="button" className="logout-button" onClick={handleLogout}>
            Deslogar
          </button>
        </nav>
      )}

      <main className="page-container">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
