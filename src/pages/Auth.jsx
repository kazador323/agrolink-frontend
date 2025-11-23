import { useState } from 'react'
import { apiPost } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Auth() {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'consumer',
  })
  const [phone, setPhone] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const onChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  async function submit(e) {
    e.preventDefault()
    try {
      if (mode === 'register') {
        await apiPost('/api/auth/register', {
          ...form,
          phone,
        })
        alert('Registro exitoso, ahora inicia sesión.')
        setMode('login')
        return
      }

      if (mode === 'login') {
        const { token, role } = await apiPost('/api/auth/login', {
          email: form.email,
          password: form.password,
        })
        login({ token, role })
        navigate('/')
      }
    } catch (err) {
      alert('Error: ' + (err.message || 'desconocido'))
    }
  }

  async function submitRecover(e) {
    e.preventDefault()
    try {
      await apiPost('/api/auth/recover', {
        email: form.email,
        newPassword: form.password,
      })
      alert('Contraseña actualizada. Ahora puedes iniciar sesión.')
      setMode('login')
      setForm({ ...form, password: '' })
    } catch (err) {
      alert(
        'Error al recuperar contraseña: ' + (err.message || 'desconocido')
      )
    }
  }

  return (
    <div className="container" style={{ maxWidth: 520 }}>
      <div className="card">
        <div
          style={{
            display: 'flex',
            gap: 8,
            marginBottom: 12,
            flexWrap: 'wrap',
          }}
        >
          <button
            type="button"
            className={`btn ${mode === 'register' ? 'btn-outline' : ''}`}
            onClick={() => setMode('register')}
          >
            Registrarse
          </button>
          <button
            type="button"
            className={`btn ${mode === 'login' ? 'btn-outline' : ''}`}
            onClick={() => setMode('login')}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            className={`btn ${mode === 'recover' ? 'btn-outline' : ''}`}
            onClick={() => setMode('recover')}
          >
            Recuperar contraseña
          </button>
        </div>

        {mode === 'login' || mode === 'register' ? (
          <form
            onSubmit={submit}
            className="grid"
            style={{ gap: 10 }}
          >
            {mode === 'register' && (
              <>
                <label>Nombre</label>
                <input
                  className="input"
                  name="name"
                  value={form.name}
                  onChange={onChange}
                />

                <label>Rol</label>
                <select
                  className="input"
                  name="role"
                  value={form.role}
                  onChange={onChange}
                >
                  <option value="consumer">Consumidor</option>
                  <option value="producer">Productor</option>
                </select>

                <label>Teléfono *</label>
                <input
                  className="input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+56 9 1234 5678"
                />
              </>
            )}

            <label>Correo</label>
            <input
              className="input"
              name="email"
              value={form.email}
              onChange={onChange}
            />

            <label>Contraseña</label>
            <input
              className="input"
              name="password"
              type="password"
              value={form.password}
              onChange={onChange}
            />

            <button className="btn" style={{ marginTop: 6 }}>
              {mode === 'register' ? 'Registrarse' : 'Iniciar sesión'}
            </button>

            {mode === 'login' && (
              <button
                type="button"
                className="link"
                style={{ marginTop: 4, textAlign: 'left' }}
                onClick={() => setMode('recover')}
              >
                ¿Olvidaste tu contraseña?
              </button>
            )}
          </form>
        ) : null}

        {mode === 'recover' && (
          <form
            onSubmit={submitRecover}
            className="grid"
            style={{ gap: 10, marginTop: 8 }}
          >
            <label>Correo registrado</label>
            <input
              className="input"
              name="email"
              value={form.email}
              onChange={onChange}
              placeholder="tu@correo.com"
            />

            <label>Nueva contraseña</label>
            <input
              className="input"
              name="password"
              type="password"
              value={form.password}
              onChange={onChange}
              placeholder="Nueva contraseña"
            />

            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              <button className="btn">Guardar nueva contraseña</button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setMode('login')}
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}


