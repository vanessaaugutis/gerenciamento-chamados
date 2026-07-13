import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getDashboardSummary, type DashboardSummary } from '../services/dashboard'

function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const data = await getDashboardSummary()
        setSummary(data)
      } catch {
        setSummary({ total: 0, open: 0, inProgress: 0, finished: 0, overdue: 0 })
      }
    }

    void loadSummary()
  }, [])

  return (
    <div className="page-card">
      <h1>Dashboard</h1>
      <p>Visão geral dos chamados e status do sistema.</p>

      <div className="stats-grid">
        <div className="stat-card">
          <strong>{summary?.total ?? 0}</strong>
          <span>Total de chamados</span>
        </div>
        <div className="stat-card">
          <strong>{summary?.open ?? 0}</strong>
          <span>Chamados Abertos</span>
        </div>
        <div className="stat-card">
          <strong>{summary?.inProgress ?? 0}</strong>
          <span>Chamados Em Atendimento</span>
        </div>
        <div className="stat-card">
          <strong>{summary?.finished ?? 0}</strong>
          <span>Chamados Finalizados</span>
        </div>
        <div className="stat-card">
          <strong>{summary?.overdue ?? 0}</strong>
          <span>Chamados Atrasados</span>
        </div>
      </div>

      <p className="page-link">
        <Link to="/categories">Ver categorias</Link>
      </p>
    </div>
  )
}

export default DashboardPage
