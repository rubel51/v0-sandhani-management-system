import { useState, useEffect, useCallback } from 'react'

interface UseAsyncState<T> {
  data: T | null
  loading: boolean
  error: Error | null
}

/**
 * Hook for managing async data fetching from store
 * Simplifies loading states and error handling
 */
export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  immediate = true,
  dependencies: React.DependencyList = []
) {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    loading: immediate,
    error: null,
  })

  const execute = useCallback(async () => {
    setState({ data: null, loading: true, error: null })
    try {
      const response = await asyncFunction()
      setState({ data: response, loading: false, error: null })
      return response
    } catch (error) {
      setState({ data: null, loading: false, error: error as Error })
      throw error
    }
  }, [...dependencies])

  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, [execute, immediate])

  return { ...state, execute }
}

/**
 * Hook for managing form submissions with loading and error states
 */
export function useAsyncAction<T extends any[], R>(
  asyncFunction: (...args: T) => Promise<R>
) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const execute = useCallback(
    async (...args: T): Promise<R | null> => {
      setLoading(true)
      setError(null)
      try {
        const result = await asyncFunction(...args)
        return result
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))
        setError(error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [asyncFunction]
  )

  return { execute, loading, error }
}
