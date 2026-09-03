import React from 'react'
import { useState } from 'react'
import Nav from './components/Nav'
import Books from './pages/Books'
import Users from './pages/Users'

export default function App(){
  const [page, setPage] = useState('books')

  return (
    <div className="min-h-screen bg-gray-100">
      <Nav page={page} setPage={setPage} />
      <main className="p-6">
        {page === 'books' && <Books />}
        {page === 'users' && <Users />}
      </main>
    </div>
  )
}
