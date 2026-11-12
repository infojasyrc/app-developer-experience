'use client'

import { ReactNode, useState } from 'react'
import { useServerInsertedHTML } from 'next/navigation'
import createCache, { EmotionCache } from '@emotion/cache'
import { CacheProvider } from '@emotion/react'

import { ThemeContextProvider } from '@/app/lib/contexts/ThemeContext'
import { MuiThemeAdapter } from './MuiThemeAdapter'

interface Props {
  children: ReactNode
}

/**
 * Replaces @mui/material-nextjs AppRouterCacheProvider (which does not yet
 * declare Next.js 16 as a peer). Implements the identical emotion-cache /
 * useServerInsertedHTML pattern so MUI styles are streamed in the initial
 * HTML payload and never cause a flash of unstyled content.
 *
 * Tree:
 *   CacheProvider          ← emotion style injection for SSR
 *     ThemeContextProvider ← light / dark mode state + localStorage
 *       MuiThemeAdapter    ← applies the MUI ThemeProvider + CssBaseline
 *         {children}
 */
export function ThemeRegistry({ children }: Props) {
  const [{ cache, flush }] = useState<{
    cache: EmotionCache
    flush: () => string[]
  }>(() => {
    const emotionCache = createCache({ key: 'mui' })
    emotionCache.compat = true

    const prevInsert = emotionCache.insert.bind(emotionCache)
    let inserted: string[] = []

    emotionCache.insert = (...args) => {
      const [, serialized] = args
      if (emotionCache.inserted[serialized.name] === undefined) {
        inserted.push(serialized.name)
      }
      return prevInsert(...args)
    }

    const flush = () => {
      const prev = inserted
      inserted = []
      return prev
    }

    return { cache: emotionCache, flush }
  })

  useServerInsertedHTML(() => {
    const names = flush()
    if (names.length === 0) return null

    let styles = ''
    for (const name of names) {
      styles += cache.inserted[name]
    }

    return (
      <style
        data-emotion={`${cache.key} ${names.join(' ')}`}
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    )
  })

  return (
    <CacheProvider value={cache}>
      <ThemeContextProvider>
        <MuiThemeAdapter>{children}</MuiThemeAdapter>
      </ThemeContextProvider>
    </CacheProvider>
  )
}
