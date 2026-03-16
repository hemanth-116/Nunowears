import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ProductCard from '@/components/ProductCard'
import { createServerSupabase } from '@/lib/supabase-server'
import Link from 'next/link'

export default async function HomePage() {
  const supabase = createServerSupabase()
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false })
    .limit(4)

  var featured = products || []

  return (
    <div>
      <Navbar />

      {/* HERO */}
      <section style={{ position: 'relative', height: '90vh', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 'clamp(24px,4vw,60px)', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: '#0a0a0a' }} />
        <div style={{ position: 'absolute', inset: 0, opacity: 0.2, backgroundImage: 'linear-gradient(#2a2a2a 1px,transparent 1px),linear-gradient(90deg,#2a2a2a 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: '#c8ff00', marginBottom: 16 }}>● New Collection — 2025</div>
          <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(64px,13vw,160px)', lineHeight: 0.92, letterSpacing: 2, color: '#f5f3ee' }}>
            WEAR<br />YOUR<br /><span style={{ color: '#c8ff00' }}>STORY</span>
          </h1>
          <p style={{ color: '#888', fontSize: 13, letterSpacing: 1, marginTop: 20, maxWidth: 320, lineHeight: 1.8 }}>Bold cuts. Raw textures. Clothing that does not ask for permission.</p>
          <div style={{ display: 'flex', gap: 14, marginTop: 36, flexWrap: 'wrap' }}>
            <Link href="/shop" style={{ background: '#c8ff00', color: '#0a0a0a', padding: '14px 32px', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 600, display: 'inline-block' }}>Shop Now</Link>
            <Link href="/shop" style={{ background: 'transparent', color: '#f5f3ee', border: '1px solid #2a2a2a', padding: '14px 32px', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', display: 'inline-block' }}>View All</Link>
          </div>
        </div>
        <div style={{ position: 'absolute', right: '4vw', bottom: '6vh', fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(80px,12vw,150px)', color: '#1a1a1a', lineHeight: 1, pointerEvents: 'none', userSelect: 'none' }}>01</div>
      </section>

      {/* MARQUEE */}
      <div style={{ borderTop: '1px solid #2a2a2a', borderBottom: '1px solid #2a2a2a', padding: '13px 0', overflow: 'hidden', background: '#111' }}>
        <div style={{ display: 'flex', gap: 56, animation: 'marquee 20s linear infinite', whiteSpace: 'nowrap' }}>
          {['NUNO','★','NEW DROP','★','OVERSIZED FIT','★','LIMITED PIECES','★','STREETWEAR','★','MADE IN INDIA','★',
            'NUNO','★','NEW DROP','★','OVERSIZED FIT','★','LIMITED PIECES','★','STREETWEAR','★','MADE IN INDIA','★'].map(function(t,i) {
            return <span key={i} style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, letterSpacing: 4, color: t==='★' ? '#c8ff00' : '#555' }}>{t}</span>
          })}
        </div>
      </div>

      {/* NEW ARRIVALS */}
      <section style={{ padding: 'clamp(40px,6vw,80px) clamp(16px,4vw,40px)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, flexWrap: 'wrap', gap: 12 }}>
          <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(32px,5vw,48px)', letterSpacing: 2 }}>NEW ARRIVALS</h2>
          <Link href="/shop" style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: '#c8ff00', borderBottom: '1px solid #c8ff00', paddingBottom: 2 }}>View All →</Link>
        </div>
        <div className="grid-4">
          {featured.map(function(p) { return <ProductCard key={p.id} product={p} /> })}
        </div>
      </section>

      {/* CATEGORIES */}
      <section style={{ padding: '0 clamp(16px,4vw,40px) clamp(40px,6vw,80px)' }}>
        <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(32px,5vw,48px)', letterSpacing: 2, marginBottom: 28 }}>SHOP BY CATEGORY</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16, minHeight: 320 }}>
          {[
            { name: 'TOPS', count: '24 Styles', bg: 'linear-gradient(160deg,#1a1a2e,#0f3460)' },
            { name: 'BOTTOMS', count: '16 Styles', bg: 'linear-gradient(160deg,#2d1b00,#4a2c0a)' },
            { name: 'OUTERWEAR', count: '10 Styles', bg: 'linear-gradient(160deg,#0d1b0d,#0f3d0f)' },
          ].map(function(cat) {
            return (
              <Link key={cat.name} href={'/shop?category=' + cat.name} style={{ position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'flex-end', padding: 24, textDecoration: 'none', background: cat.bg, minHeight: 200 }}>
                <div>
                  <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 32, letterSpacing: 2, color: '#f5f3ee' }}>{cat.name}</div>
                  <div style={{ fontSize: 11, color: '#888', letterSpacing: 1, marginTop: 4 }}>{cat.count}</div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* BRAND STATEMENT */}
      <section style={{ padding: 'clamp(48px,6vw,80px) clamp(16px,4vw,40px)', background: '#111', borderTop: '1px solid #2a2a2a', borderBottom: '1px solid #2a2a2a', textAlign: 'center' }}>
        <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(32px,6vw,72px)', letterSpacing: 2, maxWidth: 860, margin: '0 auto', lineHeight: 1.1 }}>
          CLOTHING IS <span style={{ color: '#c8ff00' }}>SELF-EXPRESSION</span>.<br />WE JUST MAKE IT LOUDER.
        </h2>
      </section>

      {/* NEWSLETTER */}
      <section style={{ padding: 'clamp(40px,6vw,80px) clamp(16px,4vw,40px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 32, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(32px,5vw,48px)', letterSpacing: 2, lineHeight: 1 }}>
            GET <span style={{ color: '#c8ff00' }}>10% OFF</span><br />YOUR FIRST ORDER
          </h2>
          <p style={{ color: '#888', fontSize: 13, marginTop: 10 }}>Join the NUNO tribe. No spam, just drops.</p>
        </div>
        <div style={{ display: 'flex', minWidth: 280, flex: 1, maxWidth: 400 }}>
          <input type="email" placeholder="your@email.com" style={{ flex: 1, minWidth: 0, background: 'transparent', border: '1px solid #2a2a2a', borderRight: 'none', padding: '14px', color: '#f5f3ee', fontSize: 13, outline: 'none' }} />
          <button style={{ background: '#c8ff00', color: '#0a0a0a', border: 'none', padding: '14px 20px', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 600, whiteSpace: 'nowrap' }}>Subscribe</button>
        </div>
      </section>

      <Footer />
    </div>
  )
}
