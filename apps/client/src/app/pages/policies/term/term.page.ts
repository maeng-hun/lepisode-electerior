import { CommonModule } from '@angular/common'
import { Component } from '@angular/core'
import { title } from 'process'

interface termsSection {
  id: string
  title: string
  subTitle?: string
  list?: string[]
}
const common_defs: string[] = [
  '1. 회원 : 사이트의 약관에 동의하고 개인정보를 제공하여 회원등록을 한 자로서, 사이트와의 이용계약을 체결하고 사이트를 이용하는 이용자를 말합니다.',
  '2. 이용계약 : 사이트 이용과 관련하여 사이트와 회원간에 체결 하는 계약을 말합니다.',
  '3. 회원 아이디(이하 "ID") : 회원의 식별과 회원의 서비스 이용을 위하여 회원별로 부여하는 고유한 문자와 숫자의 조합을 말합니다 ',
  '4. 비밀번호 : 회원이 부여받은 ID와 일치된 회원임을 확인하고 회원의 권익 보호를 위하여 회원이 선정한 문자와 숫자의 조합을 말합니다.',
  '5. 운영자 : 서비스에 홈페이지를 개설하여 운영하는 운영자를 말합니다  ',
  '6. 해지 : 회원이 이용계약을 해약하는 것을 말합니다.'
]
@Component({
  selector: 'app-term',
  imports: [CommonModule],
  templateUrl: './term.page.html'
})
export default class TermPage {
  sections: termsSection[] = [
    {
      id: 'no-2',
      title: '제2조 용어의 정의',
      subTitle: '본 약관에서 사용되는 주요한 용어의 정의는 다음과 같습니다.',
      list: common_defs
    },
    {
      id: 'no-3',
      title: '제3조 약관 외 준칙',
      subTitle: '본 약관에서 사용되는 주요한 용어의 정의는 다음과 같습니다.',
      list: common_defs
    },
    {
      id: 'no-4',
      title: '제4조 이용계약 체결',
      subTitle: '본 약관에서 사용되는 주요한 용어의 정의는 다음과 같습니다.',
      list: common_defs
    }
  ]
}
