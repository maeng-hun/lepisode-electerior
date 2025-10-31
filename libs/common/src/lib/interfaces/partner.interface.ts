export interface IPartner {
  id: string
  name: string
  link?: string | null
  createdAt: string
  image?: {
    id: string
    bucket: string
    path: string
    url: string
    name: string
    mimeType: string
    size: number
    createdAt: string
  } | null
}
