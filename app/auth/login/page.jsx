'use client'
import { useState } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

export default function LoginPage() {
  var { signIn } = useAuth()
  var router = useRouter()
  var [form, setForm] = useState({ email: '', password: '' })
  var [error, setError] = useState('')
  var [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm(function(p) { return Object.assign({}, p, { [e.target.name]: e.target.value }) })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    var { error: err } = await signIn(form.email, form.password)
    if (err) { setError(err.message); setLoading(false); return }
    router.push('/account')
  }

  return (
    <div>
      <Navbar />
      <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 48, letterSpacing: 2, marginBottom: 8 }}>WELCOME BACK</h1>
          <p style={{ color: '#888', fontSize: 13, marginBottom: 36 }}>Sign in to your NUNO account.</p>

          {error && <div style={{ background: 'rgba(255,59,59,0.1)', border: '1px solid #ff3b3b', padding: '12px 16px', fontSize: 12, color: '#ff3b3b', marginBottom: 20 }}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 10, color: '#888', letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} required style={{ width: '100%', background: 'transparent', border: '1px solid #2a2a2a', padding: '13px 14px', color: '#f5f3ee', fontSize: 13, outline: 'none' }} />
            </div>
            <div style={{ marginBottom: 28 }}>
              <label style={{ fontSize: 10, color: '#888', letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Password</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} required style={{ width: '100%', background: 'transparent', border: '1px solid #2a2a2a', padding: '13px 14px', color: '#f5f3ee', fontSize: 13, outline: 'none' }} />
            </div>
            <button type="submit" disabled={loading} style={{ width: '100%', background: loading ? '#333' : '#c8ff00', color: loading ? '#888' : '#0a0a0a', border: 'none', padding: 16, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 600, marginBottom: 16 }}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 13, color: '#888' }}>
            No account? <Link href="/auth/register" style={{ color: '#c8ff00', borderBottom: '1px solid #c8ff00' }}>Create one</Link>
          </p>
        </div>
      </main>
    </div>
  )
}
