import { Injectable } from '@nestjs/common';
import { Client } from '@notionhq/client';
import { Bill, BillInfo } from './interfaces/bill';
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
import { CreateReportDto } from './dto/create-report';
import { generateReport } from './helper/report';
import { TaskReport } from './interfaces/task';
import { GetBillListDto } from './dto/get-bill-list.dto';
import { transformBillListToBillInfo } from './helper/bill';
import { CozeService } from 'src/coze/coze.service';

@Injectable()
export class NotionService {
  private notionClient: Client;
  private readonly notionTodoDatabaseId = process.env.NOTION_TODO_DATABASE_ID;
  private readonly notionBillDatabaseId = process.env.NOTION_BILL_DATABASE_ID;
  private readonly notionNoteDatabaseId = process.env.NOTION_NOTE_DATABASE_ID;
  private readonly notionTaskDatabaseId = process.env.NOTION_TASK_DATABASE_ID;
  private readonly notionDailyReportDatabaseId =
    process.env.NOTION_DAILY_REPORT_DATABASE_ID;
  private readonly notionWeeklyReportDatabaseId =
    process.env.NOTION_WEEKLY_REPORT_DATABASE_ID;

  constructor(private readonly cozeService: CozeService) {
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

  async getBillListFormNotion(params?: GetBillListDto) {
    const { baseTime, timeType = TimeType.Day } = params || {};
    const { start, end } = getISO8601TimeRangeByTimeType(timeType, baseTime);
    const filter = {
      and: [
        {
          property: 'Time',
          date: {
            on_or_after: start,
          },
        },
        {
          property: 'Time',
          date: {
            on_or_before: end,
          },
        },
      ],
    };
    const res = await this.notionClient.databases.query({
      database_id: this.notionBillDatabaseId,
      filter,
    });

    return res.results;
  }

  async getBillInfo(params?: GetBillListDto) {
    const billListFormNotion = await this.getBillListFormNotion(params);
    return transformBillListToBillInfo(billListFormNotion);
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

  async getLLMAnalysis(reportInfo: TaskReport, billInfo: BillInfo) {
    const { dateRange } = reportInfo;
    const { startISO8601, endISO8601 } = dateRange;
    try {
      const response = await this.cozeService.runWorkFlow({
        workflow_id: process.env.COZE_REPORT_WORKFLOW_ID,
        parameters: {
          tasks: reportInfo,
          billInfo,
          start_date: startISO8601,
          end_date: endISO8601,
        },
      });

      const { data } = response;

      const { output, think } = JSON.parse(data);

      return {
        output,
        think,
      };
    } catch (error) {
      console.error('LLM Analysis failed:', error);
      return null;
    }
  }

  async addReport(dataBaseId: string, params: CreateReportDto) {
    const reportInfo = await this.getTaskReport(params);
    const billInfo = await this.getBillInfo(params);
    const { properties, children } = generateReport(reportInfo, billInfo);
    const llmResponse = await this.getLLMAnalysis(reportInfo, billInfo);

    if (llmResponse) {
      // 把 llm 和 think 添加到 children 中
      const { output, think } = llmResponse;
      const outputBlock = markdownToBlocks(output);
      const thinkBlock = markdownToBlocks(think);
      children.push(...outputBlock, ...thinkBlock);
    }

    return this.notionClient.pages.create({
      parent: {
        database_id: dataBaseId,
      },
      properties: properties,
      // 添加页面内容
      children: children,
    });
  }

  async addDailyReport(params: CreateReportDto) {
    return this.addReport(this.notionDailyReportDatabaseId, params);
  }

  async addWeeklyReport(params: CreateReportDto) {
    const finalParams = {
      ...params,
      timeType: TimeType.Week,
    };
    return this.addReport(this.notionWeeklyReportDatabaseId, finalParams);
  }
}
