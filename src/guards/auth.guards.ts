import { CanActivate, ExecutionContext } from '@nestjs/common';
import { UserService } from 'src/users/user.service';

export class AuthGuard implements CanActivate {
  constructor(private userService: UserService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const { authorization } = request.headers;

    try {
      const data = this.userService.checkToken(
        (authorization ?? '').split(' ')[1],
      );

      const user = await this.userService.getUsersById(parseInt(data.sub));
      request.user = user;
    } catch (error) {
      return false;
    }

    return true;
  }
}
