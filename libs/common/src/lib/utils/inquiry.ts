export function getInquiryTypeLabel(type?: 'PRODUCT' | 'APP' | 'ETC' | null): string {
  switch (type) {
    case 'PRODUCT':
      return '제품 문의'
    case 'APP':
      return '앱/개발 문의'
    case 'ETC':
      return '기타 문의'
    default:
      return type ?? ''
  }
}
