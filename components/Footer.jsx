import Link from 'next/link'

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid #2a2a2a', background: '#0a0a0a', marginTop: 80 }}>
      <div style={{ padding: '48px 24px 32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 32 }}>
        <div>
          <img src="/logo.png" alt="NUNO Logo" style={{ height: 48, objectFit: 'contain', marginBottom: 14 }} />
          <p style={{ color: '#888', fontSize: 12, lineHeight: 1.8 }}>Bold cuts. Raw textures. Made in India.</p>
        </div>
        <div>
          <div style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#555', marginBottom: 16 }}>Shop</div>
          {['New Arrivals', 'Tops', 'Bottoms', 'Outerwear', 'Sale'].map(function (l) {
            return <div key={l} style={{ marginBottom: 10 }}><Link href="/shop" style={{ color: '#555', fontSize: 13 }}>{l}</Link></div>
          })}
        </div>
        <div>
          <div style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#555', marginBottom: 16 }}>Help</div>
          {['Shipping Info', 'Returns', 'Size Guide', 'Contact Us'].map(function (l) {
            return <div key={l} style={{ marginBottom: 10 }}><Link href="#" style={{ color: '#555', fontSize: 13 }}>{l}</Link></div>
          })}
        </div>
        <div>
          <div style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#555', marginBottom: 16 }}>Newsletter</div>
          <p style={{ color: '#555', fontSize: 12, marginBottom: 14 }}>Get 10% off your first order.</p>
          <div style={{ display: 'flex' }}>
            <input type="email" placeholder="your@email.com" style={{ flex: 1, minWidth: 0, background: 'transparent', border: '1px solid #2a2a2a', borderRight: 'none', padding: '11px 12px', color: '#f5f3ee', fontSize: 12, outline: 'none' }} />
            <button style={{ background: '#c8ff00', color: '#0a0a0a', border: 'none', padding: '11px 14px', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', fontWeight: 600, whiteSpace: 'nowrap' }}>Join</button>
          </div>
        </div>
      </div>
      <div style={{ borderTop: '1px solid #1a1a1a', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <span style={{ color: '#333', fontSize: 11 }}>© 2025 NUNO. All rights reserved.</span>
        <div style={{ display: 'flex', gap: 20 }}>
          {['Privacy', 'Terms', 'Instagram'].map(function (l) { return <Link key={l} href="#" style={{ color: '#333', fontSize: 11 }}>{l}</Link> })}
        </div>
      </div>
    </footer>
  )
}
