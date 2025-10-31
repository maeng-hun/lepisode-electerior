import { Component, ElementRef, ViewChild, inject, input, signal } from '@angular/core'
import { FormBuilder, FormGroup } from '@angular/forms'
import { IExistingFile, IFileWithPreview } from '../../../types/interfaces/file-upload.interface'

@Component({
  selector: 'app-file-upload',
  standalone: true,
  templateUrl: './file-upload.component.html'
})
export default class FileUploadComponent {
  private fb = inject<FormBuilder>(FormBuilder)

  selectedFiles = signal<IFileWithPreview[]>([])
  existingFiles = signal<IExistingFile[]>([])

  label = input<string>()
  recommendedSize = input<string | undefined>()

  private _filesRemoved = new Set<string>()

  form: FormGroup = this.fb.group({
    file: [null],
    content: ['']
  })

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>

  // 표시할 파일들 (새로 선택된 파일 + 제거되지 않은 기존 파일들)
  get displayedFiles(): IFileWithPreview[] {
    const existingFilesNotRemoved = this.existingFiles()
      .filter((ef) => !this._filesRemoved.has(ef.name))
      .map((ef) => ({
        file: new File([], ef.name),
        previewUrl: ef.url,
        isExisting: true
      }))

    return [...existingFilesNotRemoved, ...this.selectedFiles()]
  }

  openFileDialog(): void {
    this.fileInput.nativeElement.click()
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement
    if (!input.files) return

    const files = Array.from(input.files)
    this.addFiles(files)
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault()
    if (event.dataTransfer?.files) {
      const files = Array.from(event.dataTransfer.files) as File[]
      this.addFiles(files)
    }
  }

  private addFiles(files: File[]): void {
    const newFilesWithPreview: IFileWithPreview[] = files.map((file) => ({
      file,
      previewUrl: null,
      isExisting: false
    }))

    // 이미지 파일들에 대해 미리보기 생성
    newFilesWithPreview.forEach((fileWithPreview): void => {
      if (this.isImageFile(fileWithPreview.file)) {
        const reader = new FileReader()
        reader.onload = () => {
          fileWithPreview.previewUrl = reader.result as string
        }
        reader.readAsDataURL(fileWithPreview.file)
      }
    })

    // 기존 선택된 파일들과 합치기 (또는 교체하기 - 요구사항에 따라)
    this.selectedFiles.set([...this.selectedFiles(), ...newFilesWithPreview])

    // 폼 업데이트
    this.updateFormFiles()
  }

  removeFile(fileToRemove: IFileWithPreview): void {
    if (fileToRemove.isExisting) {
      // 기존 파일인 경우 제거 목록에 추가
      const existingFile = this.existingFiles().find((ef) => ef.url === fileToRemove.previewUrl)
      if (existingFile) {
        this._filesRemoved.add(existingFile.name)
      }
    } else {
      // 새로 선택된 파일인 경우 배열에서 제거
      this.selectedFiles.set(this.selectedFiles().filter((f) => f !== fileToRemove))
    }

    this.updateFormFiles()

    // 파일 입력 필드 초기화
    if (this.fileInput) {
      this.fileInput.nativeElement.value = ''
    }
  }

  removeAllFiles(): void {
    // 모든 기존 파일을 제거 목록에 추가
    this.existingFiles().forEach((ef) => {
      this._filesRemoved.add(ef.name)
    })

    // 선택된 파일들 모두 제거
    this.selectedFiles.set([])

    this.updateFormFiles()

    if (this.fileInput) {
      this.fileInput.nativeElement.value = ''
    }
  }

  private updateFormFiles(): void {
    const actualFiles = this.selectedFiles().map((f) => f.file)
    this.form.patchValue({ file: actualFiles })
  }

  isImageFile(file: File): boolean {
    return file.type.startsWith('image/')
  }

  // 기존 파일들 설정 (서버에서 불러온 파일들)
  setExistingFiles(files: IExistingFile[]): void {
    this.existingFiles.set(files)
    this._filesRemoved.clear()
  }

  // 단일 기존 파일 설정
  setExistingFile(file: IExistingFile): void {
    this.setExistingFiles([file])
  }

  // 새로 선택된 파일들만 반환
  getSelectedFiles(): File[] {
    return this.selectedFiles().map((f) => f.file)
  }

  // 제거된 기존 파일들의 이름 반환
  getRemovedFileNames(): string[] {
    return Array.from(this._filesRemoved)
  }

  // 특정 기존 파일이 제거되었는지 확인
  isExistingFileRemoved(fileName: string): boolean {
    return this._filesRemoved.has(fileName)
  }

  // 모든 파일이 제거되었는지 확인
  areAllFilesRemoved(): boolean {
    return this.displayedFiles.length === 0
  }
}
