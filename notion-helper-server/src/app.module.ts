import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NotionModule } from './notion/notion.module';
import { config } from 'dotenv';
import { LoggerMiddleware } from './common/middlewares/LoggerMiddleware';
import { CozeModule } from './coze/coze.module';

config();

@Module({
  imports: [NotionModule, CozeModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
