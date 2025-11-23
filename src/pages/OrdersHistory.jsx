import { useEffect, useMemo, useState } from 'react'
import { apiGet } from '../lib/api'
import { useAuth } from '../context/AuthContext'

export default function OrdersHistory() {
  const { token, role } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [region, setRegion] = useState('')
  const [comuna, setComuna] = useState('')
  const [buyer, setBuyer] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const data = await apiGet('/api/orders/my', token)
        setOrders(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('Error cargando historial:', err)
        setOrders([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [token])

  if (role && role !== 'producer') {
    return (
      <div className="container">
        <div className="card">
          Solo los productores pueden acceder al historial de pedidos.
        </div>
      </div>
    )
  }

  const regiones = useMemo(() => {
    const setR = new Set()
    orders.forEach(o => {
      const loc = o.consumerLocation || {}
      const reg = loc.region
      if (reg) setR.add(reg)
    })
    return Array.from(setR)
  }, [orders])

  const comunas = useMemo(() => {
    const setC = new Set()
    orders.forEach(o => {
      const loc = o.consumerLocation || {}
      const com = loc.comuna || loc.commune
      if (com) setC.add(com)
    })
    return Array.from(setC)
  }, [orders])

  const filtered = useMemo(() => {
    return orders.filter(o => {
      const fecha = new Date(o.createdAt || o.date || Date.now())

      if (fromDate) {
        const d = new Date(fromDate)
        if (fecha < d) return false
      }
      if (toDate) {
        const d = new Date(toDate)
        d.setHours(23, 59, 59, 999)
        if (fecha > d) return false
      }

      const loc = o.consumerLocation || {}
      const reg = loc.region || ''
      const com = loc.comuna || loc.commune || ''

      if (region && reg !== region) return false
      if (comuna && com !== comuna) return false

      if (buyer) {
        const name = (o.consumerId?.name || '').toLowerCase()
        if (!name.includes(buyer.toLowerCase())) return false
      }

      return true
    })
  }, [orders, fromDate, toDate, region, comuna, buyer])

  const topProducts = useMemo(() => {
    const map = new Map()
    filtered.forEach(o => {
      (o.items || []).forEach(it => {
        const id = String(it.productId?._id || it.productId || it.name || '')
        const name = it.productId?.name || it.name || 'Producto'
        const qty = Number(it.quantity || 0)
        const amount = qty * Number(it.price || 0)

        if (!map.has(id)) {
          map.set(id, { id, name, qty: 0, amount: 0 })
        }
        const entry = map.get(id)
        entry.qty += qty
        entry.amount += amount
      })
    })
    return Array.from(map.values())
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 10)
  }, [filtered])

  if (loading) {
    return (
      <div className="container">
        <div className="card">Cargando historial…</div>
      </div>
    )
  }

  return (
    <div className="container">
      <h2>Historial de pedidos</h2>
      <p style={{ color: 'var(--muted)' }}>
        Analiza tus ventas filtrando por fecha, ubicación y comprador.
      </p>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginTop: 0 }}>Filtros</h3>
        <div
          className="grid"
          style={{
            gap: 12,
            gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))',
          }}
        >
          <div>
            <label>Fecha desde</label>
            <input
              className="input"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          <div>
            <label>Fecha hasta</label>
            <input
              className="input"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
          <div>
            <label>Región</label>
            <select
              className="input"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            >
              <option value="">Todas</option>
              {regiones.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            {regiones.length === 0 && (
              <p style={{ fontSize: 11, color: 'var(--muted)' }}>
                * Aún no hay regiones registradas en los usuarios.
              </p>
            )}
          </div>
          <div>
            <label>Comuna</label>
            <select
              className="input"
              value={comuna}
              onChange={(e) => setComuna(e.target.value)}
            >
              <option value="">Todas</option>
              {comunas.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {comunas.length === 0 && (
              <p style={{ fontSize: 11, color: 'var(--muted)' }}>
                * Aún no hay comunas registradas en los usuarios.
              </p>
            )}
          </div>
          <div>
            <label>Comprador</label>
            <input
              className="input"
              placeholder="Nombre del comprador"
              value={buyer}
              onChange={(e) => setBuyer(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginTop: 0 }}>Pedidos filtrados ({filtered.length})</h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Comprador</th>
                <th>Región</th>
                <th>Comuna</th>
                <th>Estado</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => {
                const user = o.consumerId || {}
                const loc = o.consumerLocation || {}
                const reg = loc.region || '-'
                const com = loc.comuna || loc.commune || '-'

                return (
                  <tr key={o._id}>
                    <td>
                      {new Date(
                        o.createdAt || o.date || Date.now()
                      ).toLocaleDateString()}
                    </td>
                    <td>{user.name || '-'}</td>
                    <td>{reg}</td>
                    <td>{com}</td>
                    <td>{o.status}</td>
                    <td>${o.total}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Productos más vendidos</h3>
        {topProducts.length === 0 ? (
          <p>No hay productos en los pedidos filtrados.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cantidad vendida</th>
                  <th>Monto total</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.qty}</td>
                    <td>${p.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}


