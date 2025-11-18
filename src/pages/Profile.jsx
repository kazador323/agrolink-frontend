import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { apiGet, apiPut } from '../lib/api'

export default function Profile(){
  const { token, user } = useAuth()
  const [form, setForm] = useState({ name:'', email:'', phone:'' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(()=>{
    apiGet('/api/me', token).then(data => {
      if (data) setForm({ name: data.name || '', email: data.email || '', phone: data.phone || '' })
    })
  }, [token])

  const onChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  async function save(){
    if(!form.name || !form.email || !form.phone) return alert('Completa todos los campos')
    setSaving(true); setMsg('')
    try{
      const upd = await apiPut('/api/me', form, token)
      setMsg('Datos actualizados ✔')
    } catch(e){
      alert('Error: ' + e.message)
    } finally{
      setSaving(false)
    }
  }

  return (
    <div className="container" style={{maxWidth:640}}>
      <h2>Mis datos</h2>
      <div className="card">
        {msg && <div className="badge" style={{marginBottom:10, display:'inline-block'}}>{msg}</div>}
        <label>Nombre *</label>
        <input className="input" name="name" value={form.name} onChange={onChange} />

        <label>Email *</label>
        <input className="input" name="email" value={form.email} onChange={onChange} />

        <label>Teléfono *</label>
        <input className="input" name="phone" value={form.phone} onChange={onChange} placeholder="+56 9 1234 5678" />

        <div style={{marginTop:12}}>
          <button className="btn" onClick={save} disabled={saving}>{saving?'Guardando…':'Guardar'}</button>
        </div>
      </div>
    </div>
  )
}
