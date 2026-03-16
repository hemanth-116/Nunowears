import './globals.css'
import { CartProvider } from '@/lib/CartContext'
import { AuthProvider } from '@/lib/AuthContext'

export const metadata = {
  title: 'NUNO — Wear Your Story',
  description: 'Bold streetwear from India. Oversized fits, raw textures, limited drops.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
