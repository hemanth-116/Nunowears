'use client'
import Link from 'next/link'
import { useState } from 'react'
import { useCart } from '@/lib/CartContext'
import { useAuth } from '@/lib/AuthContext'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const { count } = useCart()
  const { user, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()

  async function handleSignOut() {
    await signOut()
    router.push('/')
  }

  return (
    <nav style={{ borderBottom: '1px solid #2a2a2a', position: 'sticky', top: 0, background: 'rgba(10,10,10,0.97)', backdropFilter: 'blur(12px)', zIndex: 100 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px' }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
          <img src="/logo.png" alt="NUNO Logo" style={{ height: 56, objectFit: 'contain' }} />
        </Link>

        {/* Desktop nav */}
        <div className="mobile-hide" style={{ display: 'flex', gap: 28 }}>
          {[['Shop', '/shop'], ['New In', '/shop?filter=new'], ['Sale', '/shop?filter=sale']].map(function(item) {
            return <Link key={item[0]} href={item[1]} style={{ color: '#888', fontSize: 12, letterSpacing: 1, textTransform: 'uppercase' }}>{item[0]}</Link>
          })}
        </div>

        {/* Right actions */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {user ? (
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <Link href="/account" className="mobile-hide" style={{ color: '#888', fontSize: 12, letterSpacing: 1, textTransform: 'uppercase' }}>Account</Link>
              <button onClick={handleSignOut} className="mobile-hide" style={{ background: 'none', border: 'none', color: '#888', fontSize: 12, letterSpacing: 1, textTransform: 'uppercase' }}>Logout</button>
            </div>
          ) : (
            <Link href="/auth/login" className="mobile-hide" style={{ color: '#888', fontSize: 12, letterSpacing: 1, textTransform: 'uppercase' }}>Login</Link>
          )}

          <Link href="/cart" style={{ background: '#c8ff00', color: '#0a0a0a', padding: '8px 18px', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
            Cart
            {count > 0 && <span style={{ background: '#0a0a0a', color: '#c8ff00', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>{count}</span>}
          </Link>

          {/* Hamburger */}
          <button onClick={function() { setMenuOpen(!menuOpen) }} style={{ background: 'none', border: 'none', color: '#f5f3ee', fontSize: 22, display: 'none' }} className="mobile-menu-btn">☰</button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ borderTop: '1px solid #2a2a2a', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {[['Shop', '/shop'], ['New In', '/shop?filter=new'], ['Sale', '/shop?filter=sale']].map(function(item) {
            return <Link key={item[0]} href={item[1]} onClick={function() { setMenuOpen(false) }} style={{ color: '#888', fontSize: 14, letterSpacing: 1, textTransform: 'uppercase' }}>{item[0]}</Link>
          })}
          {user ? (
            <>
              <Link href="/account" onClick={function() { setMenuOpen(false) }} style={{ color: '#888', fontSize: 14, letterSpacing: 1, textTransform: 'uppercase' }}>Account</Link>
              <button onClick={handleSignOut} style={{ background: 'none', border: 'none', color: '#888', fontSize: 14, letterSpacing: 1, textTransform: 'uppercase', textAlign: 'left' }}>Logout</button>
            </>
          ) : (
            <Link href="/auth/login" onClick={function() { setMenuOpen(false) }} style={{ color: '#888', fontSize: 14, letterSpacing: 1, textTransform: 'uppercase' }}>Login / Register</Link>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn { display: block !important; }
          .mobile-hide { display: none !important; }
        }
      `}</style>
    </nav>
  )
}
