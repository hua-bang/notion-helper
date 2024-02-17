import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NotionModule } from './notion/notion.module';
import { config } from 'dotenv';

config();

@Module({
  imports: [NotionModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
