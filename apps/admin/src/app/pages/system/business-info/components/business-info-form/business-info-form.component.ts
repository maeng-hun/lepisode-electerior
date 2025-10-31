import { Component, inject, OnInit, signal, ViewChild } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'
import FileUploadComponent from '../../../../../components/file-upload/file-upload.component'
import { lastValueFrom, Observable } from 'rxjs'
import { formatContactNumber, formatBusinessNumber, ToastService } from '@electerior/common'
import { InputAddressComponent } from '../../../../../components/input-address/input-address.component'
import { ConfirmDialogService } from '../../../../../services/confirm-dialog.service'
import { BusinessInfoResponseDto, BusinessInfoService } from '@api-client'
import { FileUploadBusinessInfoService } from '../../../../../services/business-info/business-info.service'

/**
 * @name BusinessInfoFormComponent
 * @description 사업자 정보 등록/수정 폼 컴포넌트
 *              - FormGroup 기반 폼
 *              - 파일 업로드(FileUploadComponent) 포함
 *              - 기존 이미지 삭제/교체 처리
 *              - 주소 입력(InputAddressComponent) 포함
 */
@Component({
  selector: 'app-business-info-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FileUploadComponent, InputAddressComponent],
  templateUrl: './business-info-form.component.html'
})
export class BusinessInfoFormComponent implements OnInit {
  private readonly fb = inject<FormBuilder>(FormBuilder)
  private readonly apiService = inject<BusinessInfoService>(BusinessInfoService)
  private readonly fileService = inject<FileUploadBusinessInfoService>(FileUploadBusinessInfoService)
  private readonly toastr = inject<ToastService>(ToastService)
  private readonly confirmDialog = inject<ConfirmDialogService>(ConfirmDialogService)

  existingData = signal<BusinessInfoResponseDto | null>(null)

  @ViewChild(FileUploadComponent) fileUpload!: FileUploadComponent

  form: FormGroup = this.fb.group({
    companyName: ['', Validators.required],
    ceoName: ['', Validators.required],
    address: ['', Validators.required],
    contactNumber: [
      '',
      [
        Validators.required,
        Validators.pattern(/^(?:02-\d{3}-\d{4}|02-\d{4}-\d{4}|0\d{2}-\d{3}-\d{4}|0\d{2}-\d{4}-\d{4})$/)
      ]
    ],
    email: ['', [Validators.required, Validators.email]],
    businessNumber: ['', [Validators.required, Validators.pattern(/^\d{3}-\d{2}-\d{5}$/)]]
  })

  ngOnInit(): void {
    this.loadBusinessInfo()
  }

  /** 서버에서 최신 사업자 정보 불러오기 */
  private loadBusinessInfo(): void {
    this.apiService.businessInfoControllerGet().subscribe({
      next: (data) => {
        if (!data) return
        this.existingData.set(data)

        this.form.patchValue({
          companyName: data.companyName,
          ceoName: data.ceoName,
          address: data.address,
          contactNumber: data.contactNumber,
          email: data.email,
          businessNumber: data.businessNumber
        })

        // 기존 이미지 파일 세팅
        setTimeout(() => {
          if (data.image?.name && data.image?.url) {
            this.fileUpload.setExistingFile({ name: data.image.name, url: data.image.url })
          } else {
            this.fileUpload.removeFile()
          }
        })
      },
      error: (err) => console.error('사업자 정보 조회 실패:', err)
    })
  }

  /** 연락처 입력 시 자동 포맷 */
  formatContactNumber(event: Event): void {
    const input = event.target as HTMLInputElement
    const formatted = formatContactNumber(input.value)
    input.value = formatted
    this.form.get('contactNumber')?.setValue(formatted, { emitEvent: false })
  }

  /** 사업자 등록번호 입력 시 자동 포맷 */
  formatBusinessNumber(event: Event): void {
    const input = event.target as HTMLInputElement
    const formatted = formatBusinessNumber(input.value)
    input.value = formatted
    this.form.get('businessNumber')?.setValue(formatted, { emitEvent: false })
  }

  /**
   * @name onSubmit
   * @description 폼 제출 처리
   *              - 기존 이미지 제거 시 서버 이미지 삭제 후 전송
   *              - 신규 등록/수정 처리
   */
  onSubmit(): void {
    if (this.form.invalid) return

    const file: File | null = this.fileUpload.getFile()
    const imageRemoved: boolean = this.fileUpload.isImageRemoved()
    const data = this.existingData()

    const submitData = () => this.submitFormData(file)

    // 이미지 삭제가 필요한 경우
    if (data?.image && imageRemoved && !file) {
      this.fileService.deleteIBusinessInfoImage().subscribe({
        next: (res) => {
          this.toastr.success(res.message)
          this.existingData.update((prev) => (prev ? { ...prev, image: undefined } : null))
          this.fileUpload.removeFile()
          submitData()
        },
        error: (err) => {
          console.error('이미지 삭제 실패:', err)
          this.toastr.error('이미지 삭제에 실패했습니다.')
        }
      })
    } else {
      submitData()
    }
  }

  /**
   * @name submitFormData
   * @description 서버로 사업자 정보 전송
   * @param {File | null} file 업로드할 이미지 파일
   */
  private submitFormData(file: File | null): void {
    const formData = this.fileService.toFormData({ ...this.form.value, image: file })

    const action$: Observable<BusinessInfoResponseDto> = this.existingData()
      ? this.fileService.updateIBusinessInfo(formData)
      : this.fileService.createIBusinessInfo(formData)

    action$.subscribe({
      next: (res) => {
        this.toastr.success(this.existingData() ? '사업자 정보가 수정되었습니다!' : '사업자 정보가 등록되었습니다!')
        this.existingData.set(res)

        if (file && this.fileUpload) {
          this.fileUpload.setExistingFile({ name: file.name, url: URL.createObjectURL(file) })
        }

        this.loadBusinessInfo()
      },
      error: (err) => {
        console.error(this.existingData() ? '수정 실패:' : '등록 실패:', err)
        this.toastr.error(this.existingData() ? '사업자 정보 수정에 실패했습니다.' : '사업자 정보 등록에 실패했습니다.')
      }
    })
  }

  /**
   * @name onDelete
   * @description 사업자 정보 삭제
   *              - 확인 다이얼로그 사용
   *              - 삭제 성공 시 폼 초기화
   */
  async onDelete(): Promise<void> {
    const confirmed: boolean = await this.confirmDialog.confirm({
      title: '사업자 정보 삭제',
      description: '정말 삭제하시겠습니까?',
      confirmText: '삭제',
      cancelText: '취소',
      danger: true
    })

    if (!confirmed) return

    await lastValueFrom(this.apiService.businessInfoControllerDelete())
    this.toastr.success('삭제가 완료되었습니다.')
    this.existingData.set(null)
    this.form.reset()
    this.fileUpload.removeFile()
  }
}
