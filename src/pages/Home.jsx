import { Link } from 'react-router-dom'

export default function Home(){
  return (
    <div className="container">
      <div className="grid grid-2" style={{ alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1>AgroLink: conecta consumidores con productores locales</h1>
          <p style={{ color: 'var(--muted)' }}>
            AgroLink es una plataforma que acerca a las personas con los productores agrícolas de su zona,
            facilitando compras directas, precios justos y mayor trazabilidad de los alimentos.
          </p>
          <p style={{ color: 'var(--muted)', marginTop: 8 }}>
            Descubre productos frescos, apoya la economía local y construye una cadena de abastecimiento más
            corta, transparente y sostenible.
          </p>
          <Link
            to="/catalog"
            className="btn"
            style={{ marginTop: 12, textDecoration: 'none' }}
          >
            Ver productos
          </Link>
        </div>

        <div className="hero">
          <div
            className="thumb"
            style={{
              height: 220,
              background: 'var(--accent)',
              borderRadius: 'var(--radius)',
            }}
          />
          <p style={{ marginTop: 10, color: 'var(--muted)' }}>
            Ilustración de la plataforma AgroLink conectando consumidores y productores.
          </p>
        </div>
      </div>

      <div
        className="grid"
        style={{
          gap: 16,
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        }}
      >
        <div className="card">
          <h3>Nuestra misión</h3>
          <p>
            Facilitar el acceso a alimentos frescos y de calidad, fortaleciendo a los pequeños y medianos
            productores mediante un canal de venta directo, digital y cercano a las personas.
          </p>
          <p>
            Buscamos que cada compra en AgroLink sea una oportunidad para mejorar los ingresos de los productores
            y para que los consumidores conozcan mejor el origen de lo que consumen.
          </p>
        </div>

        <div className="card">
          <h3>Nuestra visión</h3>
          <p>
            Ser la plataforma de referencia en Chile para el comercio justo de productos agrícolas, impulsando
            redes de colaboración entre comunidades rurales y urbanas.
          </p>
          <p>
            Imaginamos un futuro donde la tecnología acerque a las personas al campo, promoviendo cadenas de
            abastecimiento más cortas, sostenibles y transparentes.
          </p>
        </div>
      </div>
    </div>
  )
}
