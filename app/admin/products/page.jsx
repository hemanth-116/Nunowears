'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'

var CATEGORIES = ['Tops', 'Bottoms', 'Outerwear']
var ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

var emptyForm = { name: '', description: '', price: '', original_price: '', category: 'Tops', sizes: ['S', 'M', 'L', 'XL'], badge: '', color: '', stock: '', active: true }

export default function AdminProductsPage() {
  var [products, setProducts] = useState([])
  var [loading, setLoading] = useState(true)
  var [showForm, setShowForm] = useState(false)
  var [editing, setEditing] = useState(null)
  var [form, setForm] = useState(emptyForm)
  var [imageFile, setImageFile] = useState(null)
  var [saving, setSaving] = useState(false)
  var [msg, setMsg] = useState('')

  var supabase = createClient()

  useEffect(function() { fetchProducts() }, [])

  async function fetchProducts() {
    var { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    setProducts(data || [])
    setLoading(false)
  }

  function openAdd() { setForm(emptyForm); setEditing(null); setImageFile(null); setShowForm(true) }

  function openEdit(p) {
    setForm({ name: p.name, description: p.description || '', price: p.price, original_price: p.original_price || '', category: p.category, sizes: p.sizes || [], badge: p.badge || '', color: p.color || '', stock: p.stock, active: p.active })
    setEditing(p)
    setImageFile(null)
    setShowForm(true)
  }

  function handleChange(e) {
    var n = e.target.name, v = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm(function(p) { return Object.assign({}, p, { [n]: v }) })
  }

  function toggleSize(size) {
    setForm(function(p) {
      var sizes = p.sizes.includes(size) ? p.sizes.filter(function(s) { return s !== size }) : [...p.sizes, size]
      return Object.assign({}, p, { sizes: sizes })
    })
  }

  async function handleSave() {
    if (!form.name || !form.price || !form.stock) { setMsg('Name, price, and stock are required.'); return }
    setSaving(true)
    setMsg('')

    var imageUrl = editing?.image_url || null

    // Upload image if selected
    if (imageFile) {
      var ext = imageFile.name.split('.').pop()
      var path = 'product-' + Date.now() + '.' + ext
      var { error: upErr } = await supabase.storage.from('products').upload(path, imageFile)
      if (!upErr) {
        var { data: urlData } = supabase.storage.from('products').getPublicUrl(path)
        imageUrl = urlData.publicUrl
      }
    }

    var payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      original_price: form.original_price ? Number(form.original_price) : null,
      category: form.category,
      sizes: form.sizes,
      badge: form.badge || null,
      color: form.color,
      stock: Number(form.stock),
      active: form.active,
      image_url: imageUrl,
    }

    if (editing) {
      await supabase.from('products').update(payload).eq('id', editing.id)
      setMsg('Product updated!')
    } else {
      await supabase.from('products').insert(payload)
      setMsg('Product added!')
    }

    await fetchProducts()
    setSaving(false)
    setTimeout(function() { setShowForm(false); setMsg('') }, 1000)
  }

  async function handleDelete(id) {
    if (!confirm('Delete this product?')) return
    await supabase.from('products').update({ active: false }).eq('id', id)
    fetchProducts()
  }

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
            return <Link key={item[0]} href={item[1]} style={{ color: item[0] === 'Products' ? '#c8ff00' : '#888', fontSize: 12, letterSpacing: 1, textTransform: 'uppercase' }}>{item[0]}</Link>
          })}
          <Link href="/" style={{ color: '#555', fontSize: 12, letterSpacing: 1, textTransform: 'uppercase' }}>← Store</Link>
        </div>
      </div>

      <div style={{ padding: '40px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 48, letterSpacing: 2 }}>PRODUCTS</h1>
          <button onClick={openAdd} style={{ background: '#c8ff00', color: '#0a0a0a', border: 'none', padding: '12px 24px', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 600 }}>+ Add Product</button>
        </div>

        {/* Product table */}
        <div style={{ background: '#111', border: '1px solid #2a2a2a' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr auto auto auto auto', gap: 16, padding: '12px 20px', borderBottom: '1px solid #2a2a2a', fontSize: 10, color: '#555', letterSpacing: 1, textTransform: 'uppercase' }}>
            <span>Image</span><span>Product</span><span>Price</span><span>Stock</span><span>Status</span><span>Actions</span>
          </div>
          {loading ? (
            <div style={{ padding: '32px', textAlign: 'center', color: '#888' }}>Loading...</div>
          ) : products.map(function(p) {
            return (
              <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '60px 1fr auto auto auto auto', gap: 16, padding: '14px 20px', borderBottom: '1px solid #1a1a1a', alignItems: 'center' }}>
                <div style={{ width: 48, height: 64, background: '#1a1a1a', position: 'relative', overflow: 'hidden' }}>
                  {p.image_url ? <Image src={p.image_url} alt={p.name} fill style={{ objectFit: 'cover' }} sizes="48px" /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: '#555' }}>NO IMG</div>}
                </div>
                <div>
                  <div style={{ fontSize: 13, color: '#f5f3ee', marginBottom: 3 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: '#555' }}>{p.category} · {p.color}</div>
                </div>
                <div style={{ fontSize: 13, color: '#c8ff00' }}>₹{p.price.toLocaleString('en-IN')}</div>
                <div style={{ fontSize: 13, color: p.stock <= 5 ? '#ff3b3b' : p.stock <= 15 ? '#ffaa00' : '#888' }}>{p.stock}</div>
                <div style={{ fontSize: 10, color: p.active ? '#00c853' : '#ff3b3b', letterSpacing: 1, textTransform: 'uppercase' }}>{p.active ? 'Active' : 'Hidden'}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={function() { openEdit(p) }} style={{ background: 'transparent', border: '1px solid #2a2a2a', color: '#888', padding: '5px 12px', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase' }}>Edit</button>
                  <button onClick={function() { handleDelete(p.id) }} style={{ background: 'transparent', border: '1px solid #2a2a2a', color: '#ff3b3b', padding: '5px 10px', fontSize: 10 }}>✕</button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 200, overflowY: 'auto', padding: '40px 20px' }}>
          <div style={{ background: '#111', border: '1px solid #2a2a2a', padding: 36, width: '100%', maxWidth: 560 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
              <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 32, letterSpacing: 2 }}>{editing ? 'EDIT PRODUCT' : 'ADD PRODUCT'}</h2>
              <button onClick={function() { setShowForm(false) }} style={{ background: 'none', border: 'none', color: '#888', fontSize: 22 }}>✕</button>
            </div>

            {msg && <div style={{ background: 'rgba(200,255,0,0.1)', border: '1px solid #c8ff00', padding: '10px 14px', fontSize: 12, color: '#c8ff00', marginBottom: 20 }}>{msg}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[['Name', 'name', 'text', 2], ['Description', 'description', 'text', 2], ['Price (₹)', 'price', 'number', 1], ['Original Price (₹)', 'original_price', 'number', 1], ['Color', 'color', 'text', 1], ['Stock', 'stock', 'number', 1], ['Badge', 'badge', 'text', 1]].map(function(f) {
                return (
                  <div key={f[0]} style={{ gridColumn: 'span ' + f[3] }}>
                    <label style={{ fontSize: 10, color: '#888', letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 7 }}>{f[0]}</label>
                    <input name={f[1]} type={f[2]} value={form[f[1]]} onChange={handleChange} style={{ width: '100%', background: 'transparent', border: '1px solid #2a2a2a', padding: '11px 13px', color: '#f5f3ee', fontSize: 13, outline: 'none' }} />
                  </div>
                )
              })}

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: 10, color: '#888', letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 7 }}>Category</label>
                <select name="category" value={form.category} onChange={handleChange} style={{ width: '100%', background: '#1a1a1a', color: '#f5f3ee', border: '1px solid #2a2a2a', padding: '11px 13px', fontSize: 13, outline: 'none' }}>
                  {CATEGORIES.map(function(c) { return <option key={c} value={c}>{c}</option> })}
                </select>
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: 10, color: '#888', letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 7 }}>Sizes</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {ALL_SIZES.map(function(size) {
                    var active = form.sizes.includes(size)
                    return <button key={size} type="button" onClick={function() { toggleSize(size) }} style={{ width: 40, height: 40, background: active ? '#c8ff00' : 'transparent', color: active ? '#0a0a0a' : '#888', border: '1px solid', borderColor: active ? '#c8ff00' : '#2a2a2a', fontSize: 11 }}>{size}</button>
                  })}
                </div>
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: 10, color: '#888', letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 7 }}>Product Image</label>
                <input type="file" accept="image/*" onChange={function(e) { setImageFile(e.target.files[0]) }} style={{ color: '#888', fontSize: 12 }} />
                {editing?.image_url && !imageFile && <div style={{ fontSize: 11, color: '#555', marginTop: 6 }}>Current image will be kept</div>}
              </div>

              <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: 12 }}>
                <input type="checkbox" name="active" checked={form.active} onChange={handleChange} id="active" />
                <label htmlFor="active" style={{ fontSize: 12, color: '#888', cursor: 'pointer' }}>Active (visible in store)</label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
              <button onClick={handleSave} disabled={saving} style={{ flex: 1, background: saving ? '#333' : '#c8ff00', color: saving ? '#888' : '#0a0a0a', border: 'none', padding: 15, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 600 }}>
                {saving ? 'Saving...' : (editing ? 'Update Product' : 'Add Product')}
              </button>
              <button onClick={function() { setShowForm(false) }} style={{ background: 'transparent', color: '#888', border: '1px solid #2a2a2a', padding: '15px 20px', fontSize: 12, letterSpacing: 1, textTransform: 'uppercase' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
