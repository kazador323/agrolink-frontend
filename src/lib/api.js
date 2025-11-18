const API = import.meta.env.VITE_API_URL

export async function apiGet(path, token){
  const res = await fetch(`${API}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  })
  if(!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function apiPost(path, body, token){
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type':'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(body)
  })
  if(!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function apiPut(path, body, token){
  const res = await fetch(`${API}${path}`, {
    method: 'PUT',
    headers: {
      'Content-Type':'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(body)
  })
  if(!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function apiDelete(path, token){
  const res = await fetch(`${API}${path}`, {
    method: 'DELETE',
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  })
  if(!res.ok) throw new Error(await res.text())
  return res.json()
}
