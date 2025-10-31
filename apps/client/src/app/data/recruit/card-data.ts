export interface Card {
  id: string
  image: string
  title: string
  description: string
}

export const RECRUIT_CARDS: Card[] = [
  { id: 'office', title: '사무보조', description: '가벼운 사무보조 회계', image: '/assets/recruitment/re_samu.png' },
  {
    id: 'marketing',
    title: '마케팅',
    description: '디자인 · 블로그 · 홈페이지 관리',
    image: '/assets/recruitment/re_marke.png'
  },
  {
    id: 'solution',
    title: '솔루션 영업',
    description: '공공기기관, 대기업 대상 B2B 영업',
    image: '/assets/recruitment/re_sol.png'
  }
]
