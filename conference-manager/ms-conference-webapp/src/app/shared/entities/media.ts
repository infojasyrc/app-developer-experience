export type MediaTypes = 'image' | 'file'

export interface ImageMediaType {
  id: string
  url: string
}

export type SlideStatus = 'stopped' | 'playing' | 'paused'
