import { Component, inject, input, OnInit, signal, ViewChild } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import PrivacyConsentComponent from '../privacy-consent/privacy-consent.component'
import InquiryTypeComponent from '../inquiry-type/inquiry-type.component'
import InquiryInputComponent from '../inquiry-input/inquiry-input.component'
import { DialogRef } from '@angular/cdk/dialog'
import { firstValueFrom } from 'rxjs'
import InquiryService from '../../../../../../services/inquiry/inquiry.service'
import { ToastService } from '@electerior/common'
import { EditorComponent } from '../../../../../../components/editor/editor.component'
import ProductTypeComponent from '../product-type/product-type.component'
import FileUploadComponent from '../../../../../../components/file-upload/file-upload.component'
import type { CreateInquiryDto } from '@api-client'
import { InquiryType, ProductType } from '../../../../../../../types/types/label.type'

/**
 * @name InquiryFormComponent
 * @description 문의 등록 폼 컴포넌트
 *              - 사용자 입력 폼 관리(FormGroup)
 *              - 파일 업로드(FileUploadComponent) 포함
 *              - 문의 유형(InquiryType) 및 제품 유형(ProductType) 선택
 *              - 개인정보 동의 체크 관리
 *              - 서버로 문의 생성 요청
 */
@Component({
  selector: 'app-inquiry-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PrivacyConsentComponent,
    InquiryTypeComponent,
    InquiryInputComponent,
    EditorComponent,
    FileUploadComponent,
    ProductTypeComponent
  ],
  templateUrl: './inquiry-form.component.html'
})
export default class InquiryFormComponent implements OnInit {
  private readonly dialogRef = inject<DialogRef | null>(DialogRef, { optional: true })
  private readonly inquiryService = inject<InquiryService>(InquiryService)
  private readonly toastr = inject<ToastService>(ToastService)

  selectedType = signal<InquiryType>('PRODUCT')
  selectedProductType = signal<ProductType | undefined>(undefined)
  showProductType = signal<boolean>(false)
  isPrivacyConsentGiven = signal<boolean>(false)

  productType = input<ProductType | undefined>()

  @ViewChild(FileUploadComponent) fileUpload!: FileUploadComponent

  ngOnInit() {
    const pt = this.productType?.()
    this.showProductType.set(Boolean(pt))
    if (pt) this.selectedProductType.set(pt)
  }

  form = new FormGroup({
    name: new FormControl('', { validators: [Validators.required] }),
    tel: new FormControl('', {
      validators: [
        Validators.required,
        Validators.pattern(/^(?:02-\d{3}-\d{4}|02-\d{4}-\d{4}|0\d{2}-\d{3}-\d{4}|0\d{2}-\d{4}-\d{4})$/)
      ]
    }),
    email: new FormControl('', { validators: [Validators.required, Validators.email] }),
    time: new FormControl(''),
    company: new FormControl(''),
    content: new FormControl('', { validators: [Validators.required, Validators.minLength(2)] })
  })

  onPrivacyConsentChange(consent: boolean): void {
    this.isPrivacyConsentGiven.set(consent)
  }

  /**
   * @name onSubmit
   * @description 폼 제출
   *              - FormGroup 값 검증
   *              - 파일 업로드 데이터 포함
   *              - 서버에 CreateInquiryDTO 전송
   *              - 성공 시 폼 초기화 및 dialog close
   */
  async onSubmit(): Promise<void> {
    const { name, email, tel, content, company, time } = this.form.getRawValue()

    const uploadFiles: File[] = this.fileUpload.getSelectedFiles()

    const newInquiry: CreateInquiryDto = {
      name: name as string,
      email: email as string,
      contact: tel as string,
      content: content as string,
      type: this.selectedType(),
      productType: this.selectedProductType(),
      companyName: company || undefined,
      availableTime: time || undefined,
      images: undefined
    }

    try {
      const res = await firstValueFrom(this.inquiryService.createInquiry(newInquiry, uploadFiles))

      this.toastr.success('문의가 정상적으로 등록되었습니다!')

      this.form.reset()
      this.fileUpload.removeAllFiles()
      this.isPrivacyConsentGiven.set(false)
      this.selectedType.set('PRODUCT')

      if (this.dialogRef) {
        this.dialogRef.close(res)
      }
    } catch (err) {
      console.error(err)
      this.toastr.error('문의 등록 중 오류가 발생했습니다.')
    }
  }
}
