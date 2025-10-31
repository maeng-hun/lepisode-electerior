export interface Recruit {
  title: string
  content: string
  day: Date
  pinned?: boolean
}

export const RECRUITS: Recruit[] = [
  {
    title: '사무보조',
    content: '회계 · 문서작성 · 전화응대 · 일정관리',
    day: new Date(),
    pinned: true
  },
  { title: '마케팅', content: '디자인 · 블로그 · 홈페이지 관리', day: new Date() },
  { title: '솔루션 영업', content: '공공기관 · 대기업 · B2B 영업', day: new Date() },
  { title: '사무보조', content: '회계 · 문서작성 · 전화응대 · 일정관리', day: new Date() },
  { title: '마케팅', content: '디자인 · 블로그 · 홈페이지 관리', day: new Date() },
  { title: '사무보조', content: '회계 · 문서작성 · 전화응대 · 일정관리', day: new Date(), pinned: true },
  { title: '마케팅', content: '디자인 · 블로그 · 홈페이지 관리', day: new Date() },
  { title: '솔루션 영업', content: '공공기관 · 대기업 · B2B 영업', day: new Date() },
  { title: '사무보조', content: '회계 · 문서작성 · 전화응대 · 일정관리', day: new Date() },
  { title: '마케팅', content: '디자인 · 블로그 · 홈페이지 관리', day: new Date() },
  { title: '솔루션 영업', content: '공공기관 · 대기업 · B2B 영업', day: new Date() },
  { title: '솔루션 영업', content: '공공기관 · 대기업 · B2B 영업', day: new Date() },
  { title: '솔루션 영업', content: '공공기관 · 대기업 · B2B 영업', day: new Date() },
  { title: '솔루션 영업', content: '공공기관 · 대기업 · B2B 영업', day: new Date() },
  { title: '솔루션 영업', content: '공공기관 · 대기업 · B2B 영업', day: new Date() },
  { title: '솔루션 영업', content: '공공기관 · 대기업 · B2B 영업', day: new Date() }
]
