import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { apiGet, apiPost } from '../lib/api'
import { useLocation, useNavigate } from 'react-router-dom'

const PAYMENT_METHODS = [
  { value: 'transferencia', label: 'Transferencia directa al productor' },
  { value: 'efectivo', label: 'Pago en efectivo contra entrega' },
  { value: 'tarjeta', label: 'Tarjeta (crédito o débito)' },
]

export default function Checkout() {
  const { token } = useAuth()
  const qs = new URLSearchParams(useLocation().search)
  const navigate = useNavigate()
  const preselectedProduct = qs.get('product') || ''

  const [products, setProducts] = useState([])
  const [productId, setProductId] = useState('')
  const [quantity, setQuantity] = useState(1)

  const [cartItems, setCartItems] = useState([])

  const cartProducerId = useMemo(
    () => (cartItems.length > 0 ? cartItems[0].producerId : null),
    [cartItems]
  )

  const filteredProducts = useMemo(
    () => {
      if (!cartProducerId) return products
      return products.filter(p => String(p.producerId) === String(cartProducerId))
    },
    [products, cartProducerId]
  )

  const [method, setMethod] = useState('transferencia')
  const [cardType, setCardType] = useState('debito')
  const [cardNumber, setCardNumber] = useState('')
  const [cardExp, setCardExp] = useState('') // MM/YY
  const [cardCVV, setCardCVV] = useState('')

  const [orderId, setOrderId] = useState('')
  const [statusMsg, setStatusMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        if (preselectedProduct) {
          const p = await apiGet(`/api/products/${preselectedProduct}`, token)
          if (!mounted) return
          setProducts(p ? [p] : [])
          setProductId(p?._id || '')
        } else {
          const data = await apiGet('/api/products?limit=50&page=1', token)
          if (!mounted) return
          const items = Array.isArray(data)
            ? data
            : (Array.isArray(data?.items) ? data.items : [])
          setProducts(items)
          if (items.length) setProductId(items[0]._id)
        }
      } catch (e) {
        console.error('Checkout load error:', e)
        setProducts([])
        setProductId('')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [preselectedProduct, token])

  const selected = useMemo(
    () => products.find(p => p._id === productId),
    [products, productId]
  )

  const total = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }, [cartItems])

  function validateBeforeAdd() {
    if (!selected) return 'Selecciona un producto'
    const q = Number(quantity)
    if (Number.isNaN(q) || q <= 0) return 'Cantidad inválida'

    if (cartItems.length > 0) {
      const currentProducer = cartItems[0].producerId
      if (String(selected.producerId) !== String(currentProducer)) {
        return 'No puedes agregar productos de distintos productores en el mismo pedido.'
      }
    }

    return null
  }

  function validateBeforeOrder() {
    if (cartItems.length === 0) return 'Agrega al menos un producto al pedido'
    return null
  }

  function validateCard() {
    if (method !== 'tarjeta') return null
    const num = String(cardNumber).replace(/\s+/g, '')
    if (!/^\d{13,19}$/.test(num)) return 'Número de tarjeta inválido'
    if (!/^\d{2}\/\d{2}$/.test(cardExp)) return 'Fecha (MM/YY) inválida'
    const [mm] = cardExp.split('/').map(v => parseInt(v, 10))
    if (mm < 1 || mm > 12) return 'Mes inválido'
    if (!/^\d{3,4}$/.test(cardCVV)) return 'CVV inválido'
    return null
  }

  function addItemToCart() {
    const err = validateBeforeAdd()
    if (err) return alert(err)

    const qty = Number(quantity)
    const item = {
      productId: selected._id,
      name: selected.name,
      price: selected.price,
      quantity: qty,
      producerId: selected.producerId,
    }

    setCartItems(prev => {
      const existing = prev.find(i => i.productId === item.productId)

      if (existing) {
        return prev.map(i =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + qty }
            : i
        )
      }

      return [...prev, item]
    })

    setQuantity(1)
  }

  function removeFromCart(id) {
    setCartItems(prev => prev.filter(i => i.productId !== id))
  }

  async function createOrder() {
    const err = validateBeforeOrder()
    if (err) return alert(err)

    try {
      setBusy(true); setStatusMsg('')

      const producerId = cartItems[0].producerId

      const body = {
        producerId,
        items: cartItems.map(i => ({
          productId: i.productId,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
        })),
        total,
      }

      const o = await apiPost('/api/orders', body, token)
      setOrderId(o._id)

      if (method === 'tarjeta') {
        const cardErr = validateCard()
        if (cardErr) { setBusy(false); return alert(cardErr) }
        await apiPost(
          '/api/payments',
          { orderId: o._id, amount: total, method: `tarjeta-${cardType}` },
          token
        )
        setStatusMsg('Pedido creado y pago confirmado ✔')
      } else {
        setStatusMsg('Pedido creado: pendiente de pago/entrega ✔')
      }

      setCartItems([])
    } catch (e) {
      alert('Error en Checkout: ' + (e?.message || 'desconocido'))
    } finally {
      setBusy(false)
    }
  }

  if (loading) return (
    <div className="container">
      <div className="card">Cargando…</div>
    </div>
  )

  return (
    <div className="container grid" style={{ gap: 16, gridTemplateColumns: '1fr 340px' }}>
      <section className="card">
        <h3>Checkout</h3>

        <label style={{ marginTop: 8 }}>Producto</label>
        <select
          className="input"
          value={productId}
          onChange={e => setProductId(e.target.value)}
        >
          {filteredProducts.map(p => (
            <option key={p._id} value={p._id}>
              {p.name} — ${p.price}{p.stock !== undefined ? ` (stock ${p.stock})` : ''}
            </option>
          ))}
        </select>

        {cartProducerId && (
          <p style={{ marginTop: 4, fontSize: 13, color: '#b71c1c' }}>
            Solo puedes agregar productos del mismo productor en un pedido. Se muestran solo productos de ese productor.
          </p>
        )}

        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
          <div>
            <label>Cantidad</label>
            <input
              className="input"
              type="number"
              min="1"
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
            />
          </div>
          <div>
            <label>Precio unitario</label>
            <input
              className="input"
              value={selected ? `$${selected.price}` : '-'}
              disabled
            />
          </div>
        </div>

        <div style={{ marginTop: 10 }}>
          <button
            className="btn btn-secondary"
            type="button"
            onClick={addItemToCart}
            disabled={!productId}>
            Agregar producto al pedido
          </button>
        </div>

        <div className="card" style={{ marginTop: 16, background: '#fafafa' }}>
          <h3 style={{ marginTop: 0 }}>Método de pago</h3>
          <select
            className="input"
            value={method}
            onChange={e => setMethod(e.target.value)}
          >
            {PAYMENT_METHODS.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>

          {method === 'tarjeta' && (
            <div style={{ marginTop: 12 }}>
              <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label>Tipo</label>
                  <select
                    className="input"
                    value={cardType}
                    onChange={e => setCardType(e.target.value)}
                  >
                    <option value="debito">Débito</option>
                    <option value="credito">Crédito</option>
                  </select>
                </div>
                <div>
                  <label>Número de tarjeta</label>
                  <input
                    className="input"
                    placeholder="4111 1111 1111 1111"
                    value={cardNumber}
                    onChange={e => setCardNumber(e.target.value)}
                  />
                </div>
                <div>
                  <label>Vencimiento (MM/YY)</label>
                  <input
                    className="input"
                    placeholder="MM/YY"
                    value={cardExp}
                    onChange={e => setCardExp(e.target.value)}
                  />
                </div>
                <div>
                  <label>CVV</label>
                  <input
                    className="input"
                    placeholder="123"
                    value={cardCVV}
                    onChange={e => setCardCVV(e.target.value)}
                  />
                </div>
              </div>
              <p style={{ color: 'var(--muted)', fontSize: 12, marginTop: 8 }}>
                * Demo: no se procesan tarjetas reales (solo registra un pago simulado).
              </p>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
          <button
            className="btn"
            onClick={createOrder}
            disabled={busy || cartItems.length === 0}
          >
            {busy ? 'Procesando…' : (method === 'tarjeta' ? 'Pagar y crear pedido' : 'Crear pedido')}
          </button>
        </div>

        {statusMsg && (
          <div className="badge" style={{ display: 'inline-block', marginTop: 10 }}>
            {statusMsg}
          </div>
        )}
      </section>

      <aside className="card">
        <h3>Resumen</h3>
        <div>Pedido: {orderId || '-'}</div>

        {orderId && (
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              type="button"
              className="btn btn-small"
              onClick={() => navigate('/orders')}
            >
              Ver Mis pedidos
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-small"
              onClick={() => {
                setCartItems([])
                setOrderId('')
                setStatusMsg('')
              }}
            >
              Comprar más
            </button>
          </div>
        )}

        <div style={{ marginTop: 8 }}>
          {cartItems.length === 0 ? (
            <div>No hay productos en el pedido.</div>
          ) : (
            <>
              <h4>Productos en este pedido</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {cartItems.map(item => (
                  <li
                    key={item.productId}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '4px 0',
                    }}
                  >
                    <span>
                      {item.name} x {item.quantity} — ${item.price * item.quantity}
                    </span>
                    <button
                      type="button"
                      className="btn btn-small"
                      onClick={() => removeFromCart(item.productId)}
                    >
                      Quitar
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <div style={{ marginTop: 12 }} className="price">
          Total: ${total}
        </div>
      </aside>
    </div>
  )
}
