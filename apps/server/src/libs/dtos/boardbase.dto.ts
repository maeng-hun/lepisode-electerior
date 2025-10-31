import { IsBoolean, IsNotEmpty } from 'class-validator'

export class BoardBaseDTO {
  id?: string
  @IsNotEmpty({ message: '제목은 필수 입력 항목입니다.' })
  title: string
  @IsNotEmpty({ message: '내용은 필수 입력 항목입니다.' })
  content?: string
  image?: string | string[]
  @IsBoolean()
  isPinned: boolean
}
