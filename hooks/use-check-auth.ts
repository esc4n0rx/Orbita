// hooks/use-check-auth.ts
"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserStorage } from '@/lib/token-service'

export function useCheckAuth(redirectTo = '/') {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      const isLoggedIn = UserStorage.isLoggedIn()
      
      if (!isLoggedIn) {
        router.push(redirectTo)
        return
      }
      
      setIsAuthenticated(true)
      setLoading(false)
    }
    
    checkAuth()
  }, [router, redirectTo])

  return { isAuthenticated, loading }
}