import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreatePartnerDTO } from './dtos/create-partner.dto'
import { UpdatePartnerDTO } from './dtos/update-partner.dto'
import { Partner, File, Prisma } from '@prisma/client'
import { IStorageProvider } from '../../types/interfaces/storage.interface'

@Injectable()
export class PartnerService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('IStorageProvider') private readonly storage: IStorageProvider
  ) {}

  // DB에 저장
  private async savePartnerImage(file: Express.Multer.File, folder = 'partners'): Promise<File> {
    const { url, path } = await this.storage.upload(file, folder)
    return this.prisma.file.create({
      data: {
        bucket: 'images',
        path,
        url,
        name: file.originalname,
        size: file.size,
        mimeType: file.mimetype
      }
    })
  }

  async findMany(params: {
    search?: string
    page: number
    limit: number
    orderBy?: keyof typeof Prisma.PartnerScalarFieldEnum
    order?: keyof typeof Prisma.SortOrder
  }) {
    const { search, page = 1, limit = 10 } = params

    const take = Math.min(100, Math.max(1, limit | 0))
    const query = search?.trim()
    const where = query
      ? {
          name: { contains: query, mode: Prisma.QueryMode.insensitive }
        }
      : undefined

    const total = await this.prisma.partner.count({ where })
    const totalPages = Math.max(1, Math.ceil(total / take))
    const savePage = Math.min(totalPages, Math.max(1, page | 0))
    const skip = (savePage - 1) * take

    const data = await this.prisma.partner.findMany({
      where,
      include: { image: true },
      skip,
      take
    })

    const from = total === 0 ? 0 : skip + 1
    const to = skip + data.length
    return {
      data,
      meta: {
        total,
        page: savePage,
        limit: take,
        totalPages,
        hasPrev: savePage > 1,
        hasNext: savePage < totalPages,
        from,
        to
      }
    }
  }

  /** 협력사 불러오기 */
  async findUnique(id: string): Promise<(Partner & { image?: File | null }) | null> {
    const partner = await this.prisma.partner.findUnique({
      where: { id },
      include: { image: true }
    })
    if (!partner) throw new NotFoundException('Partner not found')
    return this.prisma.partner.findFirst({ include: { image: true } })
  }

  async create(dto: CreatePartnerDTO, file?: Express.Multer.File): Promise<boolean> {
    const imageId = dto.imageId

    if (imageId) {
      const exists = await this.prisma.file.findUnique({ where: { id: imageId }, select: { id: true } })
      if (!exists) throw new BadRequestException('존재하지 않는 파일 id가 포함되어 있습니다.')
      const used = await this.prisma.partner.findFirst({ where: { imageId } })
      if (used) throw new BadRequestException('이미 연결된 파일이 포함되어 있습니다.')
    }

    let imageConnect: { connect: { id: string } } | undefined
    if (file) {
      const saved = await this.savePartnerImage(file, 'partners')
      imageConnect = { connect: { id: saved.id } }
    } else if (imageId) {
      imageConnect = { connect: { id: imageId } }
    }

    await this.prisma.partner.create({
      data: {
        name: dto.name,
        link: dto.link,
        ...(imageConnect ? { image: imageConnect } : {})
      },
      include: { image: true }
    })

    return true
  }

  // 수정
  async update(id: string, dto: UpdatePartnerDTO, file?: Express.Multer.File): Promise<Partner> {
    const existing = await this.findUnique(id)

    // 기존 이미지 삭제 후 새 파일 연결
    if (file) {
      if (existing.imageId) {
        try {
          await this.storage.delete(existing.image.bucket, existing.image.path)
          await this.prisma.file.delete({ where: { id: existing.image.id } })
        } catch {}
      }
      const saved = await this.savePartnerImage(file, 'partners')
      return this.prisma.partner.update({
        where: { id },
        data: { name: dto.name, link: dto.link, image: { connect: { id: saved.id } } },
        include: { image: true }
      })
    }

    // imageId가 아예 안 온 경우(이미지 변경 없음)
    if (typeof dto.imageId === 'undefined') {
      return this.prisma.partner.update({
        where: { id },
        data: { name: dto.name, link: dto.link },
        include: { image: true }
      })
    }

    // 이미지 제거(null)
    if (dto.imageId === null) {
      return this.prisma.partner.update({
        where: { id },
        data: { name: dto.name, link: dto.link, image: { disconnect: true } },
        include: { image: true }
      })
    }

    // 이미지 교체(string)
    if (existing.imageId === dto.imageId) {
      return this.prisma.partner.update({
        where: { id },
        data: { name: dto.name, link: dto.link },
        include: { image: true }
      })
    }

    return this.prisma.partner.update({
      where: { id },
      data: { name: dto.name, link: dto.link, image: { connect: { id: dto.imageId } } },
      include: { image: true }
    })
  }

  // 삭제
  async delete(id: string) {
    await this.prisma.partner.delete({ where: { id } })
    return true
  }
}
