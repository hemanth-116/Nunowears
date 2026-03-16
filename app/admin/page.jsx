'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

export default function AdminPage() {
  var [stats, setStats] = useState({ orders: 0, revenue: 0, products: 0, customers: 0 })
  var [recentOrders, setRecentOrders] = useState([])
  var [loading, setLoading] = useState(true)

  useEffect(function() {
    async function load() {
      var supabase = createClient()
      var [ordersRes, productsRes, recentRes] = await Promise.all([
        supabase.from('orders').select('total, shipping, status'),
        supabase.from('products').select('id', { count: 'exact' }),
        supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false }).limit(5),
      ])

      var allOrders = ordersRes.data || []
      var paidOrders = allOrders.filter(function(o) { return o.status !== 'cancelled' })
      var revenue = paidOrders.reduce(function(s, o) { return s + o.total + o.shipping }, 0)

      setStats({
        orders: allOrders.length,
        revenue: revenue,
        products: productsRes.count || 0,
        customers: 0,
      })
      setRecentOrders(recentRes.data || [])
      setLoading(false)
    }
    load()
  }, [])

  var statusColors = { pending: '#888', paid: '#c8ff00', processing: '#00c8ff', shipped: '#c8ff00', delivered: '#00c853', cancelled: '#ff3b3b' }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#f5f3ee', fontFamily: "'DM Sans',sans-serif" }}>
      {/* Admin Nav */}
      <div style={{ borderBottom: '1px solid #2a2a2a', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#111' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, letterSpacing: 4 }}>NUNO</span>
          <span style={{ fontSize: 10, color: '#888', letterSpacing: 2, textTransform: 'uppercase', background: '#1a1a1a', padding: '4px 10px' }}>Admin</span>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          {[['Dashboard', '/admin'], ['Products', '/admin/products'], ['Orders', '/admin/orders']].map(function(item) {
            return <Link key={item[0]} href={item[1]} style={{ color: '#888', fontSize: 12, letterSpacing: 1, textTransform: 'uppercase' }}>{item[0]}</Link>
          })}
          <Link href="/" style={{ color: '#555', fontSize: 12, letterSpacing: 1, textTransform: 'uppercase' }}>← Store</Link>
        </div>
      </div>

      <div style={{ padding: '40px 32px' }}>
        <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 48, letterSpacing: 2, marginBottom: 36 }}>DASHBOARD</h1>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 48 }}>
          {[
            { label: 'Total Revenue', value: '₹' + (stats.revenue / 100).toLocaleString('en-IN'), accent: true },
            { label: 'Total Orders', value: stats.orders },
            { label: 'Products', value: stats.products },
            { label: 'Customers', value: stats.customers },
          ].map(function(stat) {
            return (
              <div key={stat.label} style={{ background: '#111', border: '1px solid #2a2a2a', padding: '24px 20px' }}>
                <div style={{ fontSize: 10, color: '#888', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>{stat.label}</div>
                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 36, letterSpacing: 1, color: stat.accent ? '#c8ff00' : '#f5f3ee' }}>{loading ? '—' : stat.value}</div>
              </div>
            )
          })}
        </div>

        {/* Recent Orders */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 32, letterSpacing: 2 }}>RECENT ORDERS</h2>
            <Link href="/admin/orders" style={{ fontSize: 11, color: '#c8ff00', letterSpacing: 1, textTransform: 'uppercase', borderBottom: '1px solid #c8ff00' }}>View All →</Link>
          </div>
          <div style={{ background: '#111', border: '1px solid #2a2a2a' }}>
            {loading ? (
              <div style={{ padding: '32px', color: '#888', fontSize: 13, textAlign: 'center' }}>Loading...</div>
            ) : recentOrders.length === 0 ? (
              <div style={{ padding: '32px', color: '#888', fontSize: 13, textAlign: 'center' }}>No orders yet.</div>
            ) : recentOrders.map(function(order, i) {
              return (
                <div key={order.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 24, padding: '16px 20px', borderBottom: i < recentOrders.length - 1 ? '1px solid #1a1a1a' : 'none', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 12, color: '#f5f3ee', marginBottom: 3 }}>#{order.id.slice(0, 8).toUpperCase()}</div>
                    <div style={{ fontSize: 11, color: '#555' }}>{new Date(order.created_at).toLocaleDateString('en-IN')} · {order.order_items.length} item{order.order_items.length !== 1 ? 's' : ''}</div>
                  </div>
                  <div style={{ fontSize: 11, color: '#555' }}>{order.address?.city || '—'}</div>
                  <span style={{ border: '1px solid', borderColor: statusColors[order.status] || '#888', color: statusColors[order.status] || '#888', fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', padding: '3px 10px', whiteSpace: 'nowrap' }}>
                    {order.status}
                  </span>
                  <span style={{ fontSize: 14, color: '#c8ff00', fontWeight: 500, textAlign: 'right' }}>₹{(order.total + order.shipping).toLocaleString('en-IN')}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
