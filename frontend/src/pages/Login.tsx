import { useEffect, useState } from 'react'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import FormField from '../components/FormField'
import Input from '../components/Input'
import Message from '../components/Message'
import PageCard from '../components/PageCard'
import ToastContainer from '../components/ToastContainer'
import { useToast } from '../hooks/useToast'
import { loginUser, saveToken } from '../services/auth'

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { toasts, addToast, removeToast } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const state = location.state as { logoutMessage?: string } | null
    if (state?.logoutMessage) {
      addToast(state.logoutMessage, 'success')
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [])

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
    <>
      <PageCard>
        <h1>LOGIN</h1>
        <p>Entre com seu e-mail e senha para acessar o sistema.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <FormField label="E-mail">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
            />
          </FormField>

          <FormField label="Senha">
            <div className="password-input-wrapper">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </FormField>

          {error ? <Message text={error} type="error" /> : null}

          <Button type="submit" variant="primary" style={{ width: '100%' }}>
            Entrar
          </Button>
        </form>

        <p className="page-link">
          Ainda não tem conta? <Link to="/register">Criar conta</Link>
        </p>
      </PageCard>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  )
}

export default LoginPage
