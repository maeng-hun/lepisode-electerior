import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from '../prisma/prisma.service'
import { SignUpDTO } from './dtos/signup.dto'
import { SignInDTO } from './dtos/signin.dto'
import { issueTokens } from './utils/token.util'
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService
  ) {}

  async tokenVerify(token: string) {
    try {
      const payload = this.jwt.verify<{ sub: string; email: string; role: string; nickname?: string }>(token)
      return payload
    } catch (err) {
      console.log(err)
      throw new UnauthorizedException('만료된 토큰입니다.')
    }
  }

  // 회원가입
  async signUp(signupDTO: SignUpDTO) {
    const { email, nickname } = signupDTO

    const emailExists = await this.prisma.admin.count({
      where: { email }
    })

    if (emailExists) throw new BadRequestException('이미 사용 중인 이메일입니다.')

    const nameExists = await this.prisma.admin.count({
      where: { nickname: signupDTO.nickname }
    })

    if (nameExists) {
      throw new BadRequestException('이미 사용 중인 닉네임입니다.')
    }

    const password = await bcrypt.hash(signupDTO.password, 12)

    const user = await this.prisma.admin.create({
      data: {
        email,
        nickname,
        password
      },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        nickname: true,
        createdAt: true
      }
    })

    return user
  }
  //로그인
  async signIn(signinDTO: SignInDTO) {
    const failLimit = Number(process.env.LOGIN_FAIL_LIMIT || 5)
    const user = await this.prisma.admin.findUnique({ where: { email: signinDTO.email } })

    if (!user) {
      await bcrypt.compare(signinDTO.password, process.env.DUMMY_HASH)
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.')
    }

    if (user.locked) {
      throw new UnauthorizedException('계정이 잠겼습니다. 관리자한테 문의하세요')
    }

    const isValid = await bcrypt.compare(signinDTO.password, user.password)

    if (!isValid) {
      const failcount = user.loginFailedCount + 1
      if (failcount >= failLimit) {
        await this.prisma.admin.update({
          where: { id: user.id },
          data: {
            locked: true,
            lockedAt: new Date(),
            lockedReason: `비밀번호 ${failLimit} 회 연속 실패`
          }
        })
      }
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.')
    }

    const admin = await this.prisma.admin.update({
      where: { id: user.id },
      data: { loginFailedCount: 0 },
      select: { id: true, email: true, role: true, nickname: true } //일단 임시 사용
    })

    const { accessToken, refreshToken } = await issueTokens(this.jwt, {
      sub: admin.id,
      email: admin.email,
      role: admin.role,
      nickname: admin.nickname
    }) //집에서 수정

    await this.prisma.admin.update({
      where: { id: admin.id },
      data: { refreshToken: await bcrypt.hash(refreshToken, 12) }
    })

    return { accessToken, refreshToken }
  }

  //verifyAsyn(검증할토큰,검증옵션): 토큰 유효 검사
  async refresh(refreshToken: string) {
    try {
      const payload = await this.jwt.verifyAsync(refreshToken, { secret: process.env.JWT_SECRET_KEY })
      if (!payload.isRefreshToken) {
        throw new UnauthorizedException('잘못된 리프레시 토큰')
      }

      const user = await this.prisma.admin.findUnique({ where: { id: payload.sub } })
      if (!user.refreshToken) {
        throw new UnauthorizedException('리프레시 토큰이 없습니다')
      }

      const match = await bcrypt.compare(refreshToken, user.refreshToken)
      if (!match) {
        throw new UnauthorizedException('리프레시 토큰이 일치하지 않습니다.')
      }

      const { accessToken: newAccess, refreshToken: newRefresh } = await issueTokens(this.jwt, {
        sub: user.id,
        email: user.email,
        role: user.role,
        nickname: user.nickname
      }) // 원래 this.issu..(user)

      await this.prisma.admin.update({
        where: { id: user.id },
        data: { refreshToken: await bcrypt.hash(newRefresh, 12) }
      })
      return { accessToken: newAccess, refreshToken: newRefresh }
    } catch (err) {
      console.log(err)
      throw new UnauthorizedException('리프레시 토큰이 유효하지 않습니다.')
    }
  }

  async logout(refreshToken?: string) {
    try {
      if (!refreshToken) {
        return true
      }

      const payload = await this.jwt.verifyAsync<{ sub: string }>(refreshToken, {
        secret: process.env.JWT_SECRET_KEY
      })

      const user = await this.prisma.admin.findUnique({ where: { id: payload.sub } })
      if (!user?.refreshToken) return { ok: true }

      const isMatched = await bcrypt.compare(refreshToken, user.refreshToken)
      if (isMatched) {
        await this.prisma.admin.update({
          where: { id: user.id },
          data: { refreshToken: null }
        })
      }
    } catch (err) {
      console.log(err)
    }
    return true
  }

  //   const updated = await this.prisma.admin.update({
  //     where: { id: userId },
  //     data: { refreshToken: null },
  //     select: { id: true, refreshToken: true }
  //   })
  //   console.log('로그아웃', updated.id, 'RT->', updated.refreshToken)
  //   return { ok: true } // ← 명시적 성공 바디
  // }
}
