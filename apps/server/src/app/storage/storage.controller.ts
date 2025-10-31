import { Body, Controller, Delete, Param, Post, UploadedFiles, UseInterceptors } from '@nestjs/common'
import { FilesInterceptor } from '@nestjs/platform-express'
import {
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags
} from '@nestjs/swagger'
import { plainToInstance } from 'class-transformer'
import { DeleteFilesDTO } from './dtos/delete.dto'
import { FileDTO } from './dtos/file.dto'
import { S3StorageService } from './storage.service'

@ApiTags('Storage')
@Controller('storage')
export class S3StorageController {
  constructor(private readonly storageService: S3StorageService) {}

  @Post()
  @ApiOperation({
    summary: '파일 업로드',
    description: '파일을 업로드합니다'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary'
          }
        }
      }
    }
  })
  @ApiCreatedResponse({
    type: FileDTO,
    isArray: true,
    description: '업로드된 파일 정보'
  })
  @UseInterceptors(FilesInterceptor('files'))
  async uploadFiles(@UploadedFiles() files: Array<Express.Multer.File>) {
    const uploadedFiles = await this.storageService.uploadMany(files)

    return plainToInstance(FileDTO, uploadedFiles)
  }

  @Delete(':url')
  @ApiOperation({
    summary: '파일 삭제',
    description: '파일을 삭제합니다.'
  })
  @ApiParam({
    name: 'url',
    description: '파일 URL'
  })
  @ApiOkResponse({
    type: FileDTO,
    description: '삭제된 파일 정보'
  })
  deleteFile(@Param('url') url: string) {
    return this.storageService.delete({
      url
    })
  }

  @Delete()
  @ApiOperation({
    summary: '여러 파일 삭제',
    description: '여러 파일을 삭제합니다.'
  })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        count: { type: 'number' }
      }
    },
    description: '삭제된 파일 개수'
  })
  deleteMany(@Body() body: DeleteFilesDTO) {
    return this.storageService.deleteMany(body)
  }
}
