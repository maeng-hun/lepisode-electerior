import { IsEmail, IsNotEmpty, MinLength } from 'class-validator'

export class AuthBaseDTO {
  @IsNotEmpty({ message: '이메일은 필수 입력 항목입니다.' })
  @IsEmail()
  email: string
  @IsNotEmpty({ message: '비밀번호는 필수 입력 항목입니다.' })
  @MinLength(6)
  password: string
}
