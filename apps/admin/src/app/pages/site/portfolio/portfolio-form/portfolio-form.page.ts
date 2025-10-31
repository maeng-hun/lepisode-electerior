import { CommonModule } from '@angular/common'
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { distinctUntilChanged, finalize, firstValueFrom, map } from 'rxjs'
import FileUploadComponent from 'apps/admin/src/app/components/file-upload/file-upload.component'
import { PortfolioService } from 'apps/admin/src/app/services/portfolio/portfolio.service'
import { IPortfolio, ToastService } from '@electerior/common'
import { EditorComponent } from 'apps/admin/src/app/components/editor/editor.component'
import { HttpClient } from '@angular/common/http'
import { environment } from 'apps/admin/src/environments/environment'
import { CreatePortfolioDto, FileDto, PortfoliosService } from '@api-client'
import { PortfolioControllerCreate$Params } from '@api-client/fn/portfolios/portfolio-controller-create'
import { PortfolioControllerUpdate$Params } from '@api-client/fn/portfolios/portfolio-controller-update'

@Component({
  selector: 'app-portfolio-form',
  standalone: true,
  imports: [CommonModule, FormsModule, FileUploadComponent, EditorComponent],
  templateUrl: './portfolio-form.page.html'
})
export default class PortfolioFormPage implements OnInit {
  private readonly portfolioService = inject(PortfolioService)
  private readonly portfoliosService = inject(PortfoliosService)

  private readonly baseUrl: string = `${environment.baseUrl}/portfolio`

  http = inject(HttpClient)
  toastr = inject(ToastService)
  route = inject(ActivatedRoute)
  router = inject(Router)

  portfolioId: string | null = null
  formData = { title: '', description: '' }
  mode: 'create' | 'edit' = 'create'
  loading = signal<boolean>(false)
  deleting = signal<boolean>(false)
  submitting = false

  uploadedFiles = signal<FileDto[]>([])

  ngOnInit(): void {
    this.loading.set(true)

    this.route.paramMap
      .pipe(
        map((pm) => pm.get('id')),
        distinctUntilChanged()
      )
      .subscribe((id) => {
        if (id) {
          this.mode = 'edit'
          this.portfolioId = id
          this.loadPortfolio(id)
        } else {
          this.mode = 'create'
          this.portfolioId = null
          this.resetForm()
          this.loading.set(false)
        }
      })
  }

  private resetForm(): void {
    this.formData = { title: '', description: '' }
  }

  private loadPortfolio(id: string): void {
    this.loading.set(true)
    this.portfolioService
      .findUnique(id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (p: IPortfolio) => {
          this.formData = {
            title: p.title ?? '',
            description: p.description ?? ''
          }
        },
        error: (err) => {
          this.toastr.error('포트폴리오 정보를 불러오지 못했습니다.')
          this.router.navigate(['/site/portfolio'])
        }
      })
  }

  async onSubmit() {
    const title = this.formData.title.trim()
    const description = this.formData.description.trim() || ''
    const imageUrls = this.uploadedFiles()?.map((i) => i.url) || []

    if (this.submitting || !title) return
    this.submitting = true

    const payload: CreatePortfolioDto = { title, description, imageUrls }

    if (!this.portfolioId) {
      this.portfoliosService
        .portfolioControllerCreate({
          body: payload
        } as PortfolioControllerCreate$Params)
        .subscribe({
          next: () => {
            this.toastr.success('포트폴리오가 등록되었습니다.')
          },
          error: (error) => {
            console.error(error)
            this.toastr.error('저장에 실패했습니다.')
          },
          complete: () => {
            this.router.navigate(['/site/portfolio'])
          }
        })
    } else {
      this.portfoliosService
        .portfolioControllerUpdate({
          id: this.portfolioId,
          body: payload
        } as PortfolioControllerUpdate$Params)
        .subscribe({
          next: () => {
            this.toastr.success('포트폴리오가 수정되었습니다.')
          },
          error: (error) => {
            console.error(error)
            this.toastr.error('저장에 실패했습니다.')
          },
          complete: () => {
            this.router.navigate(['/site/portfolio'])
          }
        })
    }
  }

  uploadImages(id: string, files: File | File[]) {
    const fd = new FormData()
    if (Array.isArray(files)) for (const f of files) fd.append('files', f)
    else fd.append('file', files)
    return this.http.post(`${this.baseUrl}/${id}/images`, fd)
  }
}
