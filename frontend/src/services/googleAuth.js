import { isSupabaseConfigured, supabase } from './supabase'

export const getGoogleClientId = () => {
  return (
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    localStorage.getItem('safesignal_google_client_id') ||
    ''
  )
}

export const setGoogleClientId = (id) => {
  if (id) {
    localStorage.setItem('safesignal_google_client_id', id.trim())
  } else {
    localStorage.removeItem('safesignal_google_client_id')
  }
}

export const hasGoogleClientId = () => {
  const id = getGoogleClientId()
  return Boolean(id && id.trim().length > 10)
}

/**
 * Triggers native Google Sign-In with real browser account chooser popup
 */
export const triggerGoogleOAuth = ({ onSuccess, onError, onNeedConfig }) => {
  // Option 1: If Supabase OAuth is configured, use official Supabase Google OAuth
  if (isSupabaseConfigured()) {
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
        queryParams: {
          prompt: 'select_account',
          access_type: 'offline'
        }
      }
    }).catch(err => {
      if (onError) onError(err)
    })
    return
  }

  // Option 2: If Google Cloud Client ID is configured, use Google Identity Services token client
  const clientId = getGoogleClientId()
  if (clientId && window.google?.accounts?.oauth2) {
    try {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'email profile openid',
        callback: async (tokenResponse) => {
          if (tokenResponse.error) {
            if (onError) onError(new Error(tokenResponse.error_description || tokenResponse.error))
            return
          }
          try {
            const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
            })
            if (!userInfoRes.ok) {
              throw new Error('Failed to retrieve Google profile information')
            }
            const userInfo = await userInfoRes.json()
            if (onSuccess) {
              onSuccess({
                id: userInfo.sub,
                email: userInfo.email,
                full_name: userInfo.name,
                avatar_url: userInfo.picture,
                avatar_initial: userInfo.name?.charAt(0).toUpperCase() || 'G'
              })
            }
          } catch (err) {
            if (onError) onError(err)
          }
        }
      })
      tokenClient.requestAccessToken({ prompt: 'select_account' })
      return
    } catch (err) {
      console.warn('Google Identity Services initialization warning:', err)
      if (onError) onError(err)
    }
  }

  // Option 3: If no Client ID is stored yet, prompt the modal to connect account
  if (onNeedConfig) {
    onNeedConfig()
  }
}
