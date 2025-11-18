import { Link } from 'react-router-dom'
import Router from './router'
import { useAuth } from './context/AuthContext'

export default function App(){
  const { user, role, logout } = useAuth()
  return (
    <>
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
      <Router/>
    </>
  )
}
