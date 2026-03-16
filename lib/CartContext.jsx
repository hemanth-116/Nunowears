'use client'
import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cart, setCart] = useState([])

  useEffect(function() {
    try {
      var saved = localStorage.getItem('nuno_cart')
      if (saved) setCart(JSON.parse(saved))
    } catch(e) {}
  }, [])

  useEffect(function() {
    try { localStorage.setItem('nuno_cart', JSON.stringify(cart)) } catch(e) {}
  }, [cart])

  function addToCart(product, size) {
    setCart(function(prev) {
      var existing = prev.find(function(i) { return i.id === product.id && i.size === size })
      if (existing) {
        return prev.map(function(i) {
          return i.id === product.id && i.size === size ? { ...i, qty: i.qty + 1 } : i
        })
      }
      return [...prev, { ...product, size: size, qty: 1 }]
    })
  }

  function removeFromCart(id, size) {
    setCart(function(prev) { return prev.filter(function(i) { return !(i.id === id && i.size === size) }) })
  }

  function updateQty(id, size, qty) {
    if (qty < 1) { removeFromCart(id, size); return }
    setCart(function(prev) {
      return prev.map(function(i) { return i.id === id && i.size === size ? { ...i, qty: qty } : i })
    })
  }

  function clearCart() { setCart([]) }

  var total = cart.reduce(function(s, i) { return s + i.price * i.qty }, 0)
  var count = cart.reduce(function(s, i) { return s + i.qty }, 0)

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQty, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() { return useContext(CartContext) }
