import { Injectable, NotFoundException } from '@nestjs/common'
import { CreatePortfolioDTO } from './dtos/create-portfolio.dto'
import { UpdatePortfolioDTO } from './dtos/update-portfolio.dto'
import { PrismaService } from '../prisma/prisma.service'
import { Portfolio, Prisma, File } from '@prisma/client'
import { S3StorageService } from '../storage/storage.service'

/**
 * @class PortfolioService
 * @description 포트폴리오 정보 관리 서비스
 *              - CRUD
 *              - 이미지 업로드/삭제 처리
 *              - 순서(order) 관리
 */
@Injectable()
export class PortfolioService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: S3StorageService
  ) {}

  /**
   * @method findMany
   * @description 모든 포트폴리오 조회, 이미지 포함
   * @returns {Promise<(Portfolio & { images?: File[] })[]>} 포트폴리오 목록
   */
  async findMany(params: { search?: string }): Promise<(Portfolio & { images?: File[] | null })[]> {
    const query = params.search?.trim()
    const where: Prisma.PortfolioWhereInput = {
      deletedAt: null,
      ...(query ? { OR: [{ title: { contains: query } }, { description: { contains: query } }] } : {})
    }
    return await this.prisma.portfolio.findMany({
      where,
      orderBy: { order: Prisma.SortOrder.desc },
      include: { images: true }
    })
  }

  /**
   * @method findUnique
   * @description 단일 포트폴리오 조회
   * @param {string} id 포트폴리오 ID
   * @returns {Promise<Portfolio & { images: File[] | null }>} 포트폴리오 정보
   * @throws {NotFoundException} 포트폴리오가 존재하지 않을 경우
   */
  async findUnique(id: string): Promise<Portfolio & { images?: File[] | null }> {
    const portfolio = await this.prisma.portfolio.findFirst({
      where: { id, deletedAt: null },
      include: { images: true }
    })
    if (!portfolio) throw new NotFoundException('Portfolio not found')
    return portfolio
  }

  /**
   * @method create
   * @description 포트폴리오 생성, 파일 업로드
   * @param {CreatePortfolioDTO} data 포트폴리오 정보 DTO
   * @returns {Promise<boolean>} 성공 여부
   */
  async create(dto: CreatePortfolioDTO): Promise<boolean> {
    let imagesConnect: Prisma.FileCreateNestedManyWithoutPortfolioInput | undefined

    const maxOrder = await this.prisma.portfolio.aggregate({ _max: { order: true } })
    const nextOrder = (maxOrder._max.order ?? 0) + 1

    const created = await this.prisma.portfolio.create({
      data: {
        title: dto.title,
        description: dto.description ?? null,
        order: nextOrder,
        ...(imagesConnect && { images: imagesConnect })
      }
    })

    await Promise.all(
      dto?.imageUrls?.map(
        async (url) =>
          await this.prisma.file.update({
            where: {
              url
            },
            data: {
              Portfolio: {
                connect: {
                  id: created.id
                }
              }
            }
          })
      )
    )

    return true
  }

  /**
   * @method update
   * @description 기존 포트폴리오 수정 및 이미지 변경
   *              - 기존 이미지 삭제 후 새 이미지 연결
   * @param {string} id 포트폴리오 ID
   * @param {UpdatePortfolioDTO} data 수정할 정보 DTO
   * @returns {Promise<boolean>} 수정 성공 여부
   */
  async update(id: string, dto: UpdatePortfolioDTO): Promise<boolean> {
    const updated = await this.prisma.portfolio.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description ?? null
      }
    })

    await Promise.all(
      dto?.imageUrls?.map(
        async (url) =>
          await this.prisma.file.update({
            where: {
              url
            },
            data: {
              Portfolio: {
                connect: {
                  id: updated.id
                }
              }
            }
          })
      )
    )
    return true
  }

  /**
   * @method incrementViews
   * @description 포트폴리오 조회수
   * @param {string} id 포트폴리오 ID
   * @returns {Promise<boolean>} 조회수 증가 성공 여부
   */
  async incrementViews(id: string): Promise<boolean> {
    const exists = await this.prisma.portfolio.findUnique({ where: { id } })
    if (!exists) throw new NotFoundException('Portfolio not found')

    await this.prisma.portfolio.update({
      where: { id },
      data: { views: { increment: 1 } }
    })
    return true
  }

  /**
   * @method update
   * @description 포트폴리오 순서 변경
   * @param {string} id 포트폴리오 ID
   * @returns {Promise<boolean>} 성공 여부
   */
  async updateOrders(orders: { id: string; order: number }[]): Promise<boolean> {
    await this.prisma.$transaction(
      orders.map((o) =>
        this.prisma.portfolio.update({
          where: { id: o.id },
          data: { order: o.order }
        })
      )
    )
    return true
  }

  /**
   * @method delete
   * @description 포트폴리오 삭제
   * @param {string} portfolioId 포트폴리오 ID, 스토리지 삭제
   * @returns {Promise<boolean>} 삭제 성공 여부
   */
  async delete(portfolioId: string): Promise<boolean> {
    const portfolio = await this.findUnique(portfolioId)
    const images = portfolio.images ?? []

    await Promise.all(images.map((img) => this.storage.delete({ url: img.url }).catch(() => {})))

    await this.prisma.$transaction([
      this.prisma.file.deleteMany({ where: { PortfolioId: portfolioId } }),
      this.prisma.portfolio.delete({ where: { id: portfolioId } })
    ])
    return true
  }

  /**
   * @method deleteImage
   * @description 포트폴리오 이미지 단독 삭제
   *              - DB와 스토리지 모두 제거, 연결된 이미지 제거
   * @param {string} portfolioid 포트폴리오 ID
   * @returns {Promise<boolean>} 삭제 성공 여부
   */
  async deleteImage(portfolioId: string): Promise<boolean> {
    const portfolio = await this.findUnique(portfolioId)
    const images = portfolio.images ?? []
    if (!images.length) return true

    await Promise.all(images.map((img) => this.storage.delete({ url: img.url }).catch(() => {})))
    await this.prisma.file.deleteMany({ where: { PortfolioId: portfolioId } })

    await this.prisma.portfolio.update({
      where: { id: portfolioId },
      data: { images: { set: [] } }
    })
    return true
  }

  /** 이미지 저장 헬퍼 - S3 기반 */
  private async saveImage(files: Express.Multer.File[], folder = 'portfolios'): Promise<File[]> {
    const uploaded: File[] = []
    for (const f of files) {
      const fileRecord = await this.storage.upload({ container: folder, file: f })
      uploaded.push(fileRecord)
    }
    return uploaded
  }
}
