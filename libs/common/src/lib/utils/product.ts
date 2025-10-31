export function getProductTypeLabel(
  productType?: 'GPU_SERVER' | 'MOBILE_APP' | 'WEB_APP_MAINT' | 'CLOUD_INFRA' | 'TECH_CONSULT' | null
): string {
  switch (productType) {
    case 'GPU_SERVER':
      return 'GPU 서버 구축'
    case 'MOBILE_APP':
      return '모바일 앱 개발'
    case 'WEB_APP_MAINT':
      return '웹/앱 유지보수'
    case 'CLOUD_INFRA':
      return '클라우드 인프라'
    case 'TECH_CONSULT':
      return '기술 컨설팅'
    default:
      return productType ?? ''
  }
}
