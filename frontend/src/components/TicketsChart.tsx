import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { DashboardSummary } from '../services/dashboard'

interface TicketsChartProps {
  summary: DashboardSummary
}

const STATUS_COLORS = ['#3b82f6', '#f59e0b', '#8b5cf6', '#22c55e', '#ef4444']

const PRIORITY_COLORS: Record<string, string> = {
  baixa: '#22c55e',
  média: '#f59e0b',
  alta: '#ef4444',
  crítica: '#7f1d1d',
}

const RADIAN = Math.PI / 180

interface PieLabelProps {
  cx: number
  cy: number
  midAngle: number
  innerRadius: number
  outerRadius: number
  percent: number
}

function renderCustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: PieLabelProps) {
  if (percent < 0.05) return null
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

export default function TicketsChart({ summary }: TicketsChartProps) {
  const statusData = [
    { name: 'Abertos', value: summary.open },
    { name: 'Em Atendimento', value: summary.inProgress },
    { name: 'Finalizados', value: summary.finished },
    { name: 'Atrasados', value: summary.overdue },
  ].filter((item) => item.value > 0)

  const priorityData = [
    { name: 'Baixa', value: summary.byPriority?.baixa ?? 0 },
    { name: 'Média', value: summary.byPriority?.media ?? 0 },
    { name: 'Alta', value: summary.byPriority?.alta ?? 0 },
    { name: 'Crítica', value: summary.byPriority?.critica ?? 0 },
  ]

  const hasStatusData = statusData.length > 0
  const hasPriorityData = priorityData.some((item) => item.value > 0)

  return (
    <div className="charts-section">
      <div className="chart-card">
        <h3 className="chart-title">Chamados por Status</h3>
        {hasStatusData ? (
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                labelLine={false}
                label={renderCustomLabel as unknown as boolean}
              >
                {statusData.map((_, index) => (
                  <Cell key={`cell-status-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => [value, name]}
                contentStyle={{ borderRadius: 10, fontSize: 13 }}
              />
              <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 13 }} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="chart-empty">Nenhum chamado registrado ainda.</div>
        )}
      </div>

      <div className="chart-card">
        <h3 className="chart-title">Chamados por Prioridade</h3>
        {hasPriorityData ? (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={priorityData} margin={{ top: 8, right: 16, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 13 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 13 }} />
              <Tooltip
                formatter={(value: number) => [value, 'Chamados']}
                contentStyle={{ borderRadius: 10, fontSize: 13 }}
              />
            
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {priorityData.map((entry) => (
                  <Cell key={`cell-priority-${entry.name}`} fill={PRIORITY_COLORS[entry.name.toLowerCase()] ?? '#64748b'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="chart-empty">Nenhum chamado registrado ainda.</div>
        )}
      </div>
    </div>
  )
}
