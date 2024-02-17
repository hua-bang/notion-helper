import { Body, Controller, Get, Post } from '@nestjs/common';
import { NotionService } from './notion.service';
import { CreateTodoDto } from './dto/create-todo.dto';

@Controller('notion')
export class NotionController {
  constructor(private readonly notionService: NotionService) {}

  @Get('/todo/list')
  getTodoList() {
    return this.notionService.getTodoList();
  }

  @Post('/todo/add')
  addTodo(@Body() todo: CreateTodoDto) {
    return this.notionService.addTodo(todo);
  }
}
