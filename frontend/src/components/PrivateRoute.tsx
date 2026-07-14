import { Navigate } from 'react-router-dom'
import { getToken } from '../services/auth'

interface PrivateRouteProps {
  children: React.ReactNode
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  return getToken() ? <>{children}</> : <Navigate to="/login" replace />
}
