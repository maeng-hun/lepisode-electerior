import { S3 } from '@aws-sdk/client-s3'
import { BadRequestException, Inject, Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common'
import { File } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { DeleteFileDTO, DeleteFilesDTO } from './dtos/delete.dto'
import { UploadFileDTO } from './dtos/upload.dto'
import { STORAGE_MODULE_CONFIG } from './storage.module.const'
import { StorageModuleConfig } from './storage.module.type'
import { url } from 'inspector'

@Injectable()
export class S3StorageService implements OnModuleInit {
  private readonly logger = new Logger(S3StorageService.name)

  constructor(
    @Inject(STORAGE_MODULE_CONFIG)
    private readonly options: StorageModuleConfig,
    private readonly prisma: PrismaService
  ) {}

  private s3Client = new S3({
    endpoint: this.options.endpoint,
    region: this.options.region,
    forcePathStyle: true,
    credentials: {
      accessKeyId: this.options.accessKey,
      secretAccessKey: this.options.secretKey
    }
  })

  onModuleInit() {
    this.init()
  }

  private async init() {
    const bucketExists = await this.s3Client
      .headBucket({ Bucket: this.options.bucketName })
      .then(() => true)
      .catch(() => false)

    if (!bucketExists) {
      await this.s3Client.createBucket({ Bucket: this.options.bucketName })

      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: '*',
            Action: 's3:GetObject',
            Resource: `arn:aws:s3:::${this.options.bucketName}/*`
          }
        ]
      }

      await this.s3Client.putBucketPolicy({
        Bucket: this.options.bucketName,
        Policy: JSON.stringify(policy)
      })
    }

    this.logger.log('Storage module initialized successfully.')
  }

  async findById(id: string) {
    const file = await this.prisma.file.findUnique({ where: { id } })
    if (!file) throw new NotFoundException('파일을 찾을 수 없습니다.')
    return file
  }

  async findByUrl(url: string) {
    const file = await this.prisma.file.findFirst({ where: { url } })
    if (!file) throw new NotFoundException('파일을 찾을 수 없습니다.')
    return file
  }

  async upload(data: UploadFileDTO): Promise<File> {
    const { container, file } = data

    const key = `${container}/${Date.now()}_${Buffer.from(file.originalname, 'latin1').toString('utf-8')}`

    await this.s3Client.putObject({
      Bucket: this.options.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read'
    })

    const fileUrl = `${this.options.endpoint}/${this.options.bucketName}/${key}`

    return this.prisma.file.create({
      data: {
        name: key,
        url: fileUrl,
        size: file.size,
        mimeType: file.mimetype
      }
    })
  }

  async uploadMany(files: Express.Multer.File[]): Promise<File[]> {
    return Promise.all(
      files.map(async (file) => {
        const key = `${Date.now()}_${Buffer.from(file.originalname, 'latin1').toString('utf-8')}`

        await this.s3Client.putObject({
          Bucket: this.options.bucketName,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
          ACL: 'public-read'
        })

        const fileUrl = `${this.options.endpoint}/${this.options.bucketName}/${key}`

        this.logger.log(`aws url들갔노?: ${file.originalname} → ${fileUrl}`)

        return this.prisma.file.create({
          data: {
            name: key,
            url: fileUrl,
            size: file.size,
            mimeType: file.mimetype
          }
        })
      })
    )
  }

  async delete(data: DeleteFileDTO): Promise<File> {
    const file = await this.prisma.file.findFirst({ where: { url: data.url } })
    if (!file) throw new NotFoundException('파일을 찾을 수 없습니다.')

    try {
      const filePath = file.url.split(this.options.endpoint)[1]

      await this.s3Client.deleteObject({
        Bucket: this.options.bucketName,
        Key: filePath
      })

      return this.prisma.file.delete({ where: { id: file.id } })
    } catch (error) {
      throw new BadRequestException('파일 삭제에 실패했습니다.', error)
    }
  }

  async deleteMany(data: DeleteFilesDTO) {
    const files = await this.prisma.file.findMany({ where: { url: { in: data.urls } } })
    if (files.length === 0) throw new NotFoundException('파일을 찾을 수 없습니다.')

    await Promise.all(
      files.map(async (file) => {
        const filePath = file.url.split(this.options.endpoint)[1]
        await this.s3Client.deleteObject({
          Bucket: this.options.bucketName,
          Key: filePath
        })
      })
    )

    return this.prisma.file.deleteMany({ where: { url: { in: data.urls } } })
  }
}
