import { BadRequestException, Injectable } from '@nestjs/common'
import { CreateAdminDto } from './dto/create-admin.dto'
import { loginDTO } from './dto/login.dto'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const admin = await this.prisma.admin.findUnique({
      where: {
        id
      }
    })

    if (!admin) {
      throw new BadRequestException('해당 관리자가 없습니다.')
    }

    return admin
  }

  auth(createAdminDto: CreateAdminDto) {
    return '회원가입 완료'
  }

  login(loginDTO: loginDTO) {
    return '로그인 완료'
  }
}
