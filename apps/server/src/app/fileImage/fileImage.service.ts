import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { S3Service } from '../aws-s3/s3.service'

@Injectable()
export class FileImageService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3: S3Service
  ) {}

  // keyPrefix: 예) images/portfolio/{portfolioId}
  async uploadFileImage(opts: {
    file: Express.Multer.File
    keyPrefix: string
    connect?: { portfolioId?: string; partnerId?: string }
  }) {
    const { file, connect } = opts
    const prefix = opts.keyPrefix.endsWith('/') ? opts.keyPrefix : `${opts.keyPrefix}/`

    const uploaded = await this.s3.uploadToS3WithKeyPrefix(file, prefix)

    return this.prisma.file.create({
      data: {
        bucket: process.env.AWS_S3_BUCKET_NAME!,
        path: uploaded.key,
        url: uploaded.url,
        name: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
        ...(connect?.portfolioId && { Portfolio: { connect: { id: connect.portfolioId } } }),
        ...(connect?.partnerId && { Partner: { connect: { id: connect.partnerId } } })
      }
    })
  }

  // id 기준으로 이미지 삭제
  async deleteFileImage(fileId: string) {
    const f = await this.prisma.file.findUnique({ where: { id: fileId } })
    if (!f) return
    if (f.path) await this.s3.deleteFromS3(f.path)
    await this.prisma.file.delete({ where: { id: fileId } })
  }

  // 이미지만 삭제
  async deleteImage(key: string) {
    await this.s3.deleteFromS3(key)
  }
}
