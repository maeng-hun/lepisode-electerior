import 'express'

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      sub: string
      email: string
      role: 'ADMIN' | 'SUPER_ADMIN' | 'USER'
      nickname?: string
    }
  }
}
/**
 * 🔑 req.user 타입 확장
 * 
 * NestJS에서 @Req() req 를 쓰면 내부적으로 Express.Request 타입을 씀
 * 하지만 기본 Express.Request에는 user 속성이 없음 → 타입스크립트 에러 발생
 * 
 * 해결법:
 * - 우리가 직접 Express.Request 타입을 확장해서 user 속성을 추가해 줌
 * - JwtAuthGuard → JwtStrategy.validate() 에서 return한 객체가 자동으로 req.user에 들어감
 * - 따라서 여기서 user 타입을 정의해두면 컨트롤러에서 req.user.sub, req.user.role 등을
 *   안전하게 자동완성 + 타입 보장과 함께 쓸 수 있음
 * 
 * 참고:
 * JwtStrategy.validate(payload) {
 *   return { sub: payload.sub, email: payload.email, role: payload.role, nickname: payload.nickname }
 * }
 * → 이 리턴값이 그대로 req.user로 들어간다
 */
