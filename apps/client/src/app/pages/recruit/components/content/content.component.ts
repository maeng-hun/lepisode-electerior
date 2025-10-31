import { CommonModule } from '@angular/common'
import { Component, inject } from '@angular/core'
import { ActivatedRoute } from '@angular/router'

type JobId = 'office' | 'marketing' | 'solution'

interface RecruitDetailCopy {
  // 상단 그라디언트(히어로) 영역 텍스트
  hero: {
    title: string // 예) "IT 솔루션 B2B 영업 담당자 모집"
    subtitle?: string // 예) "현직자와 함께하는 B2B 영업 직무 3개월 인턴"
  }
  // 본문 상단 큰 헤드라인(강조 단어 분리)
  headline: {
    prefix: string // 예) "고객 문제 해결에 가치를 더할 "
    highlight?: string // 예) "인재"
    suffix?: string // 예) "를 찾습니다"
  }
  // 소개 문단(여러 줄)
  intros: string[]
  // 반복 섹션: [담당 업무], [우대 사항], [근무 환경 및 복지] 등
  sections: Array<{
    heading: string // 섹션 제목(대괄호 포함 그대로 작성)
    items: string[] // 불릿 리스트
  }>
  // 지원 방법 블록
  apply: {
    heading?: string // 기본: "[ 지원방법 ]"
    intro: string // 안내문 한 단락
    email: string // 메일 주소 (HTML에선 &#64;로 출력)
    buttonLabel?: string // 버튼/배지 라벨이 필요하면 사용
  }
}
const COPIES: Record<JobId, RecruitDetailCopy> = {
  solution: {
    hero: {
      title: 'IT 솔루션 B2B 영업 담당자 모집',
      subtitle: '현직자와 함께하는 B2B 영업 직무 3개월 인턴'
    },
    headline: {
      prefix: '고객 문제 해결에 가치를 더할 ',
      highlight: '인재',
      suffix: '를 찾습니다'
    },
    intros: [
      '급변하는 디지털 환경 속에서, 기업의 경쟁력을 높이는 건 최적의 솔루션입니다. <br /> 당사는 다양한 산업군에 특화된 IT 솔루션을 제공하며 빠르게 성장하고 있습니다.',
      '우리는 단순한 판매를 넘어, 고객의 문제를 해결하는 파트너가 되고자 합니다. <br /> 고객의 니즈를 정확히 이해하고, 맞춤형 제안을 이끌어낼 수 있는 분을 기다립니다.',
      '이 자리는 솔루션에 대한 깊은 이해뿐 아니라, 상황을 설계하고 설득하는 역량이 요구됩니다. <br /> 경험을 기반으로 고객과의 신뢰를 쌓고, 장기적인 관계를 구축하고 싶은 분이라면 더욱 환영합니다.',
      '비즈니스의 핵심에서 전략적으로 움직이고 싶은 당신, 지금 도전하세요. <br /> 고객과 회사, 그리고 본인의 성장을 함께 만들어갈 수 있는 기회를 놓치지 마세요.'
    ],
    sections: [
      {
        heading: '[ 담당 업무 ]',
        items: [
          '기업 고객 대상 자사 IT 솔루션(B2B SaaS, ERP, CRM 등) 영업',
          '신규 고객사 발굴 및 기존 고객사 관계 관리',
          '고객 요구사항 분석 및 맞춤형 제안서 작성',
          '제품 데모 및 제안 발표 진행',
          '계약 체결 및 사후 관리(업그레이드/리뉴얼 제안 등)',
          '시장 및 경쟁사 분석, 솔루션 판매 전략 수립'
        ]
      },
      {
        heading: '[ 우대 사항 ]',
        items: [
          'SaaS, ERP, CRM, 보안 솔루션 등 관련 제품 영업 경험',
          '스타트업 및 IT 기술 환경에 대한 높은 이해도',
          '프레젠테이션 능력, 기술 세일즈 경험 보유자'
        ]
      },
      {
        heading: '[ 근무 환경 및 복지 ]',
        items: [
          '유연근무제 / 원격근무 일부 가능',
          '분기별 인센티브 및 성과급 지급',
          '자기계발비 및 도서비 지원',
          '팀 런치 / 오픈오피스의 자유로운 회의문화',
          '점심 제공 및 간식/커피 무제한'
        ]
      }
    ],
    apply: {
      heading: '[ 지원방법 ]',
      intro:
        '해당 포지션에 지원을 희망하시는 분은 이력서 및 자기소개서(또는 경력기술서)를 아래 이메일로 보내주시기 바랍니다.',
      email: 'Electerior@company.com',
      buttonLabel: '이메일로 지원'
    }
  },
  // TODO: 실제 문구로 교체
  office: {
    hero: { title: '사무보조', subtitle: '문서/회계/전화/일정 관리' },
    headline: { prefix: '팀의 효율을 높일 꼼꼼한 ', highlight: '인재', suffix: '를 찾습니다' },
    intros: ['문서/회계 정리, 전화응대, 일정관리 보조 등 전반 업무를 맡습니다.'],
    sections: [
      { heading: '[ 담당 업무 ]', items: ['문서 작성/정리', '전화 응대 및 기록', '회의/일정 준비 지원'] },
      { heading: '[ 근무 환경 및 복지 ]', items: ['점심 지원', '사내 카페 이용'] }
    ],
    apply: {
      heading: '[ 지원방법 ]',
      intro: '이메일로 이력서/자기소개서를 보내주세요.',
      email: 'Electerior@company.com'
    }
  },
  // TODO: 실제 문구로 교체
  marketing: {
    hero: { title: '마케팅', subtitle: '디자인 · 블로그 · 홈페이지 관리' },
    headline: { prefix: '브랜드 스토리를 확장할 ', highlight: '마케터', suffix: '를 찾습니다' },
    intros: ['콘텐츠 기획/제작과 채널 운영, 성과 분석을 담당합니다.'],
    sections: [
      { heading: '[ 담당 업무 ]', items: ['콘텐츠 기획·제작', '블로그·SNS 운영', '웹사이트 운영/분석'] },
      { heading: '[ 우대 사항 ]', items: ['포토샵/프리미어 사용', '데이터 기반 의사결정'] }
    ],
    apply: {
      heading: '[ 지원방법 ]',
      intro: '이메일로 이력서/포트폴리오를 보내주세요.',
      email: 'jobs@electerior.com'
    }
  }
}
@Component({
  selector: 'app-content',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './content.component.html'
})
export default class ContentComponent {
  // /recruit/:id -> id 값 가져오기
  id = inject(ActivatedRoute).snapshot.paramMap.get('id') ?? ''

  copy = COPIES[this.id as JobId]
}
