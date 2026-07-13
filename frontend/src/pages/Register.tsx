import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import FormField from '../components/FormField'
import Input from '../components/Input'
import Message from '../components/Message'
import PageCard from '../components/PageCard'
import { loginUser, registerUser, saveToken } from '../services/auth'

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
    <PageCard>
      <h1>CRIAR CONTA</h1>
      <p>Cadastre-se para começar a gerenciar chamados.</p>

      <form className="auth-form" onSubmit={handleSubmit}>
        <FormField label="Nome" required>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome"
          />
        </FormField>

        <FormField label="E-mail" required>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
          />
        </FormField>

        <FormField label="Senha" required>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
          />
        </FormField>

        {error ? <Message text={error} type="error" /> : null}

        <Button type="submit" variant="primary" style={{ width: '100%' }}>
          Registrar
        </Button>
      </form>

      <p className="page-link">
        Já tem conta? <Link to="/login">Fazer login</Link>
      </p>
    </PageCard>
  )
}

export default RegisterPage
