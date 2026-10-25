import React, { createContext, useContext, useState, useEffect } from 'react'
import { LANGUAGES, TRANSLATIONS } from '../i18n/translations'

const LanguageContext = createContext()

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('safesignal_language') || 'en'
  })

  // Show language selection modal on first visit
  const [showLanguageModal, setShowLanguageModal] = useState(() => {
    return !localStorage.getItem('safesignal_language_chosen')
  })

  const setLanguage = (langCode) => {
    setLanguageState(langCode)
    localStorage.setItem('safesignal_language', langCode)
    localStorage.setItem('safesignal_language_chosen', 'true')
  }

  const confirmLanguageSelection = () => {
    localStorage.setItem('safesignal_language_chosen', 'true')
    setShowLanguageModal(false)
  }

  // Translation function with fallback and variable interpolation
  const t = (key, params = {}) => {
    const langDict = TRANSLATIONS[language] || TRANSLATIONS.en
    let str = langDict[key] || TRANSLATIONS.en[key] || key

    // Variable interpolation like {sec}
    Object.keys(params).forEach(param => {
      str = str.replace(new RegExp(`\\{${param}\\}`, 'g'), params[param])
    })

    return str
  }

  const currentLanguageObj = LANGUAGES.find(l => l.code === language) || LANGUAGES[0]

  return (
    <LanguageContext.Provider value={{
      language,
      setLanguage,
      availableLanguages: LANGUAGES,
      currentLanguageObj,
      t,
      showLanguageModal,
      setShowLanguageModal,
      confirmLanguageSelection
    }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)
