import { Link } from 'react-router-dom'

export default function Home(){
  return (
    <div className="container">
      <div className="grid grid-2" style={{alignItems:'center'}}>
        <div>
          <h1>Conecta consumidores con productores locales</h1>
          <p style={{color:'var(--muted)'}}>
            Compra directo al origen con precios justos y trazabilidad. Ahorra y apoya al productor local.
          </p>
          <Link to="/catalog" className="btn" style={{marginTop:12, textDecoration:'none'}}>Ver productos</Link>
        </div>
        <div className="hero">
          <div className="thumb" style={{height:220, background:'var(--accent)', borderRadius:'var(--radius)'}}/>
          <p style={{marginTop:10,color:'var(--muted)'}}>Ilustración de la plataforma AgroLink</p>
        </div>
      </div>
    </div>
  )
}
