import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LoggerMiddleware.name); // 创建 logger 实例

  use(req: Request, res: Response, next: NextFunction) {
    this.logger.debug(`Request Headers: ${JSON.stringify(req.headers)}`);
    this.logger.debug(`Request Body: ${JSON.stringify(req.body)}`);
    next(); // 调用下一个中间件或路由处理器
  }
}
