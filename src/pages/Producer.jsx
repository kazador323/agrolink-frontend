import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { apiGet, apiPost, apiPut, apiDelete } from '../lib/api'

const CATEGORIES = ['Verduras', 'Frutas', 'Lácteos', 'Huevos', 'Cereales', 'Miel', 'Otros']

const emptyForm = () => ({
  name:'', category:'', price:'', stock:'', description:'', imageUrl:''
})

export default function Producer(){
  const { token } = useAuth()
  const [items, setItems] = useState([])
  const [form, setForm] = useState(emptyForm())
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  async function load(){
    setLoading(true)
    try{
      const data = await apiGet('/api/products/mine', token)
      setItems(data)
    } finally{
      setLoading(false)
    }
  }
  useEffect(()=>{ load() },[])

  const onChange = e => setForm({...form, [e.target.name]: e.target.value})

  function validate(){
    const errors = []
    if(!form.name.trim()) errors.push('Nombre es obligatorio')
    const price = Number(form.price)
    const stock = Number(form.stock)
    if(Number.isNaN(price) || price <= 0) errors.push('Precio debe ser un número mayor a 0')
    if(Number.isNaN(stock) || stock < 0) errors.push('Stock debe ser un número mayor o igual a 0')
    if(form.imageUrl && !/^https?:\/\/.+/i.test(form.imageUrl)) errors.push('La URL de imagen debe comenzar con http(s)://')
    return errors
  }

  async function create(){
    const errors = validate()
    if(errors.length){ return alert(errors.join('\n')) }
    setSaving(true); setMsg('')
    try{
      const body = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
      }
      await apiPost('/api/products', body, token)
      setForm(emptyForm()); setMsg('Producto creado ✔')
      await load()
    }catch(e){ alert('Error al crear: ' + e.message) }
    finally{ setSaving(false) }
  }

  function startEdit(p){
    setEditingId(p._id)
    setForm({
      name: p.name ?? '',
      category: p.category ?? '',
      price: p.price ?? '',
      stock: p.stock ?? '',
      description: p.description ?? '',
      imageUrl: p.imageUrl ?? ''
    })
    setMsg('')
  }

  async function save(){
    const errors = validate()
    if(errors.length){ return alert(errors.join('\n')) }
    setSaving(true); setMsg('')
    try{
      const body = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
      }
      await apiPut(`/api/products/${editingId}`, body, token)
      setEditingId(null); setForm(emptyForm()); setMsg('Producto actualizado ✔')
      await load()
    }catch(e){ alert('Error al actualizar: ' + e.message) }
    finally{ setSaving(false) }
  }

  async function remove(id){
    if(!confirm('¿Eliminar este producto?')) return
    try{
      await apiDelete(`/api/products/${id}`, token)
      await load()
    }catch(e){ alert('Error al eliminar: ' + e.message) }
  }

  return (
    <div className="container">
      <h2>Panel de Productor</h2>

      <div className="card" style={{marginBottom:16}}>
        <h3 style={{marginBottom:10}}>{editingId ? 'Editar producto' : 'Nuevo producto'}</h3>

        {msg && <div className="badge" style={{display:'inline-block', marginBottom:10}}>{msg}</div>}

        <div className="grid" style={{gap:12, gridTemplateColumns:'1fr 1fr'}}>
          <div>
            <label>Nombre *</label>
            <input className="input" name="name" value={form.name} onChange={onChange} placeholder="Ej: Tomate orgánico 1kg"/>
          </div>
          <div>
            <label>Categoría</label>
            <select className="input" name="category" value={form.category} onChange={onChange}>
              <option value="">-- Selecciona --</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div style={{gridColumn:'1 / -1'}}>
            <label>Descripción</label>
            <textarea className="input" rows={3} name="description" value={form.description} onChange={onChange}
              placeholder="Breve detalle del producto, origen, certificaciones, etc."/>
          </div>

          <div>
            <label>Precio *</label>
            <input className="input" name="price" value={form.price} onChange={onChange} placeholder="0"/>
          </div>
          <div>
            <label>Stock *</label>
            <input className="input" name="stock" value={form.stock} onChange={onChange} placeholder="0"/>
          </div>

          <div style={{gridColumn:'1 / -1'}}>
            <label>Imagen (URL)</label>
            <input className="input" name="imageUrl" value={form.imageUrl} onChange={onChange} placeholder="https://..."/>
            {form.imageUrl && /^https?:\/\/.+/i.test(form.imageUrl) && (
              <div style={{marginTop:8}}>
                <img src={form.imageUrl} alt="preview" style={{maxWidth:240, borderRadius:12, boxShadow:'var(--shadow)'}} onError={(e)=>{e.currentTarget.style.display='none'}}/>
              </div>
            )}
          </div>
        </div>

        <div style={{display:'flex', gap:10, marginTop:12}}>
          {!editingId ? (
            <button className="btn" disabled={saving} onClick={create}>
              {saving ? 'Guardando...' : 'Agregar'}
            </button>
          ) : (
            <>
              <button className="btn" disabled={saving} onClick={save}>
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
              <button className="btn btn-outline" disabled={saving} onClick={() => { setEditingId(null); setForm(emptyForm()); setMsg('Edición cancelada') }}>
                Cancelar
              </button>
            </>
          )}
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table--mobile">
          <thead>
            <tr><th>Producto</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={5}>Cargando...</td></tr>}
            {!loading && items.length===0 && <tr><td colSpan={5}>No tienes productos aún.</td></tr>}
            {items.map(p=>(
              <tr key={p._id}>
                <td>
                  <span className="td-label">Producto</span>
                  <div style={{display:'flex', alignItems:'center', gap:10}}>
                    {p.imageUrl ? <img src={p.imageUrl} alt="" style={{width:48,height:48,objectFit:'cover',borderRadius:8}}/> : <div style={{width:48,height:48,background:'rgba(165,214,167,.35)',borderRadius:8}}/>}
                    <div>{p.name}</div>
                  </div>
                </td>
                <td><span className="td-label">Categoría</span>{p.category || '-'}</td>
                <td><span className="td-label">Precio</span>${p.price}</td>
                <td><span className="td-label">Stock</span>{p.stock}</td>
                <td>
                  <span className="td-label">Acciones</span>
                  <div style={{display:'flex', gap:8}}>
                    <button className="btn btn-outline" onClick={()=>startEdit(p)}>Editar</button>
                    <button className="btn" onClick={()=>remove(p._id)}>Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}
