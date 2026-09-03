import React, { useEffect, useState } from 'react'
import api from '../api'

function BookForm({ onClose, onSaved, initial = {} }){
  const [form, setForm] = useState({
    title: initial.title || '',
    author: initial.author || '',
    genre: initial.genre || '',
    price: initial.price || '',
    publisher: initial.publisher || ''
  })

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  const submit = async (e) => {
    e.preventDefault()
    await api.post('/books', { data: form })
    onSaved()
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <input name="title" placeholder="Title" value={form.title} onChange={handle} className="w-full p-2 border rounded" />
      <input name="author" placeholder="Author" value={form.author} onChange={handle} className="w-full p-2 border rounded" />
      <input name="genre" placeholder="Genre" value={form.genre} onChange={handle} className="w-full p-2 border rounded" />
      <input name="price" placeholder="Price" value={form.price} onChange={handle} className="w-full p-2 border rounded" />
      <input name="publisher" placeholder="Publisher" value={form.publisher} onChange={handle} className="w-full p-2 border rounded" />
      <div className="flex gap-2">
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
        <button type="button" onClick={onClose} className="px-4 py-2 rounded border">Cancel</button>
      </div>
    </form>
  )
}

export default function Books(){
  const [books, setBooks] = useState([])
  const [showForm, setShowForm] = useState(false)

  const load = async ()=>{
    try{
      const res = await api.get('/books')
      setBooks(res.data.data)
    }catch(err){
      setBooks([])
    }
  }

  useEffect(()=>{load()}, [])

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Books</h2>
        <button onClick={()=>setShowForm(true)} className="bg-green-600 text-white px-4 py-2 rounded">Add Book</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {books.map((b)=> (
          <div key={b._id} className="bg-white p-4 rounded shadow">
            <h3 className="font-bold">{b.title}</h3>
            <p className="text-sm text-gray-600">{b.author} — {b.genre}</p>
            <p className="mt-2">{b.publisher} • ${b.price}</p>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-full max-w-md">
            <h3 className="text-lg font-semibold mb-3">Add Book</h3>
            <BookForm onClose={()=>setShowForm(false)} onSaved={() => { setShowForm(false); load() }} />
          </div>
        </div>
      )}
    </div>
  )
}
