import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { NotionService } from './notion.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { AppConfigGuard } from 'src/common/guards/app-config';
import { CreateBillDto } from './dto/create-bill.dto';
import { CreateNoteDto } from './dto/create-note.dto';
import { GetTaskListDto } from './dto/get-task-list.dto';
import { CreateReportDto } from './dto/create-report';
import { TimeType } from './constants';

@Controller('notion')
@UseGuards(AppConfigGuard)
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

  @Post('/bill/add')
  addBillRecord(@Body() bill: CreateBillDto) {
    return this.notionService.addBillRecord(bill);
  }

  @Get('/note/list')
  getNoteList() {
    return this.notionService.getNoteList();
  }

  @Post('/note/add')
  addNote(@Body() note: CreateNoteDto) {
    return this.notionService.addNote(note);
  }

  @Post('/task/list')
  getTaskBy(@Body() params: GetTaskListDto) {
    return this.notionService.getTaskList(params);
  }

  @Post('/task/report')
  getTaskReport(@Body() params: GetTaskListDto) {
    return this.notionService.getTaskReport(params);
  }

  @Post('/task/report/add')
  addReport(@Body() params: CreateReportDto) {
    const { timeType = TimeType.Day } = params;
    if (timeType === TimeType.Week) {
      return this.notionService.addWeeklyReport(params);
    }
    return this.notionService.addDailyReport(params);
  }
}
