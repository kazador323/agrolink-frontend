import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ roles, children }){
  const { user, role } = useAuth()
  if(!user) return <Navigate to="/auth" replace />
  if(roles && !roles.includes(role) && role !== 'admin') return <Navigate to="/" replace />
  return children
}
