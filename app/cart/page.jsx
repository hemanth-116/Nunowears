'use client'
import { useCart } from '@/lib/CartContext'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function CartPage() {
  var { cart, removeFromCart, updateQty, total, count } = useCart()
  var router = useRouter()
  var shipping = total >= 999 ? 0 : 99
  var grandTotal = total + shipping

  if (cart.length === 0) return (
    <div><Navbar />
      <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(32px,6vw,60px)', letterSpacing: 2, color: '#2a2a2a' }}>YOUR BAG IS EMPTY</div>
        <p style={{ color: '#888', fontSize: 13 }}>Add some NUNO to your life.</p>
        <Link href="/shop" style={{ background: '#c8ff00', color: '#0a0a0a', padding: '14px 32px', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 600 }}>Shop Now</Link>
      </div>
    <Footer /></div>
  )

  return (
    <div>
      <Navbar />
      <main style={{ padding: 'clamp(32px,5vw,60px) clamp(16px,4vw,40px)', minHeight: '80vh' }}>
        <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(40px,6vw,60px)', letterSpacing: 2, marginBottom: 6 }}>YOUR BAG</h1>
        <p style={{ color: '#888', fontSize: 12, marginBottom: 40 }}>{count} item{count !== 1 ? 's' : ''}</p>

        <div className="mobile-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 48, alignItems: 'start' }}>
          {/* Items */}
          <div>
            {cart.map(function(item) {
              return (
                <div key={item.id + '-' + item.size} style={{ display: 'grid', gridTemplateColumns: '90px 1fr auto', gap: 20, padding: '24px 0', borderBottom: '1px solid #1a1a1a' }}>
                  <div style={{ background: '#1a1a1a', aspectRatio: '3/4', position: 'relative', overflow: 'hidden' }}>
                    {item.image_url ? (
                      <Image src={item.image_url} alt={item.name} fill style={{ objectFit: 'cover' }} sizes="90px" />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect x="3" y="8" width="26" height="22" rx="1" stroke="#333" strokeWidth="1"/><path d="M3 13 Q8 7 16 10 Q24 5 29 13" stroke="#3a3a3a" strokeWidth="1" fill="none"/></svg>
                      </div>
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: '#888', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 3 }}>{item.category}</div>
                    <div style={{ fontSize: 13, color: '#f5f3ee', marginBottom: 5 }}>{item.name}</div>
                    <div style={{ fontSize: 11, color: '#888', marginBottom: 14 }}>Size: {item.size}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button onClick={function() { updateQty(item.id, item.size, item.qty - 1) }} style={{ width: 30, height: 30, background: 'transparent', color: '#888', border: '1px solid #2a2a2a', fontSize: 16 }}>−</button>
                      <span style={{ fontSize: 13, minWidth: 18, textAlign: 'center' }}>{item.qty}</span>
                      <button onClick={function() { updateQty(item.id, item.size, item.qty + 1) }} style={{ width: 30, height: 30, background: 'transparent', color: '#888', border: '1px solid #2a2a2a', fontSize: 16 }}>+</button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 15, color: '#c8ff00', fontWeight: 500 }}>₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
                    <button onClick={function() { removeFromCart(item.id, item.size) }} style={{ background: 'none', border: 'none', color: '#555', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase' }}>Remove</button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Summary */}
          <div style={{ background: '#111', border: '1px solid #2a2a2a', padding: 28, position: 'sticky', top: 90 }}>
            <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, letterSpacing: 2, marginBottom: 24 }}>ORDER SUMMARY</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ color: '#888', fontSize: 13 }}>Subtotal</span>
              <span style={{ fontSize: 13 }}>₹{total.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ color: '#888', fontSize: 13 }}>Shipping</span>
              <span style={{ fontSize: 13, color: shipping === 0 ? '#c8ff00' : '#f5f3ee' }}>{shipping === 0 ? 'FREE' : '₹' + shipping}</span>
            </div>
            {total < 999 && <div style={{ background: '#1a1a1a', padding: '9px 12px', marginBottom: 12, fontSize: 11, color: '#888' }}>Add ₹{(999 - total).toLocaleString('en-IN')} for free shipping</div>}
            <div style={{ borderTop: '1px solid #2a2a2a', paddingTop: 16, display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <span style={{ fontSize: 14, fontWeight: 500 }}>Total</span>
              <span style={{ fontSize: 20, color: '#c8ff00', fontWeight: 500 }}>₹{grandTotal.toLocaleString('en-IN')}</span>
            </div>
            <button onClick={function() { router.push('/checkout') }} style={{ width: '100%', background: '#c8ff00', color: '#0a0a0a', border: 'none', padding: 16, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 600, marginBottom: 10 }}>
              Proceed to Checkout
            </button>
            <Link href="/shop" style={{ display: 'block', textAlign: 'center', padding: 14, border: '1px solid #2a2a2a', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: '#888' }}>Continue Shopping</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
