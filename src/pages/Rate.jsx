import { useParams } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { apiPost } from '../lib/api'

export default function Rate(){
  const { orderId } = useParams()
  const { token } = useAuth()
  const [score,setScore]=useState(5)
  const [comment,setComment]=useState('')

  async function send(){
    await apiPost('/api/ratings', { orderId, score, comment }, token)
    alert('Calificación enviada')
  }

  return (
    <div className="container" style={{maxWidth:560}}>
      <div className="card">
        <h2>Evaluar pedido {orderId}</h2>
        <label>Puntuación</label>
        <select className="input" value={score} onChange={(e)=>setScore(Number(e.target.value))}>
          {[1,2,3,4,5].map(n=><option key={n} value={n}>{n}</option>)}
        </select>
        <label style={{marginTop:10}}>Comentario</label>
        <textarea className="input" rows="5" value={comment} onChange={e=>setComment(e.target.value)} />
        <button className="btn" style={{marginTop:12}} onClick={send}>Enviar</button>
      </div>
    </div>
  )
}
