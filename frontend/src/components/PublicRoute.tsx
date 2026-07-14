import { Navigate } from 'react-router-dom'
import { getToken } from '../services/auth'

interface PublicRouteProps {
  children: React.ReactNode
}

export default function PublicRoute({ children }: PublicRouteProps) {
  return getToken() ? <Navigate to="/dashboard" replace /> : <>{children}</>
}
