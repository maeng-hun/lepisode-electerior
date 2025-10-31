import { Logger, Module, OnModuleInit } from '@nestjs/common'
import { AdminRole, Prisma } from '@prisma/client'
import { hashSync } from 'bcrypt'
import { PrismaService } from '../prisma/prisma.service'
import { AdminController } from './admin.controller'
import { AdminService } from './admin.service'

@Module({
  controllers: [AdminController],
  providers: [AdminService]
})
export class AdminModule implements OnModuleInit {
  constructor(private readonly prismaService: PrismaService) {}

  async onModuleInit(): Promise<void> {
    await this.seedAdmin()
  }

  /**
   * @name seedAdmin
   * @description setting default admin account
   * @throws {Error} if default admin account is not set in environment variables
   * @returns {Promise<void>}
   */
  async seedAdmin(): Promise<void> {
    const email = process.env.DEFAULT_ADMIN_USERNAME
    const password = process.env.DEFAULT_ADMIN_PASSWORD
    const hashSalt = parseInt(process.env.HASH_SALT)

    if (!email || !password || !hashSalt) throw new Error('Default admin account is not set')

    const hashedPassword = hashSync(password, hashSalt)

    const defaultAdminCount = await this.prismaService.admin.count({
      where: { email }
    })

    const data: Prisma.AdminCreateInput = {
      email,
      password: hashedPassword,
      role: AdminRole.SUPER_ADMIN
    }

    if (defaultAdminCount) {
      await this.prismaService.admin.update({
        where: { email },
        data
      })

      Logger.log('✅ Default admin account already exists')
      return
    }

    await this.prismaService.admin.create({
      data
    })
    Logger.log('✅ Default admin account created')
    return
  }
}
