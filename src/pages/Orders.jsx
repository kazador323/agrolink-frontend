import { useEffect, useMemo, useState } from 'react'
import { apiGet, apiPut } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { normalizePhoneToWhatsApp } from '../lib/phone'

function StatusBadge({ status }) {
  let cls = 'badge-status '
  let label = status
  if (status === 'pending') { cls += 'is-pending'; label = 'Pendiente' }
  if (status === 'paid')    { cls += 'is-paid';    label = 'Pagado' }
  if (status === 'delivered'){cls += 'is-done';    label = 'Entregado' }
  return <span className={cls}>{label}</span>
}

export default function Orders(){
  const { token, role } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState('')

  async function load() {
    setLoading(true); setError('')
    try{
      const data = await apiGet('/api/orders/my', token)
      setOrders(Array.isArray(data) ? data : [])
    }catch(e){
      setError(e.message || 'Error al cargar pedidos')
    }finally{
      setLoading(false)
    }
  }

  useEffect(()=>{ load() /* eslint-disable-next-line */ }, [])

  async function markDelivered(id){
    if (!id) return
    if (!confirm('¿Marcar este pedido como ENTREGADO?')) return
    try{
      setUpdatingId(id)
      await apiPut(`/api/orders/${id}/deliver`, {}, token)
      await load()
    }catch(e){
      alert('No se pudo marcar como entregado: ' + (e.message || 'Error'))
    }finally{
      setUpdatingId('')
    }
  }

  const emptyMsg = useMemo(()=>{
    if (role === 'producer') return 'No tienes pedidos recibidos por ahora.'
    if (role === 'consumer') return 'Aún no has realizado pedidos.'
    return 'No hay pedidos para mostrar.'
  }, [role])

  return (
    <div className="container">
      <h2>Mis pedidos</h2>

      {loading && <div className="card">Cargando…</div>}

      {error && (
        <div className="card" style={{borderColor:'#e57373', background:'#ffebee', color:'#b71c1c'}}>
          {error}
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="card">{emptyMsg}</div>
      )}

      {!loading && !error && orders.length > 0 && (
        <div className="card" style={{padding:0}}>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th style={{minWidth:140}}>Código</th>
                  <th style={{minWidth:180}}>Fecha</th>
                  <th style={{minWidth:200}}>Items</th>
                  <th style={{minWidth:110}}>Total</th>
                  <th style={{minWidth:120}}>Estado</th>
                  <th style={{minWidth:220}}>Contacto</th>
                  {role === 'producer' && <th style={{minWidth:160}}>Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o._id}>
                    <td><code>{o._id}</code></td>

                    <td>{new Date(o.createdAt || o.date || Date.now()).toLocaleString()}</td>

                    <td>
                      <div style={{display:'flex', flexDirection:'column', gap:6}}>
                        {(o.items || []).map((it, idx) => (
                          <div key={idx} style={{display:'flex', alignItems:'center', gap:8}}>
                            {it.productId?.imageUrl
                              ? <img alt="" src={it.productId.imageUrl} style={{width:36, height:36, objectFit:'cover', borderRadius:6}}/>
                              : <div style={{width:36, height:36, background:'rgba(165,214,167,.35)', borderRadius:6}}/>
                            }
                            <div>
                              <div style={{fontWeight:600}}>
                                {it.productId?.name || it.name || 'Producto'}
                              </div>
                              <div style={{fontSize:12, color:'var(--muted)'}}>
                                x{it.quantity} · ${it.price}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>

                    <td><div className="price">${o.total}</div></td>

                    <td><StatusBadge status={o.status || o.estado} /></td>

                    <td>
                      {role === 'consumer'
                        ? (o.producerId?.phone ? (
                            <a
                              className="link"
                              href={normalizePhoneToWhatsApp(o.producerId.phone)}
                              target="_blank"
                              rel="noreferrer"
                              title="Contactar por WhatsApp"
                            >
                              📞 {o.producerId.phone}
                            </a>
                          ) : <span>-</span>)
                        : (o.consumerId?.phone ? (
                            <a
                              className="link"
                              href={normalizePhoneToWhatsApp(o.consumerId.phone)}
                              target="_blank"
                              rel="noreferrer"
                              title="Contactar por WhatsApp"
                            >
                              📞 {o.consumerId.phone}
                            </a>
                          ) : <span>-</span>)
                      }
                    </td>

                    {role === 'producer' && (
                      <td>
                        <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
                          <button
                            className="btn"
                            disabled={o.status !== 'paid' || updatingId === o._id}
                            onClick={()=>markDelivered(o._id)}
                            title={o.status === 'paid' ? 'Marcar entregado' : 'Disponible cuando esté pagado'}
                          >
                            {updatingId === o._id ? 'Procesando…' : 'Marcar entregado'}
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
