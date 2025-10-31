import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common'
import { AdminService } from './admin.service'

import { ApiTags } from '@nestjs/swagger'

import { plainToInstance } from 'class-transformer'
import { AdminDTO } from './dto/admin.dto'

@Controller('admin')
@ApiTags('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get(':id')
  async findById(@Param('id') id: string) {
    return plainToInstance(AdminDTO, await this.adminService.findById(id))
  }
}
