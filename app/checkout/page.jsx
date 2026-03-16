'use client'
import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useCart } from '@/lib/CartContext'
import { useAuth } from '@/lib/AuthContext'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function CheckoutPage() {
  var { cart, total, clearCart } = useCart()
  var { user } = useAuth()
  var router = useRouter()
  var shipping = total >= 999 ? 0 : 99
  var grandTotal = total + shipping

  var [form, setForm] = useState({ full_name: '', email: user?.email || '', phone: '', address: '', city: '', state: '', pincode: '' })
  var [errors, setErrors] = useState({})
  var [loading, setLoading] = useState(false)
  var [step, setStep] = useState('form') // 'form' | 'success'

  function handleChange(e) {
    var n = e.target.name, v = e.target.value
    setForm(function(p) { return Object.assign({}, p, { [n]: v }) })
    setErrors(function(p) { return Object.assign({}, p, { [n]: '' }) })
  }

  function validate() {
    var e = {}
    if (!form.full_name.trim()) e.full_name = 'Required'
    if (!form.email.includes('@')) e.email = 'Enter a valid email'
    if (form.phone.replace(/\D/g, '').length < 10) e.phone = 'Enter a valid phone'
    if (!form.address.trim()) e.address = 'Required'
    if (!form.city.trim()) e.city = 'Required'
    if (!form.state.trim()) e.state = 'Required'
    if (form.pincode.replace(/\D/g, '').length !== 6) e.pincode = '6-digit pincode required'
    return e
  }

  async function handlePay() {
    var errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setLoading(true)

    try {
      // Step 1: Create Razorpay order on server
      var res = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: grandTotal }),
      })
      var { orderId: razorpayOrderId } = await res.json()

      // Step 2: Load Razorpay script
      await new Promise(function(resolve, reject) {
        if (window.Razorpay) { resolve(); return }
        var script = document.createElement('script')
        script.src = 'https://checkout.razorpay.com/v1/checkout.js'
        script.onload = resolve
        script.onerror = reject
        document.body.appendChild(script)
      })

      // Step 3: Open Razorpay
      var rzp = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: grandTotal * 100,
        currency: 'INR',
        name: 'NUNO',
        order_id: razorpayOrderId,
        prefill: { name: form.full_name, email: form.email, contact: form.phone },
        theme: { color: '#c8ff00' },
        handler: async function(response) {
          // Step 4: Verify on server + save order
          var verifyRes = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderData: {
                user_id: user?.id || null,
                total: total,
                shipping: shipping,
                address: form,
                items: cart,
              },
            }),
          })
          var verifyData = await verifyRes.json()

          if (verifyData.success) {
            // Step 5: Send confirmation email
            await fetch('/api/auth', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: form.email,
                name: form.full_name,
                orderId: verifyData.orderId,
                items: cart,
                total: total,
                shipping: shipping,
                address: form,
              }),
            })
            clearCart()
            setStep('success')
          }
        },
      })
      rzp.open()
    } catch (err) {
      alert('Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  if (cart.length === 0 && step !== 'success') return (
    <div><Navbar />
      <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 48, color: '#2a2a2a' }}>CART IS EMPTY</div>
        <Link href="/shop" style={{ background: '#c8ff00', color: '#0a0a0a', padding: '14px 32px', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 600 }}>Shop Now</Link>
      </div>
    <Footer /></div>
  )

  if (step === 'success') return (
    <div><Navbar />
      <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: '40px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, color: '#c8ff00' }}>✓</div>
        <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(40px,6vw,60px)', letterSpacing: 2 }}>ORDER CONFIRMED!</h1>
        <p style={{ color: '#888', fontSize: 14, maxWidth: 400, lineHeight: 1.8 }}>
          Thanks {form.full_name}! A confirmation email has been sent to <span style={{ color: '#f5f3ee' }}>{form.email}</span>.
        </p>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', marginTop: 12 }}>
          <Link href="/account" style={{ background: '#c8ff00', color: '#0a0a0a', padding: '14px 28px', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 600 }}>View Orders</Link>
          <Link href="/shop" style={{ border: '1px solid #2a2a2a', color: '#888', padding: '14px 28px', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase' }}>Continue Shopping</Link>
        </div>
      </div>
    <Footer /></div>
  )

  var inputStyle = function(field) {
    return { width: '100%', background: 'transparent', border: '1px solid', borderColor: errors[field] ? '#ff3b3b' : '#2a2a2a', padding: '13px 14px', color: '#f5f3ee', fontSize: 13, outline: 'none' }
  }
  var labelStyle = { fontSize: 10, color: '#888', letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 7 }

  return (
    <div>
      <Navbar />
      <main style={{ padding: 'clamp(32px,5vw,60px) clamp(16px,4vw,40px)', minHeight: '80vh' }}>
        <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(40px,6vw,60px)', letterSpacing: 2, marginBottom: 40 }}>CHECKOUT</h1>

        <div className="mobile-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 48, alignItems: 'start' }}>
          {/* Form */}
          <div>
            <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: '#888', marginBottom: 24, paddingBottom: 14, borderBottom: '1px solid #1a1a1a' }}>Delivery Details</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>Full Name</label>
                <input name="full_name" value={form.full_name} onChange={handleChange} style={inputStyle('full_name')} />
                {errors.full_name && <div style={{ fontSize: 10, color: '#ff3b3b', marginTop: 4 }}>{errors.full_name}</div>}
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} style={inputStyle('email')} />
                {errors.email && <div style={{ fontSize: 10, color: '#ff3b3b', marginTop: 4 }}>{errors.email}</div>}
              </div>
              <div>
                <label style={labelStyle}>Phone</label>
                <input name="phone" type="tel" value={form.phone} onChange={handleChange} style={inputStyle('phone')} />
                {errors.phone && <div style={{ fontSize: 10, color: '#ff3b3b', marginTop: 4 }}>{errors.phone}</div>}
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>Address</label>
                <input name="address" value={form.address} onChange={handleChange} style={inputStyle('address')} />
                {errors.address && <div style={{ fontSize: 10, color: '#ff3b3b', marginTop: 4 }}>{errors.address}</div>}
              </div>
              <div>
                <label style={labelStyle}>City</label>
                <input name="city" value={form.city} onChange={handleChange} style={inputStyle('city')} />
                {errors.city && <div style={{ fontSize: 10, color: '#ff3b3b', marginTop: 4 }}>{errors.city}</div>}
              </div>
              <div>
                <label style={labelStyle}>State</label>
                <input name="state" value={form.state} onChange={handleChange} style={inputStyle('state')} />
                {errors.state && <div style={{ fontSize: 10, color: '#ff3b3b', marginTop: 4 }}>{errors.state}</div>}
              </div>
              <div>
                <label style={labelStyle}>Pincode</label>
                <input name="pincode" value={form.pincode} onChange={handleChange} style={inputStyle('pincode')} maxLength={6} />
                {errors.pincode && <div style={{ fontSize: 10, color: '#ff3b3b', marginTop: 4 }}>{errors.pincode}</div>}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div style={{ background: '#111', border: '1px solid #2a2a2a', padding: 28, position: 'sticky', top: 90 }}>
            <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, letterSpacing: 2, marginBottom: 20 }}>ORDER REVIEW</h2>
            {cart.map(function(item) {
              return (
                <div key={item.id + '-' + item.size} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #1a1a1a' }}>
                  <div>
                    <div style={{ fontSize: 12, color: '#f5f3ee' }}>{item.name}</div>
                    <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>Size: {item.size} × {item.qty}</div>
                  </div>
                  <span style={{ fontSize: 13, color: '#c8ff00' }}>₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
                </div>
              )
            })}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ color: '#888', fontSize: 13 }}>Shipping</span>
              <span style={{ fontSize: 13, color: shipping === 0 ? '#c8ff00' : '#f5f3ee' }}>{shipping === 0 ? 'FREE' : '₹' + shipping}</span>
            </div>
            <div style={{ borderTop: '1px solid #2a2a2a', paddingTop: 16, display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <span style={{ fontSize: 14, fontWeight: 500 }}>Total</span>
              <span style={{ fontSize: 20, color: '#c8ff00', fontWeight: 500 }}>₹{grandTotal.toLocaleString('en-IN')}</span>
            </div>
            <button onClick={handlePay} disabled={loading} style={{ width: '100%', background: loading ? '#333' : '#c8ff00', color: loading ? '#888' : '#0a0a0a', border: 'none', padding: 16, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Processing...' : 'Pay ₹' + grandTotal.toLocaleString('en-IN')}
            </button>
            <p style={{ fontSize: 10, color: '#555', textAlign: 'center', marginTop: 12 }}>Secured by Razorpay · 256-bit SSL</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
