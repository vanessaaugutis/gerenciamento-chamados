import { useState } from 'react'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { Link, useNavigate } from 'react-router-dom'

function LoginPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    navigate('/dashboard')
  }

  return (
    <div className="page-card">
      <p>Entre com seu e-mail e senha para acessar o sistema.</p>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          E-mail
          <input type="email" placeholder="seu@email.com" />
        </label>

        <label>
          Senha
          <div className="password-input-wrapper">
            <input type={showPassword ? 'text' : 'password'} placeholder="********" />
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

        <button type="submit">Entrar</button>
      </form>

      <p className="page-link">
        Ainda não tem conta? <Link to="/register">Criar conta</Link>
      </p>
    </div>
  )
}

export default LoginPage
