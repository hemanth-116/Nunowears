'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { useCart } from '@/lib/CartContext'

export default function ProductCard({ product }) {
  const { addToCart } = useCart()
  const [hovered, setHovered] = useState(false)
  const [added, setAdded] = useState(false)

  function handleQuickAdd(e) {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product, product.sizes[0])
    setAdded(true)
    setTimeout(function() { setAdded(false) }, 1500)
  }

  var isLowStock = product.stock > 0 && product.stock <= 5
  var isOutOfStock = product.stock === 0

  return (
    <div onMouseEnter={function() { setHovered(true) }} onMouseLeave={function() { setHovered(false) }}>
      <Link href={'/product/' + product.id} style={{ display: 'block' }}>

        {/* Image */}
        <div style={{ position: 'relative', overflow: 'hidden', aspectRatio: '3/4', background: '#1a1a1a' }}>
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              style={{ objectFit: 'cover', transition: 'transform 0.4s ease', transform: hovered ? 'scale(1.05)' : 'scale(1)' }}
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.4s ease', transform: hovered ? 'scale(1.05)' : 'scale(1)' }}>
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                <rect x="10" y="20" width="60" height="52" rx="2" stroke="#333" strokeWidth="1.5" />
                <path d="M10 32 Q22 20 34 26 Q46 14 58 26 Q70 20 70 32" stroke="#3a3a3a" strokeWidth="1.5" fill="none" />
                <text x="40" y="52" textAnchor="middle" fill="#2a2a2a" fontSize="9" fontFamily="'Bebas Neue',sans-serif" letterSpacing="2">NUNO</text>
              </svg>
            </div>
          )}

          {/* Overlay */}
          {!isOutOfStock && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: hovered ? 1 : 0, transition: 'opacity 0.3s' }}>
              <button onClick={handleQuickAdd} style={{ background: added ? '#fff' : '#c8ff00', color: '#0a0a0a', border: 'none', padding: '11px 24px', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 600 }}>
                {added ? '✓ Added!' : 'Quick Add'}
              </button>
            </div>
          )}

          {/* Badges */}
          <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {product.badge && !isOutOfStock && (
              <div style={{ background: product.badge === 'Sale' ? '#ff3b3b' : '#c8ff00', color: '#0a0a0a', fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', padding: '3px 8px', fontWeight: 700 }}>{product.badge}</div>
            )}
            {isOutOfStock && <div style={{ background: '#333', color: '#888', fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', padding: '3px 8px' }}>Sold Out</div>}
            {isLowStock && !isOutOfStock && <div style={{ background: '#ff3b3b', color: '#fff', fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', padding: '3px 8px' }}>Only {product.stock} left</div>}
          </div>
        </div>

        {/* Info */}
        <div style={{ paddingTop: 12 }}>
          <div style={{ fontSize: 10, color: '#888', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 3 }}>{product.category}</div>
          <div style={{ fontSize: 13, color: '#f5f3ee', marginBottom: 5 }}>{product.name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14, color: isOutOfStock ? '#555' : '#c8ff00', fontWeight: 500 }}>₹{product.price.toLocaleString('en-IN')}</span>
            {product.original_price && <span style={{ fontSize: 11, color: '#555', textDecoration: 'line-through' }}>₹{product.original_price.toLocaleString('en-IN')}</span>}
          </div>
        </div>
      </Link>
    </div>
  )
}
