export interface IPortfolio {
  id: string
  title: string
  admin?: string
  description?: string
  views: number
  createdAt: string
  images?: Array<{
    id: string
    bucket: string
    path: string
    url: string
    name: string
    mimeType: string
    size: number
    createdAt: string
  }> | null
}
