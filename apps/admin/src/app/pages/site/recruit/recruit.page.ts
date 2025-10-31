import { Component, inject, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ReactiveFormsModule } from '@angular/forms'
import { Dialog } from '@angular/cdk/dialog'
import { SearchFormComponent } from '../../../components/search-form/search-form.component'
import RecruitFormComponent from './recruit-form/recruit-form.component'
import { RecruitService } from '@api-client'
import { MhpaginationComponent } from '../../../components/mhpagination/mhpagination.component'
import { rxResource } from '@angular/core/rxjs-interop'

@Component({
  selector: 'app-recruit-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SearchFormComponent, MhpaginationComponent],
  templateUrl: './recruit.page.html'
})
export default class RecruitPage {
  private readonly dialog = inject(Dialog)
  private readonly recruitService = inject(RecruitService)

  searchOption = signal({
    pageNo: 1,
    pageSize: 5,
    keyword: ''
  })

  openForm() {
    this.dialog
      .open(RecruitFormComponent, {
        width: '800px',
        height: '90vh',
        panelClass: 'custom-dialog-container',
        disableClose: true // 실수로 닫는 거 방지
      })
      .closed.subscribe(() => {
        this.$data.reload()
      })
  }

  jobSearch(keyword: string) {
    this.searchOption.set({
      ...this.searchOption(),
      pageNo: 1,
      keyword
    })
  }

  $data = rxResource({
    params: () => ({
      pageNo: this.searchOption().pageNo,
      pageSize: this.searchOption().pageSize,
      keyword: this.searchOption().keyword
    }),
    stream: ({ params }) => this.recruitService.recruitControllerGetNotices({ ...params })
  })
}
