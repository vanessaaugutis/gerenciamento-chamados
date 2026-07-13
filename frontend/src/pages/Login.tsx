import { useState } from 'react'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { Link, useNavigate } from 'react-router-dom'
import { loginUser, saveToken } from '../services/auth'

function LoginPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (!email.trim() || !password.trim()) {
      setError('E-mail e senha são obrigatórios.')
      return
    }

    try {
      const response = await loginUser(email, password)
      saveToken(response.accessToken)
      navigate('/dashboard')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao fazer login.')
    }
  }

  return (
    <div className="page-card">
        <h1>LOGIN</h1>
      <p>Entre com seu e-mail e senha para acessar o sistema.</p>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          E-mail
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="seu@email.com" />
        </label>

        <label>
          Senha
          <div className="password-input-wrapper">
            <input type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="********" />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
        </label>

        {error ? <p style={{ color: '#ef4444', margin: 0 }}>{error}</p> : null}
        <button type="submit">Entrar</button>
      </form>

      <p className="page-link">
        Ainda não tem conta? <Link to="/register">Criar conta</Link>
      </p>
    </div>
  )
}

export default LoginPage
