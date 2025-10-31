import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger'
import { RecruitService } from './recruit.service'
import { JwtAuthGuard } from '../guards/jwt-auth.guard'
import { RolesGuard } from '../guards/roles.guard'
import { Roles } from '../guards/roles.decorator'
import { createJobDto } from './dtos/createjob.dto'
import { JobNoitceDTO } from './dtos/jobnotice.dto'
import { JobSearchDTO } from './dtos/jobnotic-esearch.dto'
import { JobNoticeResponseDTO } from './dtos/jobnoticeresponse.dto'

@ApiTags('Recruit')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('recruit')
export class RecruitController {
  constructor(private readonly recruitService: RecruitService) {}

  @Get()
  @ApiOperation({ summary: '검색/전체화면' })
  @ApiOkResponse({ type: JobNoticeResponseDTO }) // 이렇게 해야 자동 상속 완료
  async getNotices(@Query() search: JobSearchDTO): Promise<JobNoticeResponseDTO> {
    return this.recruitService.getNotices(search)
  }

  @Get(':id')
  @ApiOperation({ summary: '상세조회' })
  @ApiOkResponse({ type: JobNoitceDTO })
  async findOne(@Param('id') id: string): Promise<JobNoitceDTO> {
    return this.recruitService.findOne(id)
  }

  @Post('create')
  @ApiOperation({ summary: '채용 공고 등록' })
  async create(@Body() dto: createJobDto, @Req() req) {
    return this.recruitService.create(dto, req.user.sub) //sub가 admin.id
  }
}
