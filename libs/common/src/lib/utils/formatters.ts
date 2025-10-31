/** 전화번호 하이픈 자동 추가 */
export function formatContactNumber(value: string): string {
  value = value.replace(/[^0-9]/g, '')
  if (value.length > 11) value = value.slice(0, 11)

  let formatted = value

  if (value.startsWith('02')) {
    if (value.length <= 2) formatted = value
    else if (value.length <= 5) formatted = `${value.substring(0, 2)}-${value.substring(2)}`
    else if (value.length <= 9) formatted = `${value.substring(0, 2)}-${value.substring(2, 5)}-${value.substring(5)}`
    else formatted = `${value.substring(0, 2)}-${value.substring(2, 6)}-${value.substring(6)}`
  } else {
    if (value.length <= 3) formatted = value
    else if (value.length <= 7) formatted = `${value.substring(0, 3)}-${value.substring(3)}`
    else if (value.length <= 10) formatted = `${value.substring(0, 3)}-${value.substring(3, 6)}-${value.substring(6)}`
    else formatted = `${value.substring(0, 3)}-${value.substring(3, 7)}-${value.substring(7)}`
  }

  return formatted
}

/** 사업자등록번호 하이픈 자동 추가 */
export function formatBusinessNumber(value: string): string {
  value = value.replace(/[^0-9]/g, '')

  if (value.length > 3 && value.length <= 5) value = value.replace(/(\d{3})(\d{1,2})/, '$1-$2')
  else if (value.length > 5) value = value.replace(/(\d{3})(\d{2})(\d{1,5})/, '$1-$2-$3')

  return value
}
