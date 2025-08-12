import { useEffect, useState } from 'react'

interface UseImagePreloadOptions {
  enabled?: boolean
  delay?: number
  batchSize?: number
}

export const useImagePreload = (imageUrls: string[], options: UseImagePreloadOptions = {}) => {
  const { enabled = true, delay = 2000, batchSize = 5 } = options

  const [loadedCount, setLoadedCount] = useState(0)
  const [isPreloading, setIsPreloading] = useState(false)

  useEffect(() => {
    if (!enabled || imageUrls.length === 0) return

    const timer = setTimeout(() => {
      setIsPreloading(true)

      const preloadBatch = (startIndex: number) => {
        const batch = imageUrls.slice(startIndex, startIndex + batchSize)

        const promises = batch.map((url) => {
          return new Promise<void>((resolve) => {
            const img = new Image()
            img.onload = () => {
              setLoadedCount((prev) => prev + 1)
              resolve()
            }
            img.onerror = () => {
              // Still count as "loaded" to continue the process
              setLoadedCount((prev) => prev + 1)
              resolve()
            }
            img.src = url
          })
        })

        Promise.all(promises).then(() => {
          const nextIndex = startIndex + batchSize
          if (nextIndex < imageUrls.length) {
            // Load next batch after a small delay
            setTimeout(() => preloadBatch(nextIndex), 100)
          } else {
            setIsPreloading(false)
          }
        })
      }

      preloadBatch(0)
    }, delay)

    return () => {
      clearTimeout(timer)
      setIsPreloading(false)
    }
  }, [imageUrls, enabled, delay, batchSize])

  return {
    loadedCount,
    totalCount: imageUrls.length,
    isPreloading,
    progress: imageUrls.length > 0 ? (loadedCount / imageUrls.length) * 100 : 0,
  }
}
