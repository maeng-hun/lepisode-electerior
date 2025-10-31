import { Injectable, signal } from '@angular/core'

/**
 * @name MenuStateService
 * @description 애플리케이션 메뉴 상태 관리 서비스.
 *              부모/자식 메뉴 라벨을 관리하고 전체 메뉴 경로를 반환합니다.
 */
@Injectable({
  providedIn: 'root'
})
export class MenuStateService {
  /** 현재 부모 메뉴 라벨 */
  readonly parentLabel = signal<string>('대시보드')

  /** 현재 자식 메뉴 라벨 */
  readonly childLabel = signal<string | null>(null)

  readonly isMobileMenuOpen = signal<boolean>(false)

  /**
   * @name setParentLabel
   * @description 부모 메뉴 라벨을 설정하고 자식 라벨을 초기화합니다.
   * @param {string} label 설정할 부모 메뉴 라벨
   */
  setParentLabel(label: string): void {
    this.parentLabel.set(label)
    this.childLabel.set(null)
  }

  /**
   * @name setChildLabel
   * @description 자식 메뉴 라벨을 설정합니다.
   * @param {string | null} label 설정할 자식 메뉴 라벨 (없으면 null)
   */
  setChildLabel(label: string | null): void {
    this.childLabel.set(label)
  }

  /**
   * @name getParentLabel
   * @description 현재 부모 메뉴 라벨을 반환합니다.
   * @returns {string} 부모 메뉴 라벨
   */
  getParentLabel(): string {
    return this.parentLabel()
  }

  /**
   * @name getFullLabel
   * @description 전체 메뉴 경로 라벨을 반환합니다. (부모 > 자식)
   * @returns {string} 전체 메뉴 경로
   */
  getFullLabel(): string {
    const parent = this.parentLabel()
    const child = this.childLabel()
    return child ? `${parent} > ${child}` : parent
  }

  /** 모바일 메뉴 토글 */
  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update((open) => !open)
  }

  /** 모바일 메뉴 닫기 */
  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false)
  }
}
