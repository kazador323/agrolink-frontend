import { useEffect, useMemo, useState } from 'react'
import { apiGet, apiPut } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { normalizePhoneToWhatsApp } from '../lib/phone'
import { Link } from 'react-router-dom'

function StatusBadge({ status }) {
  let cls = 'badge-status '
  let label = status
  if (status === 'pending') { cls += 'is-pending'; label = 'Pendiente' }
  if (status === 'paid') { cls += 'is-paid'; label = 'Pagado' }
  if (status === 'in_transit') { cls += 'is-paid'; label = 'En reparto' }
  if (status === 'delivered') { cls += 'is-done'; label = 'Entregado' }
  if (status === 'cancelled') { cls += 'is-cancelled'; label = 'Cancelado' }
  return <span className={cls}>{label}</span>
}

export default function Orders() {
  const { token, role } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState('')

  const [page, setPage] = useState(1)
  const PAGE_SIZE = 6

  async function load() {
    setLoading(true); setError('')
    try {
      const data = await apiGet('/api/orders/my', token)
      setOrders(Array.isArray(data) ? data : [])
      setPage(1)
    } catch (e) {
      setError(e.message || 'Error al cargar pedidos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function shipOrder(id) {
    if (!id) return
    if (!confirm('¿Marcar este pedido como EN REPARTO?')) return
    try {
      setUpdatingId(id)
      await apiPut(`/api/orders/${id}/ship`, {}, token)
      await load()
    } catch (e) {
      alert('No se pudo actualizar el pedido: ' + (e.message || 'Error'))
    } finally {
      setUpdatingId('')
    }
  }

  async function deliverOrder(id) {
    if (!id) return
    if (!confirm('¿Marcar este pedido como ENTREGADO?')) return
    try {
      setUpdatingId(id)
      await apiPut(`/api/orders/${id}/deliver`, {}, token)
      await load()
    } catch (e) {
      alert('No se pudo marcar como entregado: ' + (e.message || 'Error'))
    } finally {
      setUpdatingId('')
    }
  }

  async function cancelOrder(id) {
    if (!id) return
    if (!confirm('¿Seguro que deseas CANCELAR este pedido?')) return
    try {
      setUpdatingId(id)
      await apiPut(`/api/orders/${id}/cancel`, {}, token)
      await load()
    } catch (e) {
      alert('No se pudo cancelar el pedido: ' + (e.message || 'Error'))
    } finally {
      setUpdatingId('')
    }
  }

  const stats = useMemo(() => {
    const total = orders.length
    const pending = orders.filter(o => o.status === 'pending').length
    const paid = orders.filter(o => o.status === 'paid').length
    const delivered = orders.filter(o => o.status === 'delivered').length
    const totalAmount = orders.reduce((acc, o) => acc + Number(o.total || 0), 0)
    return { total, pending, paid, delivered, totalAmount }
  }, [orders])

  const totalPages = Math.max(1, Math.ceil(orders.length / PAGE_SIZE))
  const pageOrders = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return orders.slice(start, start + PAGE_SIZE)
  }, [orders, page])

  function goPrev() { setPage(p => Math.max(1, p - 1)) }
  function goNext() { setPage(p => Math.min(totalPages, p + 1)) }

  const emptyMsg = useMemo(() => {
    if (role === 'producer') return 'No tienes pedidos recibidos por ahora.'
    if (role === 'consumer') return 'Aún no has realizado pedidos.'
    return 'No hay pedidos para mostrar.'
  }, [role])

  return (
    <div className="container">
      <h2>Mis pedidos</h2>

      {!loading && !error && orders.length > 0 && (
        <div
          className="grid"
          style={{ gap: 12, marginBottom: 16, gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))' }}
        >
          <div className="card"><div className="label">Total pedidos</div><div className="price">{stats.total}</div></div>
          <div className="card"><div className="label">Pendientes</div><div className="price">{stats.pending}</div></div>
          <div className="card"><div className="label">Pagados</div><div className="price">{stats.paid}</div></div>
          <div className="card"><div className="label">Entregados</div><div className="price">{stats.delivered}</div></div>
          <div className="card"><div className="label">Monto total</div><div className="price">${stats.totalAmount}</div></div>
        </div>
      )}

      {loading && <div className="card">Cargando…</div>}
      {error && <div className="card">{error}</div>}
      {!loading && !error && orders.length === 0 && <div className="card">{emptyMsg}</div>}

      {!loading && !error && orders.length > 0 && (
        <>
          <div className="card" style={{ padding: 0 }}>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Fecha</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th>Contacto</th>
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {pageOrders.map(o => {
                    const status = o.status
                    return (
                      <tr key={o._id}>
                        <td><code>{o._id}</code></td>
                        <td>{new Date(o.createdAt).toLocaleString()}</td>

                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {o.items.map((it, idx) => (
                              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                {it.productId?.imageUrl
                                  ? <img src={it.productId.imageUrl} alt="" style={{ width: 36, height: 36, borderRadius: 6 }} />
                                  : <div style={{ width: 36, height: 36, background: '#eee', borderRadius: 6 }} />}
                                <div>
                                  <strong>{it.productId?.name || 'Producto'}</strong>
                                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>x{it.quantity} · ${it.price}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>

                        <td><div className="price">${o.total}</div></td>
                        <td><StatusBadge status={status} /></td>

                        <td>
                          {role === 'consumer'
                            ? (o.producerId?.phone
                                ? <a className="link" target="_blank" href={normalizePhoneToWhatsApp(o.producerId.phone)}>📞 {o.producerId.phone}</a>
                                : '-')
                            : (o.consumerId?.phone
                                ? <a className="link" target="_blank" href={normalizePhoneToWhatsApp(o.consumerId.phone)}>📞 {o.consumerId.phone}</a>
                                : '-')}
                        </td>

                        <td>
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>

                            {role === 'consumer' && status === 'pending' && (
                              <button
                                className="btn btn-outline"
                                disabled={updatingId === o._id}
                                onClick={() => cancelOrder(o._id)}
                              >
                                {updatingId === o._id ? 'Procesando…' : 'Cancelar'}
                              </button>
                            )}
                            {role === 'consumer' && status === 'delivered' && (
                              <Link className="btn btn-outline" to={`/rate/${o._id}`}>
                                Evaluar
                              </Link>
                            )}

                            {role === 'producer' && (
                              <>
                                {(status === 'pending' || status === 'paid') && (
                                  <button
                                    className="btn btn-outline"
                                    disabled={updatingId === o._id}
                                    onClick={() => shipOrder(o._id)}
                                  >
                                    {updatingId === o._id ? 'Procesando…' : 'En reparto'}
                                  </button>
                                )}

                                {status === 'in_transit' && (
                                  <button
                                    className="btn"
                                    disabled={updatingId === o._id}
                                    onClick={() => deliverOrder(o._id)}
                                  >
                                    {updatingId === o._id ? 'Procesando…' : 'Entregar'}
                                  </button>
                                )}

                                {role === 'producer' && (status === 'pending' || status === 'paid') && (
                                  <button
                                    className="btn btn-outline"
                                    style={{ borderColor: '#e57373', color: '#b71c1c' }}
                                    disabled={updatingId === o._id}
                                    onClick={() => cancelOrder(o._id)}
                                  >
                                    {updatingId === o._id ? 'Procesando…' : 'Cancelar'}
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* PAGINACIÓN */}
          <div className="card" style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
            <span>{orders.length} resultados — página {page} de {totalPages}</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-outline" disabled={page === 1} onClick={goPrev}>Anterior</button>
              <button className="btn" disabled={page === totalPages} onClick={goNext}>Siguiente</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
