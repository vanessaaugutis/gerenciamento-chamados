import { Link } from 'react-router-dom'

function RegisterPage() {
  return (
    <div className="page-card">
      <p>Cadastre-se para começar a gerenciar chamados.</p>

      <form className="auth-form" onSubmit={(event) => event.preventDefault()}>
        <label>
          Nome
          <input type="text" placeholder="Seu nome" />
        </label>

        <label>
          E-mail
          <input type="email" placeholder="seu@email.com" />
        </label>

        <label>
          Senha
          <input type="password" placeholder="********" />
        </label>

        <button type="submit">Registrar</button>
      </form>

      <p className="page-link">
        Já tem conta? <Link to="/login">Fazer login</Link>
      </p>
    </div>
  )
}

export default RegisterPage
