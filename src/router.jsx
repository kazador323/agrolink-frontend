import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Auth from './pages/Auth'
import Catalog from './pages/Catalog'
import Checkout from './pages/Checkout'
import Orders from './pages/Orders'
import Producer from './pages/Producer'
import Rate from './pages/Rate'
import ProtectedRoute from './components/ProtectedRoute'
import LocationPage from './pages/Location'
import Profile from './pages/Profile'

export default function Router(){
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/catalog" element={<Catalog />} />
      <Route path="/checkout" element={
        <ProtectedRoute roles={['consumer']}><Checkout/></ProtectedRoute>
      }/>
      <Route path="/orders" element={
        <ProtectedRoute roles={['consumer','producer']}><Orders/></ProtectedRoute>
      }/>
      <Route path="/producer" element={
  <ProtectedRoute roles={['producer']}><Producer/></ProtectedRoute>
}/>
      <Route path="/rate/:orderId" element={
        <ProtectedRoute roles={['consumer']}><Rate/></ProtectedRoute>
      }/>
      <Route path="/location" element={
  <ProtectedRoute roles={['consumer','producer','admin']}><LocationPage/></ProtectedRoute>
}/>
<Route path="/me" element={<ProtectedRoute roles={['consumer','producer','admin']}><Profile/></ProtectedRoute>} />
    </Routes>
  )
}
