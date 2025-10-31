import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common'
import * as AWS from 'aws-sdk'
import path from 'path'

export type S3UploadResponse = {
  key: string
  url: string
  contentType: string
  size: number
  s3Object: AWS.S3.PutObjectOutput
}

@Injectable()
export class S3Service {
  private readonly s3: AWS.S3
  private readonly logger = new Logger(S3Service.name)

  private readonly MAXIMUMSIZE_IMAGE_SIZE: number
  private readonly ACCEPTABLE_MIME_TYPES: string[]
  private readonly S3_BUCKET_NAME: string
  private readonly AWS_REGION: string

  constructor() {
    this.AWS_REGION = process.env.AWS_REGION!
    this.S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!

    this.s3 = new AWS.S3({
      region: this.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
      }
    })
    this.MAXIMUMSIZE_IMAGE_SIZE = 3_000_000
    this.ACCEPTABLE_MIME_TYPES = ['image/jpg', 'image/png', 'image/jpeg']
  }

  private validate(file: Express.Multer.File) {
    if (!this.ACCEPTABLE_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('이미지 파일 확장자는 jpg, png, jpeg만 가능합니다.')
    }
    if (file.size > this.MAXIMUMSIZE_IMAGE_SIZE) {
      throw new BadRequestException('업로드 가능한 이미지 최대 용량은 3MB입니다.')
    }
  }

  async uploadToS3(file: Express.Multer.File): Promise<S3UploadResponse> {
    return this.uploadToS3WithKeyPrefix(file, 'images/')
  }

  async uploadToS3WithKeyPrefix(file: Express.Multer.File, prefix: string): Promise<S3UploadResponse> {
    try {
      this.validate(file)

      const safePrefix = prefix.endsWith('/') ? prefix : `${prefix}/`
      const safeName = path.basename(file.originalname).replace(/\s+/g, '')
      const key = `${safePrefix}${Date.now()}_${safeName}`

      const s3Object = await this.s3
        .putObject({
          Bucket: this.S3_BUCKET_NAME,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype
        })
        .promise()

      const url = `https://${this.S3_BUCKET_NAME}.s3.${this.AWS_REGION}.amazonaws.com/${key}`

      return {
        key,
        s3Object,
        contentType: file.mimetype,
        url,
        size: file.size
      }
    } catch (error: any) {
      this.logger.error('S3 업로드 실패', error?.stack || error)
      throw new InternalServerErrorException('이미지를 업로드하는 중 오류가 발생했습니다.')
    }
  }

  async deleteFromS3(key: string): Promise<void> {
    try {
      await this.s3
        .deleteObject({
          Bucket: this.S3_BUCKET_NAME,
          Key: key
        })
        .promise()
    } catch (error: any) {
      this.logger.error(`S3 삭제 실패: ${key}`, error?.stack || error)
      throw new InternalServerErrorException('이미지를 삭제하는 중 오류가 발생했습니다.')
    }
  }
}
