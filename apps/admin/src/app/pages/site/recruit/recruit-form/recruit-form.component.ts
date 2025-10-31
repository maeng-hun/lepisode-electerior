import { DialogRef } from '@angular/cdk/dialog'
import { CommonModule } from '@angular/common'
import { Component, inject, OnInit } from '@angular/core'
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { BaseFormComponent } from '../../../../components/common/base-form.component'
import { EditorComponent } from '../../../../components/editor/editor.component'
import MultifileUploadComponent from '../../../../components/multifile-upload/multifile-upload.component'
import { RecruitDto, RecruitService } from '../../../../services/boards/recruit/recruit.service'
import { StorageService } from '@api-client'
import { map, switchMap } from 'rxjs'

@Component({
  selector: 'app-recruit-form',
  templateUrl: './recruit-form.component.html',
  imports: [ReactiveFormsModule, CommonModule, EditorComponent, MultifileUploadComponent]
})
export default class RecruitFormComponent extends BaseFormComponent implements OnInit {
  private dialogRef = inject(DialogRef<boolean>)
  protected override fb = inject(FormBuilder)
  private readonly recruitService = inject(RecruitService)
  private readonly s3StorageService = inject(StorageService)

  constructor() {
    super(inject(FormBuilder))
  }

  jobForm = this.fb.group({
    isPinned: this.fb.nonNullable.control(false),
    title: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]),
    content: this.fb.nonNullable.control('', [
      Validators.required,
      Validators.minLength(10),
      Validators.maxLength(500)
    ]),
    image: this.fb.control<string[] | null>(null)
  })

  override closeWithDraft(result: boolean): void {
    const { image, ...rest } = this.jobForm.value // file만 제외하고 나머지 추출
    this.saveDraft('jobForm', rest) // file 빠진 값만 저장
    this.dialogRef.close(result)
  }
  override closeClear(result: boolean): void {
    this.clearDraft('jobForm')
    this.dialogRef.close(result)
  }
  // 이거 신기하네
  ngOnInit() {
    const draft = this.loadDraft<any>('jobForm')
    if (draft) {
      this.jobForm.patchValue(draft)
    }
  }

  selectedFiles: File[] = []

  submit() {
    if (this.jobForm.invalid) return
    const formData = new FormData()
    for (const file of this.selectedFiles) {
      formData.append('files', file)
    }
    this.s3StorageService
      .s3StorageControllerUploadFiles({
        body: { files: this.selectedFiles }
      })
      .pipe(
        map((uploaded) => uploaded.map((f) => f.url)), // 또는 f.id
        switchMap((urls) => {
          const recruit: RecruitDto = {
            ...this.jobForm.getRawValue(),
            image: urls
          }
          return this.recruitService.create(recruit)
        })
      )
      .subscribe({
        next: () => {
          console.log('등록 성공')
          this.dialogRef.close(true)
        },
        error: (err) => console.error('실패', err)
      })
  }
}
