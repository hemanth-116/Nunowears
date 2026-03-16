'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

var STATUSES = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled']
var statusColors = { pending: '#888', paid: '#c8ff00', processing: '#00c8ff', shipped: '#c8ff00', delivered: '#00c853', cancelled: '#ff3b3b' }

export default function AdminOrdersPage() {
  var [orders, setOrders] = useState([])
  var [loading, setLoading] = useState(true)
  var [filter, setFilter] = useState('all')
  var [expanded, setExpanded] = useState(null)

  var supabase = createClient()

  useEffect(function() { fetchOrders() }, [])

  async function fetchOrders() {
    var { data } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false })
    setOrders(data || [])
    setLoading(false)
  }

  async function updateStatus(orderId, status) {
    await supabase.from('orders').update({ status: status }).eq('id', orderId)
    setOrders(function(prev) {
      return prev.map(function(o) { return o.id === orderId ? Object.assign({}, o, { status: status }) : o })
    })
  }

  var filtered = filter === 'all' ? orders : orders.filter(function(o) { return o.status === filter })

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#f5f3ee', fontFamily: "'DM Sans',sans-serif" }}>
      {/* Nav */}
      <div style={{ borderBottom: '1px solid #2a2a2a', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#111' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, letterSpacing: 4 }}>NUNO</span>
          <span style={{ fontSize: 10, color: '#888', letterSpacing: 2, textTransform: 'uppercase', background: '#1a1a1a', padding: '4px 10px' }}>Admin</span>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          {[['Dashboard', '/admin'], ['Products', '/admin/products'], ['Orders', '/admin/orders']].map(function(item) {
            return <Link key={item[0]} href={item[1]} style={{ color: item[0] === 'Orders' ? '#c8ff00' : '#888', fontSize: 12, letterSpacing: 1, textTransform: 'uppercase' }}>{item[0]}</Link>
          })}
          <Link href="/" style={{ color: '#555', fontSize: 12, letterSpacing: 1, textTransform: 'uppercase' }}>← Store</Link>
        </div>
      </div>

      <div style={{ padding: '40px 32px' }}>
        <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 48, letterSpacing: 2, marginBottom: 28 }}>ORDERS</h1>

        {/* Status filters */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 28, flexWrap: 'wrap' }}>
          {['all', ...STATUSES].map(function(s) {
            var active = filter === s
            return (
              <button key={s} onClick={function() { setFilter(s) }} style={{ background: active ? '#c8ff00' : 'transparent', color: active ? '#0a0a0a' : '#888', border: '1px solid', borderColor: active ? '#c8ff00' : '#2a2a2a', padding: '7px 16px', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', fontWeight: active ? 600 : 400 }}>
                {s === 'all' ? 'All (' + orders.length + ')' : s}
              </button>
            )
          })}
        </div>

        {/* Orders list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>Loading orders...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#888', fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, letterSpacing: 2 }}>NO ORDERS</div>
          ) : filtered.map(function(order) {
            var isOpen = expanded === order.id
            return (
              <div key={order.id} style={{ background: '#111', border: '1px solid #2a2a2a' }}>
                {/* Order row */}
                <div
                  onClick={function() { setExpanded(isOpen ? null : order.id) }}
                  style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto auto', gap: 20, padding: '16px 20px', alignItems: 'center', cursor: 'pointer' }}
                >
                  <div>
                    <div style={{ fontSize: 12, color: '#f5f3ee', marginBottom: 3 }}>#{order.id.slice(0, 8).toUpperCase()}</div>
                    <div style={{ fontSize: 11, color: '#555' }}>{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · {order.address?.full_name || '—'}</div>
                  </div>
                  <div style={{ fontSize: 11, color: '#555' }}>{order.address?.city}, {order.address?.state}</div>
                  <div style={{ fontSize: 11, color: '#555' }}>{order.order_items.length} item{order.order_items.length !== 1 ? 's' : ''}</div>
                  <span style={{ border: '1px solid', borderColor: statusColors[order.status] || '#888', color: statusColors[order.status] || '#888', fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', padding: '4px 12px', whiteSpace: 'nowrap' }}>
                    {order.status}
                  </span>
                  <span style={{ fontSize: 15, color: '#c8ff00', fontWeight: 500, textAlign: 'right' }}>₹{(order.total + order.shipping).toLocaleString('en-IN')}</span>
                </div>

                {/* Expanded detail */}
                {isOpen && (
                  <div style={{ borderTop: '1px solid #1a1a1a', padding: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                    <div>
                      <div style={{ fontSize: 10, color: '#555', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Items</div>
                      {order.order_items.map(function(item) {
                        return (
                          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8, color: '#888' }}>
                            <span>{item.product_name} — Size {item.size} × {item.quantity}</span>
                            <span style={{ color: '#f5f3ee' }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                          </div>
                        )
                      })}
                      <div style={{ borderTop: '1px solid #1a1a1a', marginTop: 12, paddingTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                        <span style={{ color: '#888' }}>Shipping</span>
                        <span>{order.shipping === 0 ? 'FREE' : '₹' + order.shipping}</span>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: '#555', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Shipping Address</div>
                      <div style={{ fontSize: 13, color: '#888', lineHeight: 1.8 }}>
                        {order.address?.full_name}<br />
                        {order.address?.address}<br />
                        {order.address?.city}, {order.address?.state} — {order.address?.pincode}<br />
                        {order.address?.phone}
                      </div>
                      <div style={{ marginTop: 20 }}>
                        <div style={{ fontSize: 10, color: '#555', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>Update Status</div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {STATUSES.map(function(s) {
                            var active = order.status === s
                            return (
                              <button key={s} onClick={function() { updateStatus(order.id, s) }} style={{ background: active ? statusColors[s] || '#888' : 'transparent', color: active ? '#0a0a0a' : '#555', border: '1px solid', borderColor: active ? statusColors[s] || '#888' : '#2a2a2a', padding: '5px 12px', fontSize: 9, letterSpacing: 1, textTransform: 'uppercase' }}>
                                {s}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
