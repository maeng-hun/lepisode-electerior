import { inject, Injectable } from '@angular/core'
import { RecruitService as RecruitServiceApi } from '@api-client'

export interface RecruitDto {
  id?: string
  title: string
  content?: string
  name?: string
  image?: string[]
  isPinned: boolean
}

@Injectable({ providedIn: 'root' })
export class RecruitService {
  private readonly api = inject(RecruitServiceApi)

  create(dto: RecruitDto) {
    return this.api.recruitControllerCreate({ body: dto })
  }
}
