import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { NotionService } from './notion.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { AppConfigGuard } from 'src/common/guards/app-config';

@Controller('notion')
export class NotionController {
  constructor(private readonly notionService: NotionService) {}

  @Get('/todo/list')
  @UseGuards(AppConfigGuard)
  getTodoList() {
    return this.notionService.getTodoList();
  }

  @Post('/todo/add')
  @UseGuards(AppConfigGuard)
  addTodo(@Body() todo: CreateTodoDto) {
    return this.notionService.addTodo(todo);
  }
}
