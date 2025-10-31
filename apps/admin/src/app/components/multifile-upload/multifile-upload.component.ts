import { Component, ElementRef, input, output, viewChild } from '@angular/core'

@Component({
  selector: 'app-multifile-upload',
  standalone: true,
  templateUrl: './multifile-upload.component.html'
})
export default class MultifileUploadComponent {
  recommendedSize = input<string | undefined>()
  multiple = input<boolean>(true) // 여러 장 업로드 허용 여부
  limit = input<number>(5) // 최대 업로드 개수
  category = input<'PC' | 'MOBILE' | 'ETC'>()
  accept = input<string>('image/*')

  filesChange = output<File[]>() // 부모 컴포넌트로 파일 배열 전달
  fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput')

  // === 상태 ===
  selectedFiles: File[] = []
  previews: string[] = []

  // 파일 선택 다이얼로그 열기
  openFileDialog() {
    this.fileInput()?.nativeElement.click()
  }

  // input[type=file] 업로드
  onFileSelected(event: Event) {
    const inputEl = event.target as HTMLInputElement
    if (!inputEl.files || inputEl.files.length === 0) return

    let files = Array.from(inputEl.files)

    if (!this.multiple()) {
      files = [files[0]]
    }

    this.addFiles(files)

    // 같은 파일 다시 선택할 수 있도록 초기화
    inputEl.value = ''
  }

  // 드래그&드롭 업로드
  onFileDrop(event: DragEvent) {
    event.preventDefault()
    if (!event.dataTransfer?.files) return
    let files = Array.from(event.dataTransfer.files)

    if (!this.multiple()) {
      files = [files[0]]
    }

    this.addFiles(files)
  }

  // 파일/미리보기 추가
  private addFiles(files: File[]) {
    // 기존 파일 + 새 파일 합치기
    let newFiles = [...this.selectedFiles, ...files]

    // 중복 제거 (파일명 + 사이즈 기준)
    newFiles = newFiles.filter(
      (file, index, self) => index === self.findIndex((f) => f.name === file.name && f.size === file.size)
    )

    // 제한 적용
    if (this.limit() && newFiles.length > this.limit()) {
      newFiles = newFiles.slice(0, this.limit())
    }

    this.selectedFiles = newFiles

    // 👉 FileReader 실행은 Promise.all로 한 번에
    Promise.all(
      this.selectedFiles.map(
        (file) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.readAsDataURL(file)
          })
      )
    ).then((results) => {
      this.previews = results
    })

    this.filesChange.emit(this.selectedFiles)
  }

  // 파일 삭제
  removeFile(i: number) {
    this.selectedFiles.splice(i, 1)
    this.previews.splice(i, 1)
    this.filesChange.emit(this.selectedFiles)
  }
}
