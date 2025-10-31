import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateBusinessInfoDTO } from './dtos/create-business-info.dto'
import { UpdateBusinessInfoDTO } from './dtos/update-business-info.dto'
import { BusinessInfo, File, Prisma } from '@prisma/client'
import { S3StorageService } from '../storage/storage.service'

/**
 * @class BusinessInfoService
 * @description 사업자 정보 및 관련 이미지 관리 서비스
 *              - Prisma를 이용한 DB CRUD
 *              - 이미지 업로드/삭제 처리
 */
@Injectable()
export class BusinessInfoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: S3StorageService
  ) {}

  /**
   * @method find
   * @description DB에서 사업자 정보 조회 (첫 번째 레코드)
   * @returns {Promise<(BusinessInfo & { image?: File | null }) | null>} 사업자 정보 + 이미지 포함
   */
  async find(): Promise<(BusinessInfo & { image?: File | null }) | null> {
    return this.prisma.businessInfo.findFirst({ where: { deletedAt: null }, include: { image: true } })
  }

  private async saveImage(file: Express.Multer.File, folder = 'business-info'): Promise<File> {
    const uploadResult = await this.storage.upload({ file, container: folder })
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
   * @method create
   * @description 사업자 정보 생성 및 선택적 이미지 업로드 처리
   * @param {CreateBusinessInfoDTO} data 생성할 사업자 정보 DTO
   * @param {Express.Multer.File} [file] 업로드할 이미지 파일
   * @returns {Promise<BusinessInfo & { image?: File | null }>} 생성된 사업자 정보 + 이미지
   */
  async create(data: CreateBusinessInfoDTO, file?: Express.Multer.File): Promise<boolean> {
    try {
      let imageConnect: Prisma.FileCreateNestedOneWithoutBusinessInfoInput | undefined

      if (file) {
        const fileRecord = await this.saveImage(file)
        imageConnect = { connect: { id: fileRecord.id } }
      }

      await this.prisma.businessInfo.create({
        data: {
          companyName: data.companyName,
          ceoName: data.ceoName,
          address: data.address,
          contactNumber: data.contactNumber,
          email: data.email,
          businessNumber: data.businessNumber,
          ...(imageConnect && { image: imageConnect })
        }
      })
      return true
    } catch (error) {
      if (file) {
        try {
          const uploadResult = await this.storage.upload({ file, container: 'business-info' })
          await this.storage.delete({ url: uploadResult.url })
        } catch (cleanupError) {
          console.warn('이미지 정리 실패:', cleanupError)
        }
      }
      throw error
    }
  }

  /**
   * @method update
   * @description 기존 사업자 정보 수정 및 이미지 변경
   *              - 기존 이미지가 있으면 삭제 후 새 이미지 연결
   * @param {UpdateBusinessInfoDTO} data 수정할 정보 DTO
   * @param {Express.Multer.File} [file] 새 이미지 파일
   * @returns {Promise<BusinessInfo & { image?: File | null }>} 업데이트된 사업자 정보 + 이미지
   * @throws {Error} 업데이트할 사업자 정보가 없을 경우
   */
  async update(data: UpdateBusinessInfoDTO, file?: Express.Multer.File): Promise<boolean> {
    const info = await this.prisma.businessInfo.findFirst({
      where: { deletedAt: null },
      include: { image: true }
    })

    if (!info) {
      throw new Error('업데이트할 사업자 정보가 없습니다.')
    }

    let imageConnect: Prisma.FileCreateNestedOneWithoutBusinessInfoInput | undefined

    if (file) {
      // 새 이미지 업로드
      const fileRecord = await this.saveImage(file)
      imageConnect = { connect: { id: fileRecord.id } }

      // 기존 이미지 삭제 (새 이미지 업로드 성공 후)
      if (info.image) {
        try {
          await this.storage.delete({ url: info.image.url })
          await this.prisma.file.delete({ where: { id: info.image.id } })
        } catch (error) {
          console.warn('기존 이미지 삭제 중 오류 발생:', error)
          // 삭제 실패해도 업데이트는 계속 진행
        }
      }
    }

    try {
      // 사업자 정보 업데이트
      await this.prisma.businessInfo.update({
        where: { id: info.id },
        data: {
          companyName: data.companyName,
          ceoName: data.ceoName,
          address: data.address,
          contactNumber: data.contactNumber,
          email: data.email,
          businessNumber: data.businessNumber,
          ...(imageConnect && { image: imageConnect })
        }
      })
      return true
    } catch (error) {
      // DB 업데이트 실패 시 새로 업로드한 이미지 정리
      if (file && imageConnect) {
        try {
          const uploadResult = await this.storage.upload({ file, container: 'business-info' })
          await this.storage.delete({ url: uploadResult.url })
        } catch (cleanupError) {
          console.warn('새 이미지 정리 실패:', cleanupError)
        }
      }
      throw error
    }
  }

  /**
   * @method remove
   * @description 사업자 정보 삭제
   *              - 연결된 이미지 삭제 포함
   * @returns {Promise<boolean>} 삭제 성공 여부
   * @throws {Error} 삭제할 사업자 정보가 없을 경우
   */
  async remove(): Promise<boolean> {
    const info = await this.prisma.businessInfo.findFirst({
      where: { deletedAt: null },
      include: { image: true }
    })

    if (!info) {
      throw new Error('삭제할 사업자 정보가 없습니다.')
    }

    try {
      // 트랜잭션으로 처리
      await this.prisma.$transaction(async (tx) => {
        // 사업자 정보 soft delete
        await tx.businessInfo.update({
          where: { id: info.id },
          data: { deletedAt: new Date() }
        })

        // 이미지 파일 삭제
        if (info.image) {
          await tx.file.delete({ where: { id: info.image.id } })
        }
      })

      // DB 삭제 성공 후 S3에서 이미지 삭제
      if (info.image) {
        try {
          await this.storage.delete({ url: info.image.url })
        } catch (err) {
          console.warn('S3 이미지 삭제 오류:', err)
          // S3 삭제 실패해도 DB는 이미 삭제되었으므로 성공 처리
        }
      }

      return true
    } catch (error) {
      console.error('사업자 정보 삭제 실패:', error)
      throw error
    }
  }

  /**
   * @method removeImage
   * @description 사업자 이미지 단독 삭제
   *              - DB와 스토리지 모두에서 제거
   * @returns {Promise<{ message: string }>} 삭제 결과 메시지
   */
  async removeImage(): Promise<{ message: string }> {
    const info = await this.prisma.businessInfo.findFirst({
      where: { deletedAt: null },
      include: { image: true }
    })

    if (!info || !info.image) {
      return { message: '삭제할 이미지가 없습니다.' }
    }

    const file = info.image

    try {
      // 트랜잭션으로 DB 작업 처리
      await this.prisma.$transaction(async (tx) => {
        // 사업자 정보에서 이미지 연결 해제
        await tx.businessInfo.update({
          where: { id: info.id },
          data: { imageId: null }
        })

        await tx.file.delete({ where: { id: file.id } })
      })

      // DB 삭제 성공 후 S3에서 이미지 삭제
      try {
        await this.storage.delete({ url: file.url })
      } catch (err) {
        console.warn('S3 이미지 삭제 오류:', err)
        // S3 삭제 실패해도 DB는 이미 정리되었으므로 성공 처리
      }

      return { message: '이미지가 삭제되었습니다.' }
    } catch (error) {
      console.error('이미지 삭제 실패:', error)
      throw new Error('이미지 삭제 중 오류가 발생했습니다.')
    }
  }
}
