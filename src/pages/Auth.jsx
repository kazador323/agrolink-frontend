import { useState } from 'react'
import { apiPost } from '../lib/api'
import { useAuth } from '../context/AuthContext'

export default function Auth(){
  const [mode,setMode]=useState('login')
  const [form,setForm]=useState({name:'',email:'',password:'',role:'consumer'})
  const { login } = useAuth()

  const onChange = e => setForm({...form, [e.target.name]: e.target.value})
  const [phone, setPhone] = useState('')

  async function submit(e){
    e.preventDefault()
    try{
      if(mode==='register'){
        await apiPost('/api/auth/register', form)
      }
      const { token, role } = await apiPost('/api/auth/login', { email:form.email, password:form.password })
      login({ token, role })
      alert('Sesión iniciada')
    }catch(err){ alert('Error: ' + err.message) }
  }

  return (
    <div className="container" style={{maxWidth:520}}>
      <div className="card">
        <div style={{display:'flex', gap:8, marginBottom:12}}>
          <button className={`btn ${mode==='register'?'btn-outline':''}`} onClick={()=>setMode('register')}>Registrarse</button>
          <button className={`btn ${mode==='login'?'btn-outline':''}`} onClick={()=>setMode('login')}>Iniciar sesión</button>
        </div>
        <form onSubmit={submit} className="grid" style={{gap:10}}>
          {mode==='register' && (
            <>
              <label>Nombre</label>
              <input className="input" name="name" onChange={onChange}/>
              <label>Rol</label>
              <select className="input" name="role" onChange={onChange} defaultValue="consumer">
                <option value="consumer">Consumidor</option>
                <option value="producer">Productor</option>
              </select>
            </>
          )}
          <label>Correo</label>
          <input className="input" name="email" onChange={onChange}/>
          <label>Teléfono *</label>
          <input className="input" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+56 9 1234 5678" />
          <label>Contraseña</label>
          <input className="input" name="password" type="password" onChange={onChange}/>
          <button className="btn" style={{marginTop:6}}>
            {mode==='register' ? 'Registrarse' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </div>
  )
}
