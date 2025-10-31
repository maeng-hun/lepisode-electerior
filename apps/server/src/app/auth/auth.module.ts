import { Module } from '@nestjs/common'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { PassportModule } from '@nestjs/passport' // npm i @nestjs/passport @nestjs/jwt passport passport-jwt, npm i -D @types/passport-jwt 인스톨
import { JwtStrategy } from './strategies/jwt.strategy'

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  exports: [PassportModule]
})
export class AuthModule {}
