import React, { useEffect, useState } from 'react'
import api from '../api'

function UserForm({ onClose, onSaved, initial = {} }){
  const [form, setForm] = useState({
    name: initial.name || '',
    surname: initial.surname || '',
    email: initial.email || '',
    subscriptionType: initial.subscriptionType || 'Basic',
    subscriptionDate: initial.subscriptionDate || ''
  })

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  const submit = async (e) => {
    e.preventDefault()
    await api.post('/users', { data: form })
    onSaved()
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <input name="name" placeholder="Name" value={form.name} onChange={handle} className="w-full p-2 border rounded" />
      <input name="surname" placeholder="Surname" value={form.surname} onChange={handle} className="w-full p-2 border rounded" />
      <input name="email" placeholder="Email" value={form.email} onChange={handle} className="w-full p-2 border rounded" />
      <select name="subscriptionType" value={form.subscriptionType} onChange={handle} className="w-full p-2 border rounded">
        <option>Basic</option>
        <option>Standard</option>
        <option>Premium</option>
      </select>
      <input name="subscriptionDate" placeholder="Subscription Date (YYYY-MM-DD)" value={form.subscriptionDate} onChange={handle} className="w-full p-2 border rounded" />
      <div className="flex gap-2">
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
        <button type="button" onClick={onClose} className="px-4 py-2 rounded border">Cancel</button>
      </div>
    </form>
  )
}

export default function Users(){
  const [users, setUsers] = useState([])
  const [showForm, setShowForm] = useState(false)

  const load = async ()=>{
    try{
      const res = await api.get('/users')
      setUsers(res.data.data)
    }catch(err){
      setUsers([])
    }
  }

  useEffect(()=>{load()}, [])

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Users</h2>
        <button onClick={()=>setShowForm(true)} className="bg-green-600 text-white px-4 py-2 rounded">Add User</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {users.map((u)=> (
          <div key={u._id} className="bg-white p-4 rounded shadow">
            <h3 className="font-bold">{u.name} {u.surname}</h3>
            <p className="text-sm text-gray-600">{u.email}</p>
            <p className="mt-2">{u.subscriptionType} • {u.subscriptionDate}</p>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-full max-w-md">
            <h3 className="text-lg font-semibold mb-3">Add User</h3>
            <UserForm onClose={()=>setShowForm(false)} onSaved={() => { setShowForm(false); load() }} />
          </div>
        </div>
      )}
    </div>
  )
}
