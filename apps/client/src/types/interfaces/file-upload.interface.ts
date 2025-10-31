export interface IExistingFile {
  name: string
  url: string
}

export interface IFileWithPreview {
  file: File
  previewUrl: string | null
  isExisting?: boolean
}
