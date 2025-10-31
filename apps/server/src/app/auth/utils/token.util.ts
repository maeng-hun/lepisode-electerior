import { JwtService } from '@nestjs/jwt'
import { JwtPayload, JwtRefreshPayload } from '../types/jwtpayload.type'
// 토큰 발급용
interface UserForToken {
  sub: string
  email: string
  role: string
  nickname?: string
}

export async function issueTokens(jwt: JwtService, user: UserForToken) {
  const base: JwtPayload = {
    sub: user.sub,
    email: user.email,
    role: user.role,
    nickname: user.nickname
  }
  const accessTtl = (process.env.ADMIN_ACCESS_TOKEN_EXPIRES_IN || '1d').trim()
  const refreshTtl = (process.env.ADMIN_REFRESH_TOKEN_EXPIRES_IN || '7d').trim()
  const secret = process.env.JWT_SECRET_KEY

  const accessToken = await jwt.signAsync(base, { secret, expiresIn: accessTtl })

  const refreshPayload: JwtRefreshPayload = {
    ...base,
    isRefreshToken: true
  }

  const refreshToken = await jwt.signAsync(refreshPayload, {
    secret,
    expiresIn: refreshTtl
  })

  return { accessToken, refreshToken }
}
