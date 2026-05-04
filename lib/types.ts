export interface Photo {
  id: string
  filename: string
  takenAt: string
  thumbUrl: string
  type: 'IMAGE' | 'VIDEO'
}

export type ToastType = 'default' | 'success' | 'error'
