import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common'
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { AuthService } from './auth.service'
import { SignUpDTO } from './dtos/signup.dto'
import { SignInDTO } from './dtos/signin.dto'
import { JwtAuthGuard } from '../guards/jwt-auth.guard'
import { RolesGuard } from '../guards/roles.guard'
import { AccessToken } from 'aws-sdk/clients/amplify'

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: Request & { user: any }) {
    return req.user
  }
  
  @Post('signup')
  @ApiOperation({
    summary: '회원가입',
    description: '회원가입을 진행하기 위한 코드입니다.'
  })
  signup(@Body() singupDTO: SignUpDTO) {
    return this.authService.signUp(singupDTO)
  }

  @Post('signin')
  @ApiOperation({ summary: '로그인' })
  @ApiOkResponse({
    description: '로그인 성공',
    schema: {
      example: {
        accessToken: 'jwt-token',
        refreshToken: 'refresh-tokne'
      }
    }
  })
  @UseGuards(RolesGuard)
  signin(@Body() signinDTO: SignInDTO): Promise<{ accessToken: string; refreshToken: string }> {
    return this.authService.signIn(signinDTO)
  }

  @Post('refresh')
  @ApiOperation({ summary: '토큰 재발급' })
  refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refresh(refreshToken)
  }

  @Post('logout')
  @ApiOperation({ summary: '로그아웃' })
  logout(@Body('refreshToken') refreshToken?: string) {
    return this.authService.logout(refreshToken)
  }
}
