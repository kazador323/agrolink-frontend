// src/pages/Location.jsx
import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { apiGet, apiPut } from '../lib/api'
import { REGIONES, COMUNAS_POR_REGION } from '../data/chile'

const initial = { address:'', commune:'', region:'', latitude:'', longitude:'' }

export default function LocationPage(){
  const { token } = useAuth()
  const [form, setForm] = useState(initial)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  // Comunas disponibles según región seleccionada
  const comunas = useMemo(() => {
    const r = form.region || ''
    return COMUNAS_POR_REGION[r] || []
  }, [form.region])

  useEffect(() => {
    let mounted = true
    apiGet('/api/location/my', token)
      .then(doc => {
        if (!mounted) return
        if (doc) {
          setForm({
            address:   doc.address   || '',
            commune:   doc.commune   || '',
            region:    doc.region    || '',
            latitude:  doc.latitude  ?? '',
            longitude: doc.longitude ?? '',
          })
        }
      })
      .finally(() => setLoading(false))
    return () => { mounted = false }
  }, [token])

  const onChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  function onRegionChange(e){
    const region = e.target.value
    // al cambiar región, si la comuna actual no pertenece, vacíala
    setForm(f => {
      const allowed = COMUNAS_POR_REGION[region] || []
      const commune = allowed.includes(f.commune) ? f.commune : ''
      return { ...f, region, commune }
    })
  }

  function fromBrowserGeolocation(){
    if (!navigator.geolocation) return alert('Geolocalización no soportada')
    navigator.geolocation.getCurrentPosition(
      pos => {
        setForm(f => ({ ...f, latitude: pos.coords.latitude, longitude: pos.coords.longitude }))
      },
      err => alert('No se pudo obtener ubicación del navegador: ' + err.message),
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }

  async function save(){
    if (!form.address || !form.commune || !form.region) {
      return alert('Dirección, Comuna y Región son obligatorios')
    }
    setSaving(true); setMsg('')
    try{
      const body = {
        address:   form.address.trim(),
        commune:   form.commune.trim(),
        region:    form.region.trim(),
        latitude:  form.latitude === ''  ? undefined : Number(form.latitude),
        longitude: form.longitude === '' ? undefined : Number(form.longitude),
      }
      await apiPut('/api/location/my', body, token)
      setMsg('Ubicación guardada ✔')
    }catch(e){
      alert('Error al guardar: ' + e.message)
    }finally{
      setSaving(false)
    }
  }

  if (loading) return <div className="container"><div className="card">Cargando…</div></div>

  return (
    <div className="container" style={{maxWidth:720}}>
      <h2>Mi Ubicación</h2>
      <div className="card">
        {msg && <div className="badge" style={{display:'inline-block', marginBottom:10}}>{msg}</div>}

        <div className="grid" style={{gap:12, gridTemplateColumns:'1fr 1fr'}}>
          <div style={{gridColumn:'1 / -1'}}>
            <label>Dirección *</label>
            <input className="input" name="address" value={form.address} onChange={onChange} placeholder="Ej: Av. Siempre Viva 742"/>
          </div>

          <div>
            <label>Región *</label>
            <select className="input" name="region" value={form.region} onChange={onRegionChange}>
              <option value="">-- Selecciona --</option>
              {REGIONES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div>
            <label>Comuna *</label>
            <select
              className="input"
              name="commune"
              value={form.commune}
              onChange={onChange}
              disabled={!form.region}
            >
              <option value="">{form.region ? '-- Selecciona --' : 'Primero elige Región'}</option>
              {comunas.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label>Latitud</label>
            <input className="input" name="latitude" value={form.latitude} onChange={onChange} placeholder="-33.44"/>
          </div>

          <div>
            <label>Longitud</label>
            <input className="input" name="longitude" value={form.longitude} onChange={onChange} placeholder="-70.66"/>
          </div>
        </div>

        <div style={{display:'flex', gap:10, marginTop:12}}>
          <button className="btn btn-outline" onClick={fromBrowserGeolocation}>Usar mi ubicación actual</button>
          <button className="btn" onClick={save} disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</button>
        </div>
      </div>
    </div>
  )
}
