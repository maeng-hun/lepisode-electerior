import { Injectable, NotFoundException } from '@nestjs/common'
import { File, Prisma, Product } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { CreateProductDTO } from './dtos/create-product.dto'
import { UpdateProductDTO } from './dtos/update-product.dto'
import { S3StorageService } from '../storage/storage.service'

/**
 * @class ProductService
 * @description 제품 정보 관리 서비스
 *              - CRUD
 *              - 이미지 업로드/삭제 처리
 *              - 순서(order) 관리
 */
@Injectable()
export class ProductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: S3StorageService
  ) {}

  /**
   * @method findAll
   * @description 모든 제품 조회, 이미지 포함
   * @returns {Promise<(Product & { image?: File | null })[]>} 제품 리스트
   */
  async findAll(): Promise<(Product & { image?: File | null })[]> {
    return await this.prisma.product.findMany({
      where: { deletedAt: null },
      orderBy: { order: Prisma.SortOrder.desc },
      include: { image: true }
    })
  }

  /**
   * @method findOne
   * @description 단일 제품 조회
   * @param {string} id 제품 ID
   * @returns {Promise<Product & { image?: File | null }>} 제품 정보
   * @throws {NotFoundException} 제품이 존재하지 않을 경우
   */
  async findOne(id: string): Promise<Product & { image?: File | null }> {
    const product = await this.prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: { image: true }
    })
    if (!product) throw new NotFoundException('해당 제품을 찾을 수 없습니다.')
    return product
  }

  /**
   * @method create
   * @description 제품 생성 및 이미지 업로드
   *              - order 자동 증가
   * @param {CreateProductDTO} data 제품 정보 DTO
   * @param {Express.Multer.File} [file] 업로드할 이미지 파일
   * @returns {Promise<boolean>} 생성 성공 여부
   */
  async create(data: CreateProductDTO, file?: Express.Multer.File): Promise<boolean> {
    let imageConnect: Prisma.FileCreateNestedOneWithoutBusinessInfoInput | undefined
    if (file) {
      const fileRecord = await this.saveImage(file)
      imageConnect = { connect: { id: fileRecord.id } }
    }

    const maxOrder = await this.prisma.product.aggregate({ _max: { order: true } })
    const nextOrder = (maxOrder._max.order ?? 0) + 1

    await this.prisma.product.create({
      data: {
        productType: data.productType,
        description: data.description,
        isExposed: data.isExposed,
        price: data.price ?? null,
        link: data.link ?? null,
        order: nextOrder,
        ...(imageConnect && { image: imageConnect })
      }
    })
    return true
  }

  /**
   * @method update
   * @description 기존 제품 수정 및 이미지 변경
   *              - 기존 이미지 삭제 후 새 이미지 연결
   * @param {string} id 제품 ID
   * @param {UpdateProductDTO} data 수정할 정보 DTO
   * @param {Express.Multer.File} [file] 새 이미지 파일
   * @returns {Promise<boolean>} 수정 성공 여부
   */
  async update(id: string, data: UpdateProductDTO, file?: Express.Multer.File): Promise<boolean> {
    const existingProduct = await this.findOne(id)

    let imageConnect: Prisma.FileCreateNestedOneWithoutBusinessInfoInput | undefined
    if (file) {
      if (existingProduct.image) {
        try {
          await this.storage.delete({ url: existingProduct.image.url })
          await this.prisma.file.delete({ where: { id: existingProduct.image.id } })
        } catch (error) {
          console.warn('기존 이미지 삭제 중 오류 발생:', error)
        }
      }
      const fileRecord = await this.saveImage(file)
      imageConnect = { connect: { id: fileRecord.id } }
    }

    await this.prisma.product.update({
      where: { id },
      data: {
        productType: data.productType,
        description: data.description,
        isExposed: data.isExposed,
        price: data.price ?? null,
        link: data.link ?? null,
        ...(imageConnect && { image: imageConnect })
      }
    })
    return true
  }

  /**
   * @method remove
   * @description 제품 삭제 및 이미지 삭제
   * @param {string} id 제품 ID
   * @returns {Promise<boolean>} 삭제 성공 여부
   */
  async remove(id: string): Promise<boolean> {
    const product = await this.findOne(id)

    if (product.image) {
      try {
        await this.storage.delete({ url: product.image.url })
      } catch (error) {
        console.warn('이미지 삭제 오류:', error)
      }
      await this.prisma.file.delete({ where: { id: product.image.id } })
    }

    await this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() }
    })
    return true
  }

  /**
   * @method removeImage
   * @description 제품 이미지 단독 삭제
   *              - DB와 스토리지 모두 제거
   * @param {string} productId 제품 ID
   * @returns {Promise<boolean>} 삭제 성공 여부
   */
  async removeImage(productId: string): Promise<boolean> {
    const product = await this.findOne(productId)
    if (!product.image) return true

    try {
      await this.storage.delete({ url: product.image.url })
    } catch (error) {
      console.warn('이미지 삭제 오류:', error)
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: productId },
        data: { imageId: null }
      })
      await tx.file.delete({ where: { id: product.image.id } })
    })

    return true
  }

  /** 제품 순서 업데이트 */
  async updateOrders(orders: { id: string; order: number }[]): Promise<boolean> {
    await this.prisma.$transaction(
      orders.map((o) =>
        this.prisma.product.update({
          where: { id: o.id },
          data: { order: o.order }
        })
      )
    )
    return true
  }

  /** 이미지 저장 헬퍼 - S3 기반 */
  private async saveImage(file: Express.Multer.File, folder = 'products'): Promise<File> {
    const uploadResult = await this.storage.upload({ container: folder, file })

    return this.prisma.file.create({
      data: {
        url: uploadResult.url,
        name: file.originalname,
        size: file.size,
        mimeType: file.mimetype
      }
    })
  }
}
