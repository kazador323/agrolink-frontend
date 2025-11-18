import { createContext, useContext, useEffect, useState } from 'react'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [role, setRole] = useState(localStorage.getItem('role'))

  const login = ({ token, role }) => {
    setToken(token); setRole(role)
    localStorage.setItem('token', token)
    localStorage.setItem('role', role)
  }

  const logout = () => {
    setToken(null); setRole(null)
    localStorage.removeItem('token')
    localStorage.removeItem('role')
  }

  const value = { user: token ? { role } : null, token, role, login, logout }
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}

export const useAuth = () => useContext(AuthCtx)
