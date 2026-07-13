import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser, saveToken, loginUser } from '../services/auth'

function RegisterPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Nome, e-mail e senha são obrigatórios.')
      return
    }

    try {
      await registerUser(name, email, password)
      const response = await loginUser(email, password)
      saveToken(response.accessToken)
      navigate('/dashboard')
    } catch {
      setError('Não foi possível concluir o cadastro.')
    }
  }

  return (
    <div className="page-card">
        <h1>CRIAR CONTA</h1>
      <p>Cadastre-se para começar a gerenciar chamados.</p>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          Nome
          <input type="text" value={name} onChange={(event) => setName(event.target.value)} placeholder="Seu nome" />
        </label>

        <label>
          E-mail
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="seu@email.com" />
        </label>

        <label>
          Senha
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="********" />
        </label>

        {error ? <p style={{ color: '#ef4444', margin: 0 }}>{error}</p> : null}
        <button type="submit">Registrar</button>
      </form>

      <p className="page-link">
        Já tem conta? <Link to="/login">Fazer login</Link>
      </p>
    </div>
  )
}

export default RegisterPage
