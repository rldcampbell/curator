import { Router, useFocusEffect, useRouter } from "expo-router"

import { useCallback, useRef } from "react"

export function useSafeRouter() {
  const router = useRouter()
  const navigationLockRef = useRef(false)

  const resetLock = useCallback(() => {
    navigationLockRef.current = false
  }, [])

  useFocusEffect(
    useCallback(() => {
      resetLock()
    }, [resetLock]),
  )

  const pushOnce = useCallback(
    (...args: Parameters<Router["push"]>) => {
      if (navigationLockRef.current) return

      navigationLockRef.current = true

      try {
        router.push(...args)
      } catch (error) {
        navigationLockRef.current = false
        throw error
      }
    },
    [router],
  )

  const navigateOnce = useCallback(
    (...args: Parameters<Router["navigate"]>) => {
      if (navigationLockRef.current) return

      navigationLockRef.current = true

      try {
        router.navigate(...args)
      } catch (error) {
        navigationLockRef.current = false
        throw error
      }
    },
    [router],
  )

  return {
    navigateOnce,
    pushOnce,
    resetLock,
  }
}
