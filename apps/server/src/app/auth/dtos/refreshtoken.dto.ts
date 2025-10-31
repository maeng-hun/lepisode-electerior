import { ApiProperty } from '@nestjs/swagger'
import { IsString, MinLength } from 'class-validator'

export class RefreshTokenDTO {
  @ApiProperty({
    description: '발급받은 Refresh 토큰(JWT)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....'
  })
  @IsString()
  @MinLength(10) // 토큰 최소 길이 가볍게 방어
  refreshToken!: string
}
