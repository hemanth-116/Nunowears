'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(function() {
    supabase.auth.getSession().then(function(ref) {
      setUser(ref.data.session?.user ?? null)
      setLoading(false)
    })
    var sub = supabase.auth.onAuthStateChange(function(event, session) {
      setUser(session?.user ?? null)
    })
    return function() { sub.data.subscription.unsubscribe() }
  }, [])

  async function signUp(email, password, fullName) {
    return supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } })
  }

  async function signIn(email, password) {
    return supabase.auth.signInWithPassword({ email, password })
  }

  async function signOut() {
    return supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() { return useContext(AuthContext) }
