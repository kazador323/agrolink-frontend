import { useEffect, useMemo, useState } from 'react'
import { apiGet } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { REGIONES, COMUNAS_POR_REGION } from '../data/chile'
import { normalizePhoneToWhatsApp } from '../lib/phone'
import { Link } from 'react-router-dom'

function haversine(lat1, lon1, lat2, lon2) {
  const toRad = d => d * Math.PI / 180
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2)**2
  return R * (2 * Math.atan2(Math.sqrt(1-a), Math.sqrt(a)))
}

export default function Catalog(){
  const { token } = useAuth()
  const [myLoc, setMyLoc] = useState(null)

  // filtros UI
  const [regionFilter, setRegionFilter]   = useState('')
  const [communeFilter, setCommuneFilter] = useState('')
  const [category, setCategory]           = useState('')

  // categorías disponibles
  const [categories, setCategories] = useState([])

  // paginación
  const [page, setPage]             = useState(1)
  const [pageSize, setPageSize]     = useState(9)
  const [total, setTotal]           = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [ratingsByProducer, setRatingsByProducer] = useState({})

  // datos
  const [products, setProducts] = useState([])

  const comunasDisponibles = useMemo(
    () => COMUNAS_POR_REGION[regionFilter] || [],
    [regionFilter]
  )

  useEffect(()=>{
    apiGet('/api/location/my', token)
      .then(doc => {
        if (doc) {
          setMyLoc(doc)
          /*if (!regionFilter) setRegionFilter(doc.region || '')
          if (!communeFilter && doc.region && COMUNAS_POR_REGION[doc.region]?.includes(doc.comuna)) {
            setCommuneFilter(doc.comuna)
          }*/
        }
      })
      .catch(()=>{})
  }, [token])

  // categorías
  useEffect(()=>{
    apiGet('/api/products/categories')
      .then(setCategories)
      .catch(()=> setCategories([]))
  },[])

  // cargar productos con filtros + paginación
  useEffect(()=>{
    const params = new URLSearchParams()
    if (regionFilter)  params.set('region', regionFilter)
    if (communeFilter) params.set('commune', communeFilter)
    if (category)      params.set('category', category)
    params.set('page', String(page))
    params.set('limit', String(pageSize))

    apiGet('/api/products?' + params.toString())
      .then(({ items, total, totalPages }) => {
        setProducts(items || [])
        setTotal(total || 0)
        setTotalPages(totalPages || 1)
      })
      .catch(console.error)
  }, [regionFilter, communeFilter, category, page, pageSize])

  useEffect(() => {
  if (!products || products.length === 0) return

  // IDs únicos de productores
  const uniqueProducerIds = [
    ...new Set(products.map(p => p.producerId).filter(Boolean))
  ]

  uniqueProducerIds.forEach(id => {
    if (ratingsByProducer[id]) return

    apiGet(`/api/ratings/producer/${id}`, token)
      .then(data => {
        setRatingsByProducer(prev => ({
          ...prev,
          [id]: data || { avgScore: null, count: 0 }
        }))
      })
      .catch(() => {
      })
  })
}, [products, ratingsByProducer, token])

  // prioridad y distancia
  const enhanced = useMemo(()=>{
    const region = myLoc?.region
    const comuna = myLoc?.comuna
    const lat = myLoc?.latitude
    const lon = myLoc?.longitude

    const list = products.map(p => {
      const loc = p.producerLocation || {}
      let priority = 3
      if (region && loc.region === region) priority = 2
      if (comuna && loc.comuna === comuna) priority = 1

      let distanceKm = null
      if (lat != null && lon != null && loc.latitude != null && loc.longitude != null) {
        distanceKm = haversine(lat, lon, loc.latitude, loc.longitude)
      }
      return { ...p, _priority: priority, _distanceKm: distanceKm }
    })

    return list.sort((a,b)=>{
      if (a._priority !== b._priority) return a._priority - b._priority
      if (a._distanceKm != null && b._distanceKm != null) return a._distanceKm - b._distanceKm
      return 0
    })
  }, [products, myLoc])

  function onRegionChange(e){
    const r = e.target.value
    setRegionFilter(r)
    setCommuneFilter(prev => (COMUNAS_POR_REGION[r]?.includes(prev) ? prev : ''))
    setPage(1)
  }
  function onCommuneChange(e){
    setCommuneFilter(e.target.value)
    setPage(1)
  }
  function onCategoryChange(e){
    setCategory(e.target.value)
    setPage(1)
  }
  function clearFilters(){
    setRegionFilter(''); setCommuneFilter(''); setCategory(''); setPage(1)
  }

  return (
    <div className="container">
      <h2>Catálogo</h2>

      <div className="card" style={{marginBottom:16}}>
        <div style={{display:'grid', gap:12, gridTemplateColumns:'repeat(3, minmax(220px, 1fr))'}}>
          <div>
            <label>Región</label>
            <select className="input" value={regionFilter} onChange={onRegionChange}>
              <option value="">-- Todas --</option>
              {REGIONES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div>
            <label>Comuna</label>
            <select
              className="input"
              value={communeFilter}
              onChange={onCommuneChange}
              disabled={!regionFilter}
            >
              <option value="">{regionFilter ? '-- Todas --' : 'Primero elige Región'}</option>
              {comunasDisponibles.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label>Categoría</label>
            <select className="input" value={category} onChange={onCategoryChange}>
              <option value="">-- Todas --</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div style={{marginTop:12, display:'flex', gap:10, alignItems:'center', flexWrap:'wrap'}}>
          {myLoc && (
            <div className="badge">Mi ubicación: {myLoc.comuna || '-'}, {myLoc.region || '-'}</div>
          )}
          {(regionFilter || communeFilter || category) && (
            <button className="btn btn-outline" onClick={clearFilters}>Limpiar filtros</button>
          )}
        </div>
      </div>

      <div className="grid grid-3">
        {enhanced.map(p=>(
          <div key={p._id} className="card product-card">
            {p.imageUrl
              ? <img src={p.imageUrl} alt="" className="thumb" style={{objectFit:'cover', width:'100%', height:140, borderRadius:12}}/>
              : <div className="thumb"/>}
            <h4>{p.name}</h4>
            <div className="price">${p.price}</div>
            {ratingsByProducer[p.producerId] && ratingsByProducer[p.producerId].avgScore != null && (
              <div style={{ marginTop: 4, fontSize: 13, color: 'var(--muted)' }}>
                ⭐ {ratingsByProducer[p.producerId].avgScore.toFixed(1)} (
                {ratingsByProducer[p.producerId].count} opiniones)
              </div>
            )}

            <div style={{marginTop:6, color:'var(--muted)', fontSize:13}}>
              {p.producerLocation
                ? <span>{p.producerLocation.comuna || '-'}, {p.producerLocation.region || '-'}</span>
                : <span>Ubicación no disponible</span>}
              {p._distanceKm != null && (
                <span className="badge" style={{marginLeft:8}}>
                  {p._distanceKm.toFixed(1)} km
                </span>
              )}
            </div>
                {p.producerPublic?.phone && (
                  <div style={{marginTop:8, display:'flex', alignItems:'center', gap:8}}>
                    <a className="link" href={normalizePhoneToWhatsApp(p.producerPublic.phone)} target="_blank" rel="noreferrer">
                      <span aria-label="WhatsApp" title="Contactar por WhatsApp" style={{fontSize:18}}>📞</span>
                      <span style={{marginLeft:6}}>{p.producerPublic.phone}</span>
                    </a>
                  </div>
                )}

            <Link className="btn" style={{ marginTop: 8, textDecoration: 'none' }} to={`/checkout?product=${p._id}`}>Comprar</Link>
          </div>
        ))}
      </div>

      <div className="card" style={{marginTop:16, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div style={{color:'var(--muted)'}}>
          {total} resultado{total===1?'':'s'} — página {page} de {totalPages}
        </div>
        <div style={{display:'flex', gap:8}}>
          <button className="btn btn-outline" disabled={page<=1} onClick={()=>setPage(p=>p-1)}>Anterior</button>
          <button className="btn" disabled={page>=totalPages} onClick={()=>setPage(p=>p+1)}>Siguiente</button>
        </div>
      </div>
    </div>
  )
}

