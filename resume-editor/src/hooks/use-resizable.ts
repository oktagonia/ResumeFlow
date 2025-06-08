"use client"

import { useState, useEffect, useCallback } from "react"

interface UseResizableProps {
  initialWidth?: number
  minWidth?: number
  maxWidth?: number
}

export function useResizable({ initialWidth = 50, minWidth = 20, maxWidth = 80 }: UseResizableProps = {}) {
  const [isResizing, setIsResizing] = useState(false)
  const [leftWidth, setLeftWidth] = useState(initialWidth)

  const startResizing = useCallback(() => {
    setIsResizing(true)
  }, [])

  const stopResizing = useCallback(() => {
    setIsResizing(false)
  }, [])

  const resize = useCallback(
    (e: MouseEvent) => {
      if (isResizing) {
        const containerWidth = document.body.clientWidth
        const newWidth = (e.clientX / containerWidth) * 100

        // Constrain the width between minWidth and maxWidth
        if (newWidth >= minWidth && newWidth <= maxWidth) {
          setLeftWidth(newWidth)
        }
      }
    },
    [isResizing, minWidth, maxWidth],
  )

  useEffect(() => {
    window.addEventListener("mousemove", resize)
    window.addEventListener("mouseup", stopResizing)

    return () => {
      window.removeEventListener("mousemove", resize)
      window.removeEventListener("mouseup", stopResizing)
    }
  }, [resize, stopResizing])

  return {
    leftWidth,
    rightWidth: 100 - leftWidth,
    isResizing,
    startResizing,
    stopResizing,
  }
}
