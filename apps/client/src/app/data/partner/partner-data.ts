import { IStepItem } from '../../../types/interfaces/partner.interface'

export const STEPS_ITEMS: IStepItem[] = [
  {
    step: 1,
    type: 'Plan',
    title: '기획',
    icon: '/assets/partner/paper.svg',
    list: ['요구사항 정의서', '기능정의서', '과업내역서', 'IA(Information Architecture)', '스토리보드', '와이어프레임'],
    className: 'gradient-bg-1'
  },
  {
    step: 2,
    type: 'Design',
    title: '디자인',
    icon: '/assets/partner/tool.svg',
    list: ['웹, 앱 디자인', 'UI / UX 디자인', '홈페이지 디자인', '웹 포스터', 'SNS 카드', '브랜딩, CI / BI'],
    className: 'gradient-bg-2'
  },
  {
    step: 3,
    type: 'Development',
    title: '개발',
    icon: '/assets/partner/computer.svg',
    list: ['홈페이지, 모바일 앱 개발', 'DB설계', 'RPA(Robotic Process Automation)', 'QA', '유지보수', '인프라 셋팅'],
    className: 'gradient-bg-3'
  }
]
