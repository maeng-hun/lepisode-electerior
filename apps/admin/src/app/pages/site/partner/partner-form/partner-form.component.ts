import { Component, EventEmitter, inject, Input, OnInit, output, Output, signal, ViewChild } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { FormsModule } from '@angular/forms'
import { CommonModule } from '@angular/common'
import { HttpClient } from '@angular/common/http'
import { IPartner } from '@electerior/common'
import ConfirmDialogComponent from 'apps/admin/src/app/components/confirm-dialog/confirm-dialog.component'
import FileUploadComponent from 'apps/admin/src/app/components/file-upload/file-upload.component'
import { ToastrService } from 'ngx-toastr'
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog'
import { firstValueFrom } from 'rxjs'
import { PartnerService } from 'apps/admin/src/app/services/partner/partner.service'
import { environment } from 'apps/admin/src/environments/environment'
@Component({
  selector: 'app-partner-form-component',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialogComponent, FileUploadComponent],
  templateUrl: './partner-form.component.html',
  host: { class: 'fixed inset-0 z-[1000] grid place-items-center' }
})
export default class PartnerFormComponent implements OnInit {
  private readonly router = inject(Router)
  private readonly route = inject(ActivatedRoute)
  private readonly http = inject(HttpClient)
  private readonly toastr = inject(ToastrService)
  private data = inject(DIALOG_DATA, { optional: true }) as { partner?: IPartner } | null
  public readonly dialogRef = inject(DialogRef<boolean | undefined>, { optional: true })

  @ViewChild(FileUploadComponent) fileUpload!: FileUploadComponent

  formData = { name: '', link: '', imageId: null as string | null }
  mode: 'create' | 'edit' = 'create'

  partnerService = inject(PartnerService)
  partnerId: string | null = null

  loading = signal<boolean>(false)
  submitting = signal<boolean>(false)
  deleting = signal<boolean>(false)
  confirmOpen = signal<boolean>(false)

  cancel = output<void>()
  saved = output<void>()

  ngOnInit(): void {
    const fromDialog = this.data?.partner
    if (fromDialog) {
      this.mode = 'edit'
      this.partnerId = fromDialog.id
      this.formData = {
        name: fromDialog.name ?? '',
        link: fromDialog.link ?? '',
        imageId: fromDialog.image?.id ?? null
      }
      queueMicrotask(() => {
        const img = fromDialog.image
        if (img && this.fileUpload) {
          this.fileUpload.setExistingFile({ name: img.name, url: img.url })
        }
      })
      return
    }
    const id = this.partnerId ?? this.route.snapshot.paramMap.get('id')
    if (id) {
      this.mode = 'edit'
      this.partnerId = id
      this.loadPartners(id)
    }
  }

  private loadPartners(id: string): void {
    this.loading.set(true)
    this.http.get<IPartner>(`${environment.baseUrl}/partner/${id}`).subscribe({
      next: (partner) => {
        // 기존 데이터 폼에 주입
        this.formData = {
          name: partner.name ?? '',
          link: partner.link ?? '',
          imageId: partner.image?.id ?? null
        }
        const img = partner.image
        setTimeout(() => {
          if (img && this.fileUpload) {
            this.fileUpload.setExistingFile({
              name: img.name,
              url: img.url
            })
          }
        })
        this.loading.set(false)
      },
      error: () => {
        // 로드 실패시 목록으로 돌아가기
        this.loading.set(false)
        this.router.navigate(['/site/partner'])
        this.toastr.error('협력사 정보를 불러오지 못했습니다.')
      }
    })
  }

  private async ensureImageId(): Promise<string | null | undefined> {
    if (this.fileUpload?.isImageRemoved()) return null

    const newFile = this.fileUpload?.getFile()
    console.log(newFile)
    if (!newFile) {
      if (this.mode === 'edit') return this.formData.imageId ?? undefined
      return undefined
    }

    const form = new FormData()
    form.append('file', newFile)
    form.append('bucket', 'partners')

    const created = await firstValueFrom(
      this.http.post<{ id: string; url: string }>(`${environment.baseUrl}/partner-form`, form)
    )

    console.debug(form, '<<<<')
    return created.id
  }

  async onSubmit() {
    if (!this.formData.name.trim()) return
    this.submitting.set(true)
    this.toastr.success('저장되었습니다!')

    try {
      const imageId = await this.ensureImageId()

      const payload: any = {
        name: this.formData.name.trim(),
        link: this.formData.link?.trim() || undefined
      }
      if (typeof imageId !== 'undefined') {
        payload.imageId = imageId // string | null
      }

      // edit 모드시 수정 기능
      if (this.mode === 'edit' && this.partnerId) {
        await firstValueFrom(this.http.patch(`${environment.baseUrl}/partner/${this.partnerId}`, payload))
        this.toastr.success('수정되었습니다!')
      } else {
        await firstValueFrom(this.http.post(`${environment.baseUrl}/partner`, payload))
      }

      console.debug(payload, '<<<payload')
      this.saved.emit()
      this.dialogRef?.close(true)
    } finally {
      this.submitting.set(false)
    }
  }

  handleDialogClose(reason: 'confirm' | 'cancel' | 'backdrop' | 'escape') {
    this.deleting.set(false)
    if (reason === 'confirm') {
      this.confirmDelete()
    } else {
      this.confirmOpen.set(false)
    }
  }

  async confirmDelete() {
    if (!this.partnerId) return
    this.deleting.set(true)
    try {
      await firstValueFrom(this.http.delete(`${environment.baseUrl}/partner/${this.partnerId}`))
      this.confirmOpen.set(false)
      this.router.navigate(['/site/partner'])
      this.saved.emit()
    } finally {
      this.deleting.set(false)
    }
  }
}
