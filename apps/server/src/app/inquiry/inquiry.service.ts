import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateInquiryDTO } from './dtos/create-inquiry.dto'
import { UpdateInquiryDTO } from './dtos/update-inquiry.dto'
import { File, Inquiry, Prisma } from '@prisma/client'
import { S3StorageService } from '../storage/storage.service'

/**
 * @class InquiryService
 * @description 문의 관리 서비스
 *              - CRUD
 *              - 이미지 업로드
 *              - 상태(isPending) 관리
 */
@Injectable()
export class InquiryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: S3StorageService
  ) {}

  /** 전체 문의 조회 */
  async findAll(): Promise<(Inquiry & { images?: File[] })[]> {
    return this.prisma.inquiry.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: Prisma.SortOrder.desc },
      include: { images: true }
    })
  }

  /** 단일 문의 조회 */
  async findOne(id: string): Promise<Inquiry & { images?: File[] }> {
    const inquiry = await this.prisma.inquiry.findFirst({ where: { id, deletedAt: null }, include: { images: true } })
    if (!inquiry) throw new NotFoundException('해당 문의를 찾을 수 없습니다.')
    return inquiry
  }

  /** 문의 생성 */
  async create(data: CreateInquiryDTO, files?: Express.Multer.File[]): Promise<boolean> {
    let imagesConnect: Prisma.FileCreateNestedManyWithoutInquiryInput | undefined

    if (files && files.length) {
      const fileRecords = await Promise.all(files.map((file) => this.saveImage(file)))
      imagesConnect = { connect: fileRecords.map((f) => ({ id: f.id })) }
    }

    await this.prisma.inquiry.create({
      data: {
        isPending: true,
        name: data.name,
        email: data.email,
        contact: data.contact,
        content: data.content,
        type: data.type ?? null,
        productType: data.productType ?? null,
        companyName: data.companyName ?? null,
        availableTime: data.availableTime ?? null,
        ...(imagesConnect && { images: imagesConnect })
      }
    })

    return true
  }

  private async saveImage(file: Express.Multer.File, folder = 'inquiry'): Promise<File> {
    const uploadResult = await this.storage.upload({ container: folder, file }) // S3 업로드
    return this.prisma.file.create({
      data: {
        url: uploadResult.url,
        name: file.originalname,
        size: file.size,
        mimeType: file.mimetype
      }
    })
  }

  /**
   * @method updateStatus
   * @description 문의 상태(isPending) 업데이트
   * @param {string} id 문의 ID
   * @param {UpdateInquiryDTO} dto 상태 DTO
   * @returns {Promise<boolean>} 상태 변경 성공 여부
   */
  async updateStatus(id: string, dto: UpdateInquiryDTO): Promise<boolean> {
    await this.findOne(id)
    await this.prisma.inquiry.update({
      where: { id },
      data: { isPending: dto.isPending }
    })
    return true
  }

  /** 문의 삭제 */
  async remove(id: string): Promise<boolean> {
    const inquiry = await this.prisma.inquiry.findFirst({
      where: { id, deletedAt: null }
    })
    if (!inquiry) throw new NotFoundException('삭제할 문의를 찾을 수 없습니다.')

    await this.prisma.inquiry.update({
      where: { id },
      data: { deletedAt: new Date() }
    })

    return true
  }
}
