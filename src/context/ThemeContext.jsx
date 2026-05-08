import { createContext, useContext, useState, useEffect } from 'react'
import * as authService from '../services/auth.service'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('billmaster-theme') || 'dark'
  })

  // Sync theme with backend when it changes
  const updateTheme = async (newTheme) => {
    setTheme(newTheme)
    localStorage.setItem('billmaster-theme', newTheme)
    
    // Also save to backend if user is logged in
    try {
      const token = localStorage.getItem('token')
      if (token) {
        await authService.updateProfile({ theme: newTheme })
      }
    } catch (err) {
      console.error('Failed to sync theme to backend', err)
    }
  }

  useEffect(() => {
    const root = document.documentElement
    
    if (theme === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.toggle('light', !systemDark)
      root.classList.toggle('dark', systemDark)
    } else {
      root.classList.toggle('light', theme === 'light')
      root.classList.toggle('dark', theme === 'dark')
    }
  }, [theme])

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== 'system') return
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e) => {
      document.documentElement.classList.toggle('light', !e.matches)
      document.documentElement.classList.toggle('dark', e.matches)
    }
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme: updateTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
