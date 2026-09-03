import React, { useEffect, useState } from 'react'
import api from '../api'

function BookForm({ onClose, onSaved, initial = {}, editingId = null }){
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
    if (editingId) {
      await api.put(`/books/${editingId}`, form)
    } else {
      await api.post('/books', { data: form })
    }
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
  const [editBook, setEditBook] = useState(null)
  const [viewMode, setViewMode] = useState('grid')
  const [issuedCounts, setIssuedCounts] = useState({})
  const [subscribersPopup, setSubscribersPopup] = useState(null)

  const load = async ()=>{
    try{
      const res = await api.get('/books')
      setBooks(res.data.data)
    }catch(err){
      setBooks([])
    }
  }

  const openSubscribers = async (bookId) => {
    try{
      const res = await api.get(`/books/${bookId}/subscribers`)
      setSubscribersPopup(res.data.data)
    }catch(err){ setSubscribersPopup([]) }
  }

  const loadIssuedCounts = async () => {
    try{
      const res = await api.get('/users/issued/for-users')
      const counts = {}
      res.data.data.forEach(u => {
        (u.issuedBooks || []).forEach(rec => {
          const id = rec.book && (rec.book._id || rec.book);
          if (id) counts[id] = (counts[id] || 0) + 1
        })
      })
      setIssuedCounts(counts)
    }catch(e){ setIssuedCounts({}) }
  }

  // refresh counts when other parts of the app change data
  React.useEffect(()=>{
    const handler = () => loadIssuedCounts();
    window.addEventListener('dataChanged', handler);
    return () => window.removeEventListener('dataChanged', handler);
  }, [])

  useEffect(()=>{load()}, [])
  useEffect(()=>{ loadIssuedCounts() }, [])

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Books</h2>
        <div className="flex items-center gap-2">
          <button onClick={()=>setViewMode(viewMode==='grid'?'list':'grid')} className="px-3 py-2 border rounded">{viewMode==='grid'?'List':'Grid'}</button>
          <button onClick={()=>setShowForm(true)} className="bg-green-600 text-white px-4 py-2 rounded">+ Add Book</button>
        </div>
      </div>

      <div className={viewMode==='grid' ? "grid grid-cols-1 md:grid-cols-3 gap-4" : "space-y-3"}>
        {books.map((b)=> (
          <div key={b._id} className={"bg-white p-4 rounded shadow flex flex-col " + (viewMode==='list'?'md:flex-row md:items-center md:justify-between':'') }>
            <div>
              <h3 className="font-bold">{b.title}</h3>
              <p className="text-sm text-gray-600">{b.author} — {b.genre}</p>
              <p className="mt-2">{b.publisher} • ${b.price}</p>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <button title="Subscribers" onClick={()=>openSubscribers(b._id)} className="inline-flex items-center px-2 py-1 bg-gray-100 rounded text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-600" viewBox="0 0 20 20" fill="currentColor"><path d="M13 7a3 3 0 11-6 0 3 3 0 016 0z"/><path fillRule="evenodd" d="M2 14s2-2 6-2 6 2 6 2v2H2v-2z" clipRule="evenodd"/></svg>
                <span>{issuedCounts[b._id] || 0}</span>
              </button>
              <button title="Edit" onClick={()=>{ setShowForm(true); setEditBook(b) }} className="p-2 bg-yellow-100 rounded">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-700" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 010 2.828L8.828 14H6v-2.828l8.586-8.586a2 2 0 012.828 0z"/></svg>
              </button>
              <button title="Delete" onClick={async ()=>{ if(confirm('Delete this book?')){ await api.delete(`/books/${b._id}`); load(); loadIssuedCounts(); } }} className="p-2 bg-red-100 rounded">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-700" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H3a1 1 0 100 2h14a1 1 0 100-2h-2V3a1 1 0 00-1-1H6zm2 7a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4 0a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1z" clipRule="evenodd"/></svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-full max-w-md">
            <h3 className="text-lg font-semibold mb-3">{editBook? 'Edit Book' : 'Add Book'}</h3>
            <BookForm editingId={editBook?._id} initial={editBook||{}} onClose={()=>{ setShowForm(false); setEditBook(null) }} onSaved={() => { setShowForm(false); setEditBook(null); load(); loadIssuedCounts(); }} />
          </div>
        </div>
      )}

      {subscribersPopup && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Subscribers</h3>
              <button onClick={()=>setSubscribersPopup(null)} className="px-2 py-1">Close</button>
            </div>
            <div className="space-y-2">
              {subscribersPopup.length === 0 ? (
                <div className="text-sm text-gray-600">No subscribers</div>
              ) : subscribersPopup.map(u => (
                <div key={u._id || u.email} className="p-3 border rounded">
                  <div className="font-bold">{u.name} {u.surname}</div>
                  <div className="text-sm text-gray-600">{u.email}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
