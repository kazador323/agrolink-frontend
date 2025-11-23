import { Link } from 'react-router-dom'
import Router from './router'
import { useAuth } from './context/AuthContext'

export default function App(){
  const { user, role, logout } = useAuth()

  return (
    <div className="app-root">
      <header className="nav sticky">
        <div className="wrap">
          <Link className="brand" to="/">AgroLink</Link>
          <Link className="link" to="/catalog">Catálogo</Link>
          {role === 'consumer' && <Link className="link" to="/checkout">Comprar</Link>}
          <span style={{marginLeft:'auto', display:'flex', gap:'12px', alignItems:'center'}}>
            {user ? (
              <>
                <span className="badge">Rol: {role === 'producer' && <Link className="link" to="/producer">Mi panel</Link> }</span>
                <Link className="link" to="/orders">Mis pedidos</Link>
                {role === 'producer' && (
                  <Link className="link" to="/orders/history">
                    Historial
                  </Link>
                )}
                {user && <Link className="link" to="/location">Ubicación</Link>}
                {user && <Link className="link" to="/me">Mis datos</Link>}
                <button className="btn" onClick={logout}>Salir</button>
              </>
            ) : (
              <Link className="btn" to="/auth">Ingresar / Registrarse</Link>
            )}
          </span>
        </div>
      </header>

      {/* Contenido principal: ocupa el espacio disponible */}
      <main className="app-main">
        <Router />
      </main>

      {/* Pie de página */}
      <footer className="nav footer">
        <div className="wrap footer-wrap">
          {/* Datos de contacto */}
          <div style={{ fontSize: 14 }}>
            <div>
              <strong>Contacto:</strong>{' '}
              <span>{/* agrega aquí el número de contacto */}</span>
            </div>
            <div>
              <strong>Dirección:</strong>{' '}
              <span>{/* agrega aquí la dirección */}</span>
            </div>
          </div>

          {/* Redes sociales */}
          <div className="footer-social">
            <a
              href="" // enlace a WhatsApp
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp"
              className="link"
            >
              📱
            </a>
            <a
              href="" // enlace a Instagram
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="link"
            >
              📸
            </a>
            <a
              href="" // enlace a Facebook
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="link"
            >
              📘
            </a>
            <a
              href="" // enlace a Twitter/X
              target="_blank"
              rel="noreferrer"
              aria-label="Twitter / X"
              className="link"
            >
              𝕏
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
