import { Component, inject, OnInit, ViewChild } from '@angular/core'
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { ProductService } from '../../../../../services/product/product.service'
import { DialogRef } from '@angular/cdk/dialog'
import FileUploadComponent from '../../../../../components/file-upload/file-upload.component'
import { CommonModule } from '@angular/common'
import { ToastService } from '@electerior/common'
import { CreateProductDto, ProductResponseDto } from '@api-client'

/**
 * @name ProductFormComponent
 * @description 제품 생성/수정 폼 컴포넌트
 *              - FormGroup 기반 폼
 *              - 파일 업로드(FileUploadComponent) 포함
 *              - 기존 이미지 삭제/교체 처리
 */
@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [FileUploadComponent, ReactiveFormsModule, CommonModule],
  templateUrl: './product-form.component.html'
})
export default class ProductFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder)
  private readonly productService = inject(ProductService)
  private readonly dialogRef = inject(DialogRef<boolean | undefined>)
  private readonly toastr = inject(ToastService)

  @ViewChild(FileUploadComponent) fileUpload!: FileUploadComponent

  /** 수정할 제품 정보 (없으면 신규 생성) */
  item: ProductResponseDto | undefined = this.dialogRef.config.data?.item

  form: FormGroup = this.fb.group({
    productType: ['', Validators.required],
    description: ['', [Validators.required, Validators.maxLength(100)]],
    isExposed: [false],
    price: [null, [Validators.required, Validators.maxLength(10), Validators.min(0)]],
    link: [null, [Validators.maxLength(50)]]
  })

  /** 초기 데이터 설정 (수정 모드 시 폼 채우기) */
  ngOnInit(): void {
    if (this.item) {
      this.form.patchValue({
        productType: this.item.productType,
        description: this.item.description,
        isExposed: this.item.isExposed,
        price: this.item.price ?? null,
        link: this.item.link ?? null
      })

      if (this.item?.image) {
        const img = this.item.image
        setTimeout(() => {
          this.fileUpload.setExistingFile({
            name: img.name,
            url: img.url
          })
        })
      }
    }
  }

  onSubmit() {
    if (this.form.invalid) return

    const file = this.fileUpload.getFile()
    const imageRemoved = this.fileUpload.isImageRemoved()

    if (this.item && this.item.image && imageRemoved && !file) {
      // 기존 이미지가 있고, 제거되었으며, 새 파일이 없는 경우
      this.productService.deleteProductImage(this.item.id as string).subscribe({
        next: () => {
          this.submitFormData(file)
        },
        error: (error) => {
          console.error('이미지 삭제 실패:', error)
          this.toastr.error('이미지 삭제에 실패했습니다.')
        }
      })
    } else {
      this.submitFormData(file)
    }
  }

  /**
   * @name submitFormData
   * @description 제품 데이터 서버 전송 (생성 또는 수정)
   * @param {File | null} file 업로드할 이미지 파일
   */
  private submitFormData(file: File | null) {
    const data: CreateProductDto = {
      ...this.form.value,
      image: file
    }

    if (this.item?.id) {
      // 제품 수정
      this.productService.updateProduct(this.item.id, data).subscribe({
        next: () => {
          this.toastr.success('수정되었습니다!')
          this.dialogRef.close(true)
        },
        error: (error) => {
          console.error('수정 실패:', error)
          this.toastr.error('수정에 실패했습니다.')
        }
      })
    } else {
      // 제품 생성
      this.productService.createProduct(data).subscribe({
        next: () => {
          this.toastr.success('저장되었습니다!')
          this.dialogRef.close(true)
        },
        error: (error) => {
          console.error('저장 실패:', error)
          this.toastr.error('저장에 실패했습니다.')
        }
      })
    }
  }

  onCancel() {
    this.dialogRef.close()
  }
}
