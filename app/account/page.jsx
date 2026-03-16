'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { createClient } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

var statusColors = { pending: '#888', paid: '#c8ff00', processing: '#00c8ff', shipped: '#c8ff00', delivered: '#00c853', cancelled: '#ff3b3b' }

export default function AccountPage() {
  var { user, signOut, loading: authLoading } = useAuth()
  var [orders, setOrders] = useState([])
  var [loading, setLoading] = useState(true)
  var [activeTab, setActiveTab] = useState('orders')
  var router = useRouter()

  useEffect(function() {
    if (!authLoading && !user) { router.push('/auth/login'); return }
    if (user) fetchOrders()
  }, [user, authLoading])

  async function fetchOrders() {
    var supabase = createClient()
    var { data } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setOrders(data || [])
    setLoading(false)
  }

  async function handleSignOut() {
    await signOut()
    router.push('/')
  }

  if (authLoading || !user) return (
    <div><Navbar />
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 32, color: '#555', letterSpacing: 2 }}>LOADING...</div>
      </div>
    </div>
  )

  return (
    <div>
      <Navbar />
      <main style={{ padding: 'clamp(32px,5vw,60px) clamp(16px,4vw,40px)', minHeight: '80vh' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(36px,5vw,56px)', letterSpacing: 2, marginBottom: 4 }}>MY ACCOUNT</h1>
            <p style={{ color: '#888', fontSize: 13 }}>{user.email}</p>
          </div>
          <button onClick={handleSignOut} style={{ background: 'transparent', color: '#888', border: '1px solid #2a2a2a', padding: '10px 20px', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' }}>Sign Out</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 36, borderBottom: '1px solid #2a2a2a' }}>
          {['orders', 'profile'].map(function(tab) {
            var active = activeTab === tab
            return (
              <button key={tab} onClick={function() { setActiveTab(tab) }} style={{ background: 'none', border: 'none', color: active ? '#c8ff00' : '#888', fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', padding: '12px 20px', borderBottom: active ? '2px solid #c8ff00' : '2px solid transparent', marginBottom: -1, transition: 'color 0.15s' }}>
                {tab}
              </button>
            )
          })}
        </div>

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            {loading ? (
              <div style={{ color: '#888', fontSize: 13, padding: '40px 0' }}>Loading orders...</div>
            ) : orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 40, color: '#2a2a2a', letterSpacing: 2, marginBottom: 16 }}>NO ORDERS YET</div>
                <Link href="/shop" style={{ background: '#c8ff00', color: '#0a0a0a', padding: '13px 28px', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 600 }}>Start Shopping</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {orders.map(function(order) {
                  return (
                    <div key={order.id} style={{ background: '#111', border: '1px solid #2a2a2a', padding: 24 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                        <div>
                          <div style={{ fontSize: 11, color: '#888', letterSpacing: 1, marginBottom: 4 }}>ORDER #{order.id.slice(0, 8).toUpperCase()}</div>
                          <div style={{ fontSize: 12, color: '#555' }}>{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                          <span style={{ background: 'rgba(200,255,0,0.1)', border: '1px solid', borderColor: statusColors[order.status] || '#888', color: statusColors[order.status] || '#888', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', padding: '4px 12px' }}>
                            {order.status}
                          </span>
                          <span style={{ fontSize: 16, color: '#c8ff00', fontWeight: 500 }}>₹{(order.total + order.shipping).toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {order.order_items.map(function(item) {
                          return (
                            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#888' }}>
                              <span>{item.product_name} — Size {item.size} × {item.quantity}</span>
                              <span style={{ color: '#f5f3ee' }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                            </div>
                          )
                        })}
                      </div>
                      <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #1a1a1a', fontSize: 11, color: '#555' }}>
                        Delivering to: {order.address.city}, {order.address.state}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div style={{ maxWidth: 480 }}>
            <div style={{ background: '#111', border: '1px solid #2a2a2a', padding: 28 }}>
              <div style={{ fontSize: 11, color: '#888', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 20 }}>Account Details</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 10, color: '#555', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>Email</div>
                  <div style={{ fontSize: 14, color: '#f5f3ee' }}>{user.email}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: '#555', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>Member Since</div>
                  <div style={{ fontSize: 14, color: '#f5f3ee' }}>{new Date(user.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
