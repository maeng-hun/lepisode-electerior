export type JwtPayload = {
  sub: string
  email: string
  role: string
  nickname?: string
}

export type JwtRefreshPayload = JwtPayload & {
  isRefreshToken: true
}
