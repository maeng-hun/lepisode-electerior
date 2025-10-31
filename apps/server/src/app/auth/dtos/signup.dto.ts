import { AuthBaseDTO } from '../../../libs/dtos/authbase.dto'
import { IsNotEmpty, MinLength, minLength } from 'class-validator'

export class SignUpDTO extends AuthBaseDTO {
  @IsNotEmpty({ message: '닉네임은 필수 입력 항목입니다.' })
  @MinLength(2)
  nickname?: string
}
