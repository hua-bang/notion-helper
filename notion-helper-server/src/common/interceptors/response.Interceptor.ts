import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        // const response = context.switchToHttp().getResponse();
        return {
          data, // 返回控制器返回的数据
          code: 200, // 返回码
          msg: '请求成功', // 返回消息
        };
      }),
    );
  }
}
