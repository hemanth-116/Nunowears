'use client'

import { Suspense } from 'react'
import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ProductCard from '@/components/ProductCard'
import { createClient } from '@/lib/supabase'
import { useSearchParams } from 'next/navigation'

var categories = ['All', 'Tops', 'Bottoms', 'Outerwear']
var sortOptions = ['Newest', 'Price: Low to High', 'Price: High to Low']

function ShopContent() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'All')
  const [activeSort, setActiveSort] = useState('Newest')

  useEffect(function () {
    async function fetchProducts() {
      setLoading(true)
      var supabase = createClient()
      var query = supabase.from('products').select('*').eq('active', true)
      if (activeCategory !== 'All') query = query.eq('category', activeCategory)
      if (activeSort === 'Price: Low to High') query = query.order('price', { ascending: true })
      else if (activeSort === 'Price: High to Low') query = query.order('price', { ascending: false })
      else query = query.order('created_at', { ascending: false })
      var { data } = await query
      setProducts(data || [])
      setLoading(false)
    }
    fetchProducts()
  }, [activeCategory, activeSort])

  return (
    <div>
      <Navbar />

      <div style={{ padding: 'clamp(40px,5vw,60px) clamp(16px,4vw,40px) 32px', borderBottom: '1px solid #2a2a2a' }}>
        <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(48px,7vw,68px)', letterSpacing: 2 }}>ALL PRODUCTS</h1>
        <p style={{ color: '#888', fontSize: 13, marginTop: 6 }}>{loading ? '...' : products.length + ' styles'}</p>
      </div>

      {/* Filter bar */}
      <div style={{ padding: '14px clamp(16px,4vw,40px)', borderBottom: '1px solid #2a2a2a', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, position: 'sticky', top: 65, background: 'rgba(10,10,10,0.97)', backdropFilter: 'blur(12px)', zIndex: 90 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {categories.map(function (cat) {
            var active = activeCategory === cat
            return (
              <button key={cat} onClick={function () { setActiveCategory(cat) }} style={{ background: active ? '#c8ff00' : 'transparent', color: active ? '#0a0a0a' : '#888', border: '1px solid', borderColor: active ? '#c8ff00' : '#2a2a2a', padding: '7px 16px', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', fontWeight: active ? 600 : 400 }}>
                {cat}
              </button>
            )
          })}
        </div>
        <select value={activeSort} onChange={function (e) { setActiveSort(e.target.value) }} style={{ background: '#111', color: '#f5f3ee', border: '1px solid #2a2a2a', padding: '7px 12px', fontSize: 11, outline: 'none' }}>
          {sortOptions.map(function (s) { return <option key={s} value={s}>{s}</option> })}
        </select>
      </div>

      <div style={{ padding: 'clamp(32px,4vw,48px) clamp(16px,4vw,40px) 80px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#888', fontFamily: "'Bebas Neue',sans-serif", fontSize: 32, letterSpacing: 2 }}>LOADING...</div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#888', fontFamily: "'Bebas Neue',sans-serif", fontSize: 32, letterSpacing: 2 }}>NO PRODUCTS FOUND</div>
        ) : (
          <div className="grid-4">
            {products.map(function (p) { return <ProductCard key={p.id} product={p} /> })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '80px 0', color: '#888', fontFamily: "'Bebas Neue',sans-serif", fontSize: 32, letterSpacing: 2 }}>LOADING COMPONENT...</div>}>
      <ShopContent />
    </Suspense>
  )
}
