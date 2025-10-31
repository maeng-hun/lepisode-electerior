import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { createJobDto } from './dtos/createjob.dto'
import { JobNoitceDTO } from './dtos/jobnotice.dto'
import { JobSearchDTO } from './dtos/jobnotic-esearch.dto'
import { JobNoticeResponseDTO } from './dtos/jobnoticeresponse.dto'
import { Prisma } from '@prisma/client'

@Injectable()
export class RecruitService {
  constructor(private readonly prisma: PrismaService) {}

  async getNotices(search: JobSearchDTO): Promise<JobNoticeResponseDTO> {
    const { pageNo, pageSize, keyword } = search
    const skip = (pageNo - 1) * pageSize

    let where1: Prisma.JobOpeningWhereInput = {} //where 재사용 헷갈린다ㅏㅏㅏ
    if (keyword && keyword.trim() !== '') {
      where1 = {
        OR: [
          { title: { contains: keyword, mode: 'insensitive' } },
          { content: { contains: keyword, mode: 'insensitive' } }
        ]
      }
    } // db 접속 x
    const totalCount = await this.prisma.jobOpening.count({ where: where1 })

    const notices = await this.prisma.jobOpening.findMany({
      where: where1,
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      skip,
      take: pageSize,
      include: { admin: { select: { nickname: true } } }
    })

    const items: JobNoitceDTO[] = notices.map((notice, idx) => ({
      id: notice.id,
      title: notice.title,
      content: notice.content,
      isPinned: notice.isPinned,
      views: notice.views,
      createdAt: notice.createdAt,
      admin: notice.admin?.nickname || '(알수없음)',
      rowNumber: totalCount - skip - idx
    }))

    return { items, totalCount }
  }

  async findOne(id: string): Promise<JobNoitceDTO> {
    return
  }

  async create(dto: createJobDto, adminId: string) {
    const job = await this.prisma.jobOpening.create({
      data: {
        title: dto.title,
        content: dto.content,
        isPinned: dto.isPinned,
        adminId: adminId
      }
    })

    if (dto.image?.length) {
      await this.prisma.file.updateMany({
        where: { id: { in: dto.image } },
        data: { JobOpeningId: job.id }
      })
    }

    return await this.prisma.jobOpening.findUnique({
      where: { id: job.id },
      include: { images: true, admin: true }
    })
  }
}
