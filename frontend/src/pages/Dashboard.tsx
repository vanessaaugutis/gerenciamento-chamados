import { useEffect, useState } from 'react'
import { getDashboardSummary, type DashboardSummary } from '../services/dashboard'
import PageCard from '../components/PageCard'
import TicketsChart from '../components/TicketsChart'

function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const data = await getDashboardSummary()
        setSummary(data)
      } catch {
        setSummary({ total: 0, open: 0, inProgress: 0, finished: 0, overdue: 0, byPriority: { baixa: 0, media: 0, alta: 0, critica: 0 } })
      }
    }

    void loadSummary()
  }, [])

  return (
    <PageCard maxWidth={1100}>
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
          <span>Em Atendimento</span>
        </div>
        <div className="stat-card">
          <strong>{summary?.finished ?? 0}</strong>
          <span>Finalizados</span>
        </div>
        <div className="stat-card stat-card--danger">
          <strong>{summary?.overdue ?? 0}</strong>
          <span>Atrasados</span>
        </div>
      </div>

      {summary !== null && <TicketsChart summary={summary} />}
    </PageCard>
  )
}

export default DashboardPage
