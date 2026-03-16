'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ProductCard from '@/components/ProductCard'
import { useCart } from '@/lib/CartContext'
import { createClient } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'

export default function ProductPage({ params }) {
  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState(null)
  const [added, setAdded] = useState(false)
  const [sizeError, setSizeError] = useState(false)
  const { addToCart } = useCart()
  const router = useRouter()

  useEffect(function() {
    async function load() {
      var supabase = createClient()
      var { data } = await supabase.from('products').select('*').eq('id', params.id).single()
      setProduct(data)
      if (data) {
        var { data: rel } = await supabase.from('products').select('*').eq('active', true).neq('id', params.id).limit(4)
        setRelated(rel || [])
      }
      setLoading(false)
    }
    load()
  }, [params.id])

  function handleAdd() {
    if (!selectedSize) { setSizeError(true); setTimeout(function() { setSizeError(false) }, 2500); return }
    addToCart(product, selectedSize)
    setAdded(true)
    setTimeout(function() { setAdded(false) }, 2000)
  }

  function handleBuyNow() {
    if (!selectedSize) { setSizeError(true); setTimeout(function() { setSizeError(false) }, 2500); return }
    addToCart(product, selectedSize)
    router.push('/checkout')
  }

  if (loading) return (
    <div><Navbar />
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 36, color: '#555', letterSpacing: 2 }}>LOADING...</div>
      </div>
    <Footer /></div>
  )

  if (!product) return (
    <div><Navbar />
      <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 48, color: '#555' }}>PRODUCT NOT FOUND</div>
        <Link href="/shop" style={{ color: '#c8ff00' }}>← Back to Shop</Link>
      </div>
    <Footer /></div>
  )

  var discount = product.original_price ? Math.round((1 - product.price / product.original_price) * 100) : null
  var isOutOfStock = product.stock === 0

  return (
    <div>
      <Navbar />
      <div style={{ padding: '14px clamp(16px,4vw,40px)', borderBottom: '1px solid #1a1a1a', fontSize: 11, color: '#555', letterSpacing: 1 }}>
        <Link href="/" style={{ color: '#555' }}>Home</Link> <span style={{ margin: '0 8px' }}>/</span>
        <Link href="/shop" style={{ color: '#555' }}>Shop</Link> <span style={{ margin: '0 8px' }}>/</span>
        <span style={{ color: '#888' }}>{product.name}</span>
      </div>

      <div className="mobile-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '75vh' }}>
        {/* Image */}
        <div style={{ background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', minHeight: 480 }}>
          {product.badge && !isOutOfStock && (
            <div style={{ position: 'absolute', top: 20, left: 20, background: product.badge === 'Sale' ? '#ff3b3b' : '#c8ff00', color: '#0a0a0a', fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', padding: '4px 10px', fontWeight: 700, zIndex: 1 }}>{product.badge}</div>
          )}
          {product.image_url ? (
            <Image src={product.image_url} alt={product.name} fill style={{ objectFit: 'cover' }} sizes="50vw" />
          ) : (
            <svg width="140" height="140" viewBox="0 0 140 140" fill="none">
              <rect x="20" y="30" width="100" height="100" rx="3" stroke="#333" strokeWidth="2" />
              <path d="M20 52 Q42 32 64 42 Q86 24 108 42 Q130 32 120 52" stroke="#3a3a3a" strokeWidth="2" fill="none" />
              <text x="70" y="88" textAnchor="middle" fill="#2a2a2a" fontSize="16" fontFamily="'Bebas Neue',sans-serif" letterSpacing="3">NUNO</text>
            </svg>
          )}
        </div>

        {/* Info */}
        <div style={{ padding: 'clamp(32px,5vw,60px) clamp(20px,4vw,56px)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: 10, color: '#888', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>{product.category}</div>
          <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(36px,5vw,48px)', letterSpacing: 2, lineHeight: 1, marginBottom: 20 }}>{product.name}</h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
            <span style={{ fontSize: 26, color: isOutOfStock ? '#555' : '#c8ff00', fontWeight: 500 }}>₹{product.price.toLocaleString('en-IN')}</span>
            {product.original_price && <span style={{ fontSize: 15, color: '#555', textDecoration: 'line-through' }}>₹{product.original_price.toLocaleString('en-IN')}</span>}
            {discount && <span style={{ background: '#c8ff00', color: '#0a0a0a', fontSize: 10, padding: '3px 9px', fontWeight: 700 }}>{discount}% OFF</span>}
          </div>

          <p style={{ color: '#888', fontSize: 13, lineHeight: 1.8, marginBottom: 28 }}>{product.description}</p>

          {/* Stock indicator */}
          {product.stock <= 5 && product.stock > 0 && (
            <div style={{ background: '#1a1a1a', border: '1px solid #ff3b3b', padding: '8px 14px', fontSize: 11, color: '#ff3b3b', marginBottom: 20 }}>
              Only {product.stock} left in stock — order soon!
            </div>
          )}

          {/* Size */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: sizeError ? '#ff3b3b' : '#888', marginBottom: 10 }}>
              {sizeError ? '← Please select a size' : 'Select Size'}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {product.sizes.map(function(size) {
                var sel = selectedSize === size
                return (
                  <button key={size} onClick={function() { setSelectedSize(size); setSizeError(false) }} style={{ width: 46, height: 46, background: sel ? '#c8ff00' : 'transparent', color: sel ? '#0a0a0a' : '#f5f3ee', border: '1px solid', borderColor: sel ? '#c8ff00' : sizeError ? '#ff3b3b' : '#2a2a2a', fontSize: 12, fontWeight: 500, transition: 'all 0.15s' }}>
                    {size}
                  </button>
                )
              })}
            </div>
          </div>

          {isOutOfStock ? (
            <button disabled style={{ width: '100%', background: '#1a1a1a', color: '#555', border: '1px solid #2a2a2a', padding: 17, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Out of Stock</button>
          ) : (
            <>
              <button onClick={handleAdd} style={{ width: '100%', background: added ? '#1a1a1a' : '#c8ff00', color: added ? '#c8ff00' : '#0a0a0a', border: '1px solid', borderColor: added ? '#c8ff00' : '#c8ff00', padding: 17, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 600, marginBottom: 12, transition: 'all 0.2s' }}>
                {added ? '✓ Added to Cart!' : 'Add to Cart'}
              </button>
              <button onClick={handleBuyNow} style={{ width: '100%', background: 'transparent', color: '#f5f3ee', border: '1px solid #2a2a2a', padding: 17, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 28 }}>
                Buy Now
              </button>
            </>
          )}

          <div style={{ borderTop: '1px solid #1a1a1a', paddingTop: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[['Material','100% Cotton'],['Fit','Oversized'],['Color', product.color || '—'],['Origin','Made in India']].map(function(item) {
              return (
                <div key={item[0]}>
                  <div style={{ fontSize: 10, color: '#555', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 3 }}>{item[0]}</div>
                  <div style={{ fontSize: 13, color: '#f5f3ee' }}>{item[1]}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section style={{ padding: 'clamp(40px,5vw,80px) clamp(16px,4vw,40px)', borderTop: '1px solid #2a2a2a' }}>
          <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 44, letterSpacing: 2, marginBottom: 40 }}>YOU MAY ALSO LIKE</h2>
          <div className="grid-4">
            {related.map(function(p) { return <ProductCard key={p.id} product={p} /> })}
          </div>
        </section>
      )}
      <Footer />
    </div>
  )
}
