import { Component, ElementRef, ViewChild, inject, input, model, signal } from '@angular/core'
import { FileService } from '../../services/file/file.service'
import { FileDto } from '@api-client'

@Component({
  selector: 'app-file-upload',
  standalone: true,
  templateUrl: './file-upload.component.html'
})
export default class FileUploadComponent {
  private readonly fileService = inject(FileService)

  private _imageRemoved = signal<boolean>(false)
  selectedFile = signal<File | null>(null)
  previewUrl = signal<string | null>(null)
  existingFile = signal<{ name: string; url: string } | null>(null)

  value = model<FileDto[]>([])

  label = input<string>()
  recommendedSize = input<string | undefined>()

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>

  /**
   * @name displayedFile
   * @description 표시할 파일 반환 (새로 선택된 파일 우선, 없으면 기존 파일)
   * @returns {File | { name: string; url?: string } | null} 현재 표시할 파일
   */
  get displayedFile(): { name: string; url?: string } | File | null {
    return this.selectedFile() ?? this.existingFile()
  }

  openFileDialog(): void {
    this.fileInput.nativeElement.click()
  }

  /**
   * @name onFileSelected
   * @description 파일 선택 시 처리
   *              - 기존 파일 제거
   *              - 미리보기 업데이트
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement
    if (!input.files || input.files.length === 0) return

    this.existingFile.set(null)
    this._imageRemoved.set(true)

    this.selectedFile.set(input.files[0])
    const file = this.selectedFile()
    console.log('file', file)
    this.fileService.upload([file!]).subscribe({
      next: (res: any) => {
        this.value.update((prev) => {
          return [...prev, ...res]
        })
      },
      error: (err) => {
        console.error(err)
      }
    })
    if (file) {
      try {
        const reader = new FileReader()
        reader.onload = () => this.previewUrl.set(reader.result as string)
        reader.readAsDataURL(file)
      } catch (e) {
        console.error(e)
      }
    }
  }

  /**
   * @name onFileDrop
   * @description 드래그 앤 드롭으로 파일 선택 처리
   *              - 기존 파일 제거
   *              - 미리보기 업데이트
   */
  onFileDrop(event: DragEvent): void {
    event.preventDefault()
    if (!event.dataTransfer?.files || event.dataTransfer.files.length === 0) return

    // 기존 파일 자동 교체
    this.existingFile.set(null)
    this._imageRemoved.set(true)

    this.selectedFile.set(event.dataTransfer.files[0])
    const file = this.selectedFile()
    if (file) {
      const reader = new FileReader()
      reader.onload = () => this.previewUrl.set(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  removeFile(): void {
    this.selectedFile.set(null)
    this.previewUrl.set(null)
    this.existingFile.set(null)
    this._imageRemoved.set(true)
    if (this.fileInput) this.fileInput.nativeElement.value = ''
  }

  /**
   * @name setExistingFile
   * @description 기존 업로드된 파일을 설정하고 미리보기 표시
   * @param {{ name: string; url: string }} file 기존 파일 정보
   */
  setExistingFile(file: { name: string; url: string }): void {
    this.existingFile.set(file)
    this.previewUrl.set(file.url)
    this._imageRemoved.set(false)
  }

  getFile(): File | null {
    return this.selectedFile()
  }

  isImageRemoved(): boolean {
    return this._imageRemoved() && !this.selectedFile() && !this.existingFile()
  }
}
