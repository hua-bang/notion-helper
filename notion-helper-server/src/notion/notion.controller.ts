import { Controller, Get } from '@nestjs/common';
import { NotionService } from './notion.service';

@Controller('notion')
export class NotionController {
  constructor(private readonly notionService: NotionService) {}

  @Get('/database/list')
  getDatabaseList() {
    return this.notionService.getDatabaseList();
  }
}
