// config.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class AppConfigGuard implements CanActivate {
  private readonly logger = new Logger(AppConfigGuard.name); // 创建 logger 实例
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const appSecret = process.env.APP_SECRET;
    const requestSecret = request.headers['request_secret']; // 假设密钥通过请求头传递

    if (!appSecret) {
      throw new UnauthorizedException(
        'appSecret is not configured in the environment variables.',
      );
    }

    if (appSecret !== requestSecret) {
      this.logger.error(
        `Invalid request secret. appSecret: ${appSecret}, requestSecret: ${requestSecret}`,
      );
      // 如果appSecret和请求中的requestSecret不匹配，抛出异常
      throw new UnauthorizedException('Invalid request secret.');
    }

    return true; // 如果检查通过，则继续执行
  }
}
