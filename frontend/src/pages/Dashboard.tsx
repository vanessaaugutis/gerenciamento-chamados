import { Link } from 'react-router-dom'

function DashboardPage() {
  return (
    <div className="page-card">
      <h1>Dashboard</h1>
      <p>Visão geral dos chamados e status do sistema.</p>

      <div className="stats-grid">
        <div className="stat-card">
          <strong>12</strong>
          <span>Chamados abertos</span>
        </div>
        <div className="stat-card">
          <strong>4</strong>
          <span>Em andamento</span>
        </div>
        <div className="stat-card">
          <strong>8</strong>
          <span>Concluídos</span>
        </div>
      </div>

      <p className="page-link">
        <Link to="/categories">Ver categorias</Link>
      </p>
    </div>
  )
}

export default DashboardPage
