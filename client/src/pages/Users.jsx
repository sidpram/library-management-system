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
    if (initial && initial._id) {
      await api.put(`/users/${initial._id}`, form)
    } else {
      await api.post('/users', { data: form })
    }
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
  const [editUser, setEditUser] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [availableBooks, setAvailableBooks] = useState([])
  const [issueBookId, setIssueBookId] = useState('')
  const [issuedBookIds, setIssuedBookIds] = useState(new Set())
  const [viewMode, setViewMode] = useState('grid')
  const [userBooksPopup, setUserBooksPopup] = useState(null)
  const [manageBooksUser, setManageBooksUser] = useState(null)
  const [manageIssueSelection, setManageIssueSelection] = useState(new Set())
  const [manageReturnSelection, setManageReturnSelection] = useState(new Set())

  const load = async ()=>{
    try{
      const res = await api.get('/users')
      setUsers(res.data.data)
    }catch(err){
      setUsers([])
    }
  }

  const loadBooks = async () => {
    try{
      const res = await api.get('/books')
      setAvailableBooks(res.data.data)
    }catch(err){ setAvailableBooks([]) }
  }

  const loadIssuedBookIds = async () => {
    try{
      const res = await api.get('/users/issued/for-users')
      const ids = new Set()
      res.data.data.forEach(u => {
        (u.issuedBooks || []).forEach(rec => {
          const id = rec.book && (rec.book._id || rec.book)
          if (id) ids.add(id)
        })
      })
      setIssuedBookIds(ids)
    }catch(e){ setIssuedBookIds(new Set()) }
  }

  useEffect(()=>{load()}, [])

  useEffect(()=>{ loadBooks() }, [])
  useEffect(()=>{ loadIssuedBookIds() }, [])

  useEffect(()=>{ if (!userBooksPopup) return }, [userBooksPopup])

  const openUser = async (id) => {
    try{
      const res = await api.get(`/users/${id}`)
      setSelectedUser(res.data.data)
    }catch(err){ setSelectedUser(null) }
  }

  const openUserBooks = async (id) => {
    try{
      const res = await api.get(`/users/${id}`)
      setUserBooksPopup(res.data.data)
    }catch(err){ setUserBooksPopup(null) }
  }

  const returnBook = async (id) => {
    await api.post(`/users/${id}/return`)
    load();
    if (selectedUser && selectedUser._id===id) openUser(id);
    // notify other views (books) to refresh counts
    window.dispatchEvent(new Event('dataChanged'))
  }

  const returnBookWithBook = async (userId, bookId) => {
    if (!bookId) return;
    await api.post(`/users/${userId}/return`, { data: { bookId } })
    load();
    loadIssuedBookIds();
    if (selectedUser && selectedUser._id===userId) openUser(userId);
    window.dispatchEvent(new Event('dataChanged'))
  }

  const issueBook = async (id) => {
    if (!issueBookId) return;
    if (issuedBookIds.has(issueBookId)) { alert('Book already issued'); return }
    await api.post(`/users/${id}/issue`, { data: { bookId: issueBookId, issuedDate: new Date().toISOString(), returnDate: '' }})
    load();
    loadIssuedBookIds();
    openUser(id);
    // notify other views (books) to refresh counts
    window.dispatchEvent(new Event('dataChanged'))
  }

  const issueMultipleBooks = async (userId, bookIds=[]) => {
    if (!bookIds || bookIds.length === 0) return;
    for (const bid of bookIds) {
      if (issuedBookIds.has(bid)) continue;
      try{ await api.post(`/users/${userId}/issue`, { data: { bookId: bid, issuedDate: new Date().toISOString() }}) }catch(e){ /* continue */ }
    }
    load(); loadIssuedBookIds(); if (selectedUser && selectedUser._id===userId) openUser(userId);
    window.dispatchEvent(new Event('dataChanged'))
  }

  const returnMultipleBooks = async (userId, bookIds=[]) => {
    if (!bookIds || bookIds.length === 0) return;
    for (const bid of bookIds) {
      try{ await api.post(`/users/${userId}/return`, { data: { bookId: bid } }) }catch(e){ /* continue */ }
    }
    load(); loadIssuedBookIds(); if (selectedUser && selectedUser._id===userId) openUser(userId);
    window.dispatchEvent(new Event('dataChanged'))
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Users</h2>
        <div className="flex items-center gap-2">
          <button onClick={()=>setViewMode(viewMode==='grid'?'list':'grid')} className="px-3 py-2 border rounded">{viewMode==='grid'?'List':'Grid'}</button>
          <button onClick={()=>setShowForm(true)} className="bg-green-600 text-white px-4 py-2 rounded">+ Add User</button>
        </div>
      </div>

      <div className={viewMode==='grid' ? "grid grid-cols-1 md:grid-cols-3 gap-4" : "space-y-3"}>
        {users.map((u)=> (
          <div key={u._id} className={"bg-white p-4 rounded shadow flex flex-col " + (viewMode==='list'?'md:flex-row md:items-center md:justify-between':'') }>
            <div>
              <h3 className="font-bold cursor-pointer" onClick={()=>openUser(u._id)}>{u.name} {u.surname}</h3>
              <p className="text-sm text-gray-600">{u.email}</p>
              <p className="mt-2">{u.subscriptionType} • {u.subscriptionDate}</p>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <button title="Books" onClick={()=>openUserBooks(u._id)} className="inline-flex items-center gap-2 px-2 py-1 bg-gray-100 rounded">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor"><path d="M2 4a2 2 0 012-2h9a2 2 0 012 2v11a1 1 0 01-1 1H5a3 3 0 01-3-3V4z"/></svg>
                <span className="text-sm">{u.issuedBooks ? u.issuedBooks.length : 0}</span>
              </button>
              <button title="Manage Books" onClick={async ()=>{ try{ const res = await api.get(`/users/${u._id}`); setSelectedUser(res.data.data); setManageBooksUser(res.data.data); setManageIssueSelection(new Set()); setManageReturnSelection(new Set()); }catch(e){ /* ignore */ } }} className="p-2 bg-indigo-100 rounded">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-700" viewBox="0 0 20 20" fill="currentColor"><path d="M6 2a1 1 0 00-1 1v2h10V3a1 1 0 00-1-1H6zM4 7v9a2 2 0 002 2h8a2 2 0 002-2V7H4z"/></svg>
              </button>
              <button title="Edit" onClick={()=>{ setShowForm(true); setEditUser(u) }} className="p-2 bg-yellow-100 rounded">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-700" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 010 2.828L8.828 14H6v-2.828l8.586-8.586a2 2 0 012.828 0z"/></svg>
              </button>
              <button title="Delete" onClick={async ()=>{ if(confirm('Delete this user?')){ await api.delete(`/users/${u._id}`); load(); loadIssuedBookIds(); } }} className="p-2 bg-red-100 rounded">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-700" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H3a1 1 0 100 2h14a1 1 0 100-2h-2V3a1 1 0 00-1-1H6zm2 7a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4 0a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1z" clipRule="evenodd"/></svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-full max-w-md">
            <h3 className="text-lg font-semibold mb-3">Add User</h3>
            <UserForm initial={editUser||{}} onClose={()=>{ setShowForm(false); setEditUser(null) }} onSaved={() => { setShowForm(false); setEditUser(null); load() }} />
          </div>
        </div>
      )}

      {selectedUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{selectedUser.name} {selectedUser.surname}</h3>
              <button onClick={()=>setSelectedUser(null)} className="px-2 py-1">Close</button>
            </div>
            <p className="mb-2">Email: {selectedUser.email}</p>
            <p className="mb-2">Subscription: {selectedUser.subscriptionType} ({selectedUser.subscriptionDate})</p>
            <div className="mb-4">
              <h4 className="font-semibold">Issued Book</h4>
              {selectedUser.issuedBooks && selectedUser.issuedBooks.length ? (
                <div className="space-y-2">
                  {selectedUser.issuedBooks.map(rb => (
                    <div key={rb.book && (rb.book._id || rb.book)} className="mt-2 p-3 border rounded">
                      <div className="font-bold">{(rb.book && (rb.book.title || rb.book.name)) || 'Unknown'}</div>
                      <div className="text-sm text-gray-600">{rb.book && rb.book.author}</div>
                      <div className="mt-2 flex gap-2">
                        <button onClick={()=>{ /* return this specific book */ returnBookWithBook(selectedUser._id, rb.book && (rb.book._id || rb.book)) }} className="px-3 py-1 bg-red-500 text-white rounded">Return Book</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-2">
                    <select value={issueBookId} onChange={(e)=>setIssueBookId(e.target.value)} className="w-full p-2 border rounded">
                    <option value="">Select book to issue</option>
                    {availableBooks.filter(b=>!issuedBookIds.has(b._id)).map(b=> <option key={b._id} value={b._id}>{b.title || b.name} — {b.author}</option>)}
                  </select>
                  <div className="mt-2">
                    <button onClick={()=>issueBook(selectedUser._id)} className="px-3 py-1 bg-blue-600 text-white rounded">Issue Book</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {userBooksPopup && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Subscribed Books for {userBooksPopup.name}</h3>
              <button onClick={()=>setUserBooksPopup(null)} className="px-2 py-1">Close</button>
            </div>
            <div>
              {userBooksPopup.issuedBooks && userBooksPopup.issuedBooks.length ? (
                userBooksPopup.issuedBooks.map(rb => (
                  <div key={rb.book && (rb.book._id || rb.book)} className="p-3 border rounded mb-2">
                    <div className="font-bold">{(rb.book && (rb.book.title || rb.book.name)) || 'Unknown'}</div>
                    <div className="text-sm text-gray-600">{rb.book && rb.book.author}</div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-600">No subscribed books</div>
              )}
            </div>
          </div>
        </div>
      )}

      {manageBooksUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-full max-w-3xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Manage Books for {manageBooksUser.name} {manageBooksUser.surname}</h3>
              <button onClick={()=>setManageBooksUser(null)} className="px-2 py-1">Close</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Available to Issue</h4>
                <div className="max-h-64 overflow-auto border rounded p-2 space-y-2">
                  {availableBooks.filter(b=>!issuedBookIds.has(b._id)).map(b => (
                    <label key={b._id} className="flex items-center gap-2">
                      <input type="checkbox" checked={manageIssueSelection.has(b._id)} onChange={()=>{
                        const s = new Set(manageIssueSelection);
                        if (s.has(b._id)) s.delete(b._id); else s.add(b._id);
                        setManageIssueSelection(s);
                      }} />
                      <span>{b.title} — <span className="text-sm text-gray-600">{b.author}</span></span>
                    </label>
                  ))}
                </div>
                <div className="mt-3">
                  <button onClick={async ()=>{ await issueMultipleBooks(manageBooksUser._id, Array.from(manageIssueSelection)); setManageIssueSelection(new Set()); const r = await api.get(`/users/${manageBooksUser._id}`); setManageBooksUser(r.data.data); }} className="px-4 py-2 bg-blue-600 text-white rounded">Issue Selected</button>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Currently Issued (Select to Return)</h4>
                <div className="max-h-64 overflow-auto border rounded p-2 space-y-2">
                  {(manageBooksUser.issuedBooks || []).map(rec => {
                    const bid = rec.book && (rec.book._id || rec.book);
                    return (
                      <label key={bid} className="flex items-center gap-2">
                        <input type="checkbox" checked={manageReturnSelection.has(bid)} onChange={()=>{
                          const s = new Set(manageReturnSelection);
                          if (s.has(bid)) s.delete(bid); else s.add(bid);
                          setManageReturnSelection(s);
                        }} />
                        <div>
                          <div className="font-bold">{(rec.book && (rec.book.title || rec.book.name)) || 'Unknown'}</div>
                          <div className="text-sm text-gray-600">{rec.book && rec.book.author}</div>
                        </div>
                      </label>
                    )
                  })}
                </div>
                <div className="mt-3">
                  <button onClick={async ()=>{ await returnMultipleBooks(manageBooksUser._id, Array.from(manageReturnSelection)); setManageReturnSelection(new Set()); const r = await api.get(`/users/${manageBooksUser._id}`); setManageBooksUser(r.data.data); }} className="px-4 py-2 bg-red-600 text-white rounded">Return Selected</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
