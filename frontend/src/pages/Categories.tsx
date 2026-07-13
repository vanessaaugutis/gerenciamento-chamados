import { Link } from 'react-router-dom'

function CategoriesPage() {
  return (
    <div className="page-card">
      <h1>Categorias</h1>
      <p>Gerencie os tipos de chamados disponíveis.</p>

      <ul className="list-card">
        <li>Suporte técnico</li>
        <li>Financeiro</li>
        <li>Atendimento</li>
        <li>Infraestrutura</li>
      </ul>

      <p className="page-link">
        <Link to="/dashboard">Voltar ao dashboard</Link>
      </p>
    </div>
  )
}

export default CategoriesPage
