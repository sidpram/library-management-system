import React from 'react'

export default function Nav({ page, setPage }){
  return (
    <header className="bg-white shadow">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center text-white font-bold">LM</div>
          <h1 className="text-xl font-semibold">Library Dashboard</h1>
        </div>
        <nav className="flex items-center gap-3">
          <button onClick={()=>setPage('books')} className={`px-3 py-2 rounded ${page==='books'?'bg-gray-200':''}`}>Books</button>
          <button onClick={()=>setPage('users')} className={`px-3 py-2 rounded ${page==='users'?'bg-gray-200':''}`}>Users</button>
        </nav>
      </div>
    </header>
  )
}
