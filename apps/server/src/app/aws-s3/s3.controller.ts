import { Controller, Post, UploadedFiles, UseInterceptors, BadRequestException } from '@nestjs/common'
import { FilesInterceptor } from '@nestjs/platform-express'
import { S3Service, S3UploadResponse } from './s3.service'

@Controller('s3')
export class S3Controller {
  constructor(private readonly s3Service: S3Service) {}

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadFiles(@UploadedFiles() files: Express.Multer.File[]): Promise<S3UploadResponse[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('파일이 존재하지 않습니다.')
    }
    return Promise.all(files.map((file) => this.s3Service.uploadToS3(file)))
  }
}
