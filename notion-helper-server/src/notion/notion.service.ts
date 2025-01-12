import { Injectable } from '@nestjs/common';
import { Client } from '@notionhq/client';
import { Bill } from './interfaces/bill';
import { Todo } from './interfaces/todo';
import { Note } from './interfaces/note';
import { markdownToBlocks } from '@tryfabric/martian';
import { TimeType } from './constants';
import {
  formatSecondsToTime,
  getISO8601TimeRangeByTimeType,
  getTimeRangeByTimeType,
} from 'src/utils/time';
import { GetTaskListDto } from './dto/get-task-list.dto';
import { DatabaseObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import {
  transformTaskDatabaseResponse2TaskForCostTime,
  transformTaskForCostTimeList2TaskTypeGroup,
} from './helper/transform';
import { GetTaskReportDto } from './dto/get-task-report.dto';
import { CreateDailyReportDto } from './dto/create-daily-report';
import { generateReport } from './helper/report';
import { TaskReport } from './interfaces/task';

@Injectable()
export class NotionService {
  private notionClient: Client;
  private readonly notionTodoDatabaseId = process.env.NOTION_TODO_DATABASE_ID;
  private readonly notionBillDatabaseId = process.env.NOTION_BILL_DATABASE_ID;
  private readonly notionNoteDatabaseId = process.env.NOTION_NOTE_DATABASE_ID;
  private readonly notionTaskDatabaseId = process.env.NOTION_TASK_DATABASE_ID;
  private readonly notionDailyReportDatabaseId =
    process.env.NOTION_DAILY_REPORT_DATABASE_ID;

  constructor() {
    this.notionClient = new Client({
      auth: process.env.NOTION_API_KEY,
    });
  }

  getTodoList() {
    return this.notionClient.databases.query({
      database_id: this.notionTodoDatabaseId,
    });
  }

  addTodo(todo: Todo) {
    const { name, tags, description } = todo;

    const formattedTags = Array.isArray(tags) ? tags : tags.split(' ');

    const tagsArray = formattedTags.map((tag) => {
      return {
        name: tag,
      };
    });

    const properties: Record<string, any> = {
      Name: {
        title: [
          {
            text: { content: name, link: null },
            plain_text: name,
          },
        ],
      },
      Tags: {
        type: 'multi_select',
        multi_select: tagsArray,
      },
    };

    if (description) {
      properties.description = {
        rich_text: [
          {
            text: { content: description, link: null },
            plain_text: description,
          },
        ],
      };
    }

    return this.notionClient.pages.create({
      parent: {
        database_id: this.notionTodoDatabaseId,
      },
      properties: properties,
    });
  }

  getBillList() {
    return this.notionClient.databases.query({
      database_id: this.notionBillDatabaseId,
    });
  }

  addBillRecord(bill: Bill) {
    const { name, method, type, description, isInput, amount } = bill;

    const formattedType = Array.isArray(type) ? type : type.split(' ');

    const typeArr = formattedType.map((item) => {
      return {
        name: item,
      };
    });
    const properties: Record<string, any> = {
      Name: {
        title: [
          {
            text: { content: name, link: null },
            plain_text: name,
          },
        ],
      },
      Method: {
        type: 'multi_select',
        multi_select: [
          {
            name: method,
          },
        ],
      },
      Type: {
        type: 'multi_select',
        multi_select: typeArr,
      },
      Amount: {
        type: 'number',
        number: amount,
      },
      '支出/收入': {
        type: 'select',
        select: {
          name: isInput ? '收入' : '支出',
        },
      },
    };

    if (description) {
      properties.description = {
        rich_text: [
          {
            text: { content: description, link: null },
            plain_text: description,
          },
        ],
      };
    }

    return this.notionClient.pages.create({
      parent: {
        database_id: this.notionBillDatabaseId,
      },
      properties: properties,
    });
  }

  getNoteList() {
    return this.notionClient.databases.query({
      database_id: this.notionNoteDatabaseId,
    });
  }

  async addNote(note: Note) {
    const { content, tags } = note;

    const formattedTags = Array.isArray(tags) ? tags : (tags || '').split(' ');

    const tagsArray = formattedTags.map((tag) => {
      return {
        name: tag,
      };
    });

    const properties: Record<string, any> = {
      title: {
        title: [
          {
            text: { content: note.title, link: null },
            plain_text: note.title,
          },
        ],
      },
      url: {
        rich_text: [
          {
            text: { content: note.url, link: null },
            plain_text: note.url,
          },
        ],
      },
    };

    if (tags) {
      properties.tags = {
        type: 'multi_select',
        multi_select: tagsArray,
      };
    }

    const blocks = markdownToBlocks(content);

    return this.notionClient.pages.create({
      parent: {
        database_id: this.notionNoteDatabaseId,
      },
      properties: properties,
      children: blocks as any,
    });
  }

  async getTaskList(params?: GetTaskListDto) {
    const { baseTime, timeType = TimeType.Day } = params || {};
    const { start, end } = getISO8601TimeRangeByTimeType(timeType, baseTime);
    const { results } = await this.notionClient.databases.query({
      database_id: this.notionTaskDatabaseId,
      filter: {
        and: [
          {
            property: 'Date',
            date: {
              after: String(start),
            },
          },
          {
            property: 'Date',
            date: {
              before: String(end),
            },
          },
        ],
      },
    });

    const taskForTimeCost = results.map((item) => {
      return transformTaskDatabaseResponse2TaskForCostTime(
        item as unknown as DatabaseObjectResponse,
      );
    });

    return taskForTimeCost;
  }

  async getTaskReport(params?: GetTaskReportDto) {
    const {
      baseTime,
      timeType = TimeType.Day,
      sortBy = 'costTimeSum',
    } = params || {};
    const taskList = await this.getTaskList({
      baseTime,
      timeType,
    });
    const { start, end } = getTimeRangeByTimeType(timeType, baseTime);
    const taskTypeGroupArr =
      transformTaskForCostTimeList2TaskTypeGroup(taskList, start, end) || [];

    taskTypeGroupArr.sort((a, b) => {
      return (b[sortBy] || 0) - (a[sortBy] || 0);
    });

    const totalCostTime = taskTypeGroupArr.reduce((acc, cur) => {
      return acc + cur.costTime;
    }, 0);

    const totalActualTime = taskTypeGroupArr.reduce((acc, cur) => {
      return acc + cur.actualTime;
    }, 0);

    const res: TaskReport = {
      list: taskTypeGroupArr,
      actualTime: totalActualTime,
      costTime: totalCostTime,
      degreeConcentration: totalActualTime / totalCostTime,
      actualTimeStr: formatSecondsToTime(totalActualTime),
      costTimeStr: formatSecondsToTime(totalCostTime),
      dateRange: {
        start,
        end,
        startISO8601: new Date(start).toISOString(),
        endISO8601: new Date(end).toISOString(),
      },
    };

    return res;
  }

  async addDailyReport(params: CreateDailyReportDto) {
    const reportInfo = await this.getTaskReport(params);
    const { properties, children } = generateReport(reportInfo);

    return this.notionClient.pages.create({
      parent: {
        database_id: this.notionDailyReportDatabaseId,
      },
      properties: properties,
      // 添加页面内容
      children: children,
    });
  }
}
