import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../services/supabase'
import { api } from '../services/api'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isDemoUser, setIsDemoUser] = useState(false)

  // Register token getter for backend API requests
  useEffect(() => {
    api.setTokenGetter(async () => {
      if (isDemoUser) {
        return 'demo-00000000-0000-0000-0000-000000000001'
      }
      if (isSupabaseConfigured()) {
        const { data } = await supabase.auth.getSession()
        return data?.session?.access_token || null
      }
      return 'demo-00000000-0000-0000-0000-000000000001'
    })
  }, [isDemoUser])

  useEffect(() => {
    // Check local storage for authenticated session
    const savedSession = localStorage.getItem('safesignal_demo_session')
    if (savedSession) {
      try {
        const sessionData = JSON.parse(savedSession)
        // Discard legacy demo sessions that used Priya Sharma
        if (sessionData?.user?.email?.includes('priya.sharma') || sessionData?.profile?.full_name?.includes('Priya Sharma')) {
          localStorage.removeItem('safesignal_demo_session')
        } else if (sessionData?.user) {
          setUser(sessionData.user)
          setIsDemoUser(false)
          setProfile(sessionData.profile)
          setLoading(false)
          return
        }
      } catch {
        localStorage.removeItem('safesignal_demo_session')
      }
    }

    if (!isSupabaseConfigured()) {
      setLoading(false)
      return
    }

    // Initialize Supabase Auth Session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        loadUserProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        loadUserProfile(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadUserProfile = async (userId) => {
    try {
      const data = await api.getProfile()
      setProfile(data)
    } catch (err) {
      console.warn('Could not load profile from backend:', err)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email, password) => {
    if (!isSupabaseConfigured()) {
      // Offline / Local development session fallback
      const cleanName = email.split('@')[0]
      const capitalized = cleanName.charAt(0).toUpperCase() + cleanName.slice(1)
      const userPayload = {
        id: '00000000-0000-0000-0000-000000000001',
        email: email,
        user_metadata: { full_name: capitalized }
      }
      const profilePayload = {
        id: '00000000-0000-0000-0000-000000000001',
        full_name: capitalized,
        phone_number: '',
        emergency_note: '',
        safety_checkin_frequency: 30,
        is_onboarding_completed: true
      }
      setUser(userPayload)
      setProfile(profilePayload)
      setIsDemoUser(false)
      localStorage.setItem('safesignal_demo_session', JSON.stringify({ user: userPayload, profile: profilePayload }))
      return { user: userPayload }
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    setIsDemoUser(false)
    localStorage.removeItem('safesignal_demo_session')
    return data
  }

  const signUp = async (email, password, fullName) => {
    if (!isSupabaseConfigured()) {
      // Offline / Local development session fallback
      const displayName = fullName || email.split('@')[0]
      const userPayload = {
        id: '00000000-0000-0000-0000-000000000001',
        email: email,
        user_metadata: { full_name: displayName }
      }
      const profilePayload = {
        id: '00000000-0000-0000-0000-000000000001',
        full_name: displayName,
        phone_number: '',
        emergency_note: '',
        safety_checkin_frequency: 30,
        is_onboarding_completed: true
      }
      setUser(userPayload)
      setProfile(profilePayload)
      setIsDemoUser(false)
      localStorage.setItem('safesignal_demo_session', JSON.stringify({ user: userPayload, profile: profilePayload }))
      return { user: userPayload }
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }
      }
    })
    if (error) throw error
    return data
  }

  const signInWithGoogleAccount = (accountData) => {
    const googleUser = {
      id: accountData.id || 'google-' + Math.random().toString(36).substring(2, 11),
      email: accountData.email,
      user_metadata: {
        full_name: accountData.full_name,
        provider: 'google',
        avatar_initial: accountData.avatar_initial || accountData.full_name?.charAt(0).toUpperCase()
      }
    }
    const googleProfile = {
      id: googleUser.id,
      full_name: accountData.full_name,
      phone_number: '',
      emergency_note: '',
      safety_checkin_frequency: 30,
      is_onboarding_completed: true
    }
    setUser(googleUser)
    setProfile(googleProfile)
    setIsDemoUser(false)
    localStorage.setItem('safesignal_demo_session', JSON.stringify({ user: googleUser, profile: googleProfile }))
    return { user: googleUser }
  }

  const signInWithGoogleOAuth = async () => {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/dashboard'
        }
      })
      if (error) throw error
      return { type: 'supabase_redirect', data }
    }
    return null
  }

  const signInWithGoogle = async () => {
    if (isSupabaseConfigured()) {
      return await signInWithGoogleOAuth()
    }
    return null
  }

  const loginAsDemo = () => {
    const demoPayload = {
      user: {
        id: '00000000-0000-0000-0000-000000000001',
        email: 'priya.sharma@safesignal.local',
        user_metadata: { full_name: 'Priya Sharma' }
      },
      profile: {
        id: '00000000-0000-0000-0000-000000000001',
        full_name: 'Priya Sharma',
        phone_number: '+91 98765 43210',
        emergency_note: 'Carries asthma inhaler. Blood Group: B+',
        safety_checkin_frequency: 30,
        is_onboarding_completed: true
      }
    }
    setUser(demoPayload.user)
    setProfile(demoPayload.profile)
    setIsDemoUser(true)
    localStorage.setItem('safesignal_demo_session', JSON.stringify(demoPayload))
  }

  const signOut = async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut().catch(() => {})
    }
    localStorage.removeItem('safesignal_demo_session')
    setUser(null)
    setSession(null)
    setProfile(null)
    setIsDemoUser(false)
  }

  const updateLocalProfile = (newProfile) => {
    setProfile(prev => ({ ...prev, ...newProfile }))
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        isDemoUser,
        signIn,
        signUp,
        signInWithGoogle,
        signInWithGoogleAccount,
        signInWithGoogleOAuth,
        loginAsDemo,
        signOut,
        updateLocalProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
