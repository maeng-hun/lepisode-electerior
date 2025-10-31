export interface IStorageProvider {
  upload(file: Express.Multer.File, folder: string): Promise<{ url: string; path: string }>
  delete(bucket: string, path: string): Promise<void>
}
