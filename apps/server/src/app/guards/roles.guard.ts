import { CanActivate, ExecutionContext, Injectable, ForbiddenException, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ROLES_KEY } from './roles.decorator'
import { log } from 'console'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass()
    ])
    if (!requiredRoles || requiredRoles.length === 0) return true
    const request = context.switchToHttp().getRequest()
    const user = request.user

    if (!user?.role || !requiredRoles.includes(user.role)) {
      throw new UnauthorizedException('권한이 없습니다.')
    }

    return true
  }
}
