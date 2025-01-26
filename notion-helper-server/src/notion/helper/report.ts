import { format2Percent } from 'src/utils/format';
import { TaskReport, TaskTypeGroup } from '../interfaces/task';
import * as dayjs from 'dayjs';
import { formatSecondsToTime } from 'src/utils/time';

/**
 * 生成报告
 * @param reportInfo
 * @returns
 */
export const generateReport = (reportInfo: TaskReport) => {
  const time = reportInfo.dateRange.start || 0;

  const timeStr = dayjs(time).format('YYYY-MM-DD');

  const {
    actualTime,
    costTime,
    degreeConcentration,
    actualTimeStr,
    costTimeStr,
    list = [],
  } = reportInfo;

  const properties: Record<string, any> = {
    // 标题属性 - 使用日期作为标题
    Name: {
      title: [
        {
          text: { content: timeStr, link: null },
          plain_text: timeStr,
        },
      ],
    },
    ReportDate: {
      date: {
        start: timeStr, // 填写您想要的日期
        end: null, // 如果没有结束日期，可以设置为 null
      },
    },

    // 数字属性
    actualTime: {
      number: actualTime,
    },
    costTime: {
      number: costTime,
    },
    // 百分比属性
    degreeConcentration: {
      number: degreeConcentration,
    },
  };

  const taskInfoContent = generateTaskInfoContent(list);

  const summaryContent = [
    {
      object: 'block',
      type: 'heading_1',
      heading_1: {
        rich_text: [
          {
            type: 'text',
            text: { content: 'Summary' },
          },
        ],
      },
    },
    {
      object: 'block',
      type: 'bulleted_list_item',
      bulleted_list_item: {
        rich_text: [
          {
            type: 'text',
            text: {
              content: `degreeConcentration:  ${format2Percent(degreeConcentration)} (${actualTimeStr}/${costTimeStr})`,
            },
          },
        ],
      },
    },
  ];

  const children: any = [...summaryContent, ...taskInfoContent];

  return {
    properties,
    children,
  };
};

/**
 * 生成 task item 信息的内容
 * @param task task item
 * @returns
 */
const generateTaskItemInfoContent = (taskItem: TaskTypeGroup) => {
  const taskTitle = {
    object: 'block',
    type: 'paragraph',
    paragraph: {
      rich_text: [
        {
          type: 'text',
          text: {
            content: `${taskItem.type}: ${formatSecondsToTime(taskItem.actualTime)}/${formatSecondsToTime(taskItem.costTime)}, ${format2Percent(taskItem.degreeConcentration)}`,
          },
        },
      ],
    },
  };
  const taskTableContent = {
    object: 'block',
    type: 'table',
    table: {
      table_width: 4,
      has_column_header: true,
      has_row_header: false,
      children: [
        {
          type: 'table_row',
          table_row: {
            cells: [
              [{ type: 'text', text: { content: 'TaskName' } }],
              [{ type: 'text', text: { content: 'Actual Time' } }],
              [{ type: 'text', text: { content: 'Cost Time' } }],
              [{ type: 'text', text: { content: 'Concentration' } }],
            ],
          },
        },
        ...(taskItem.tasks || []).map((task) => ({
          type: 'table_row',
          table_row: {
            cells: [
              [{ type: 'text', text: { content: task.name } }],
              [
                {
                  type: 'text',
                  text: {
                    content: formatSecondsToTime(task.actualTime),
                  },
                },
              ],
              [
                {
                  type: 'text',
                  text: { content: formatSecondsToTime(task.costTime) },
                },
              ],
              [
                {
                  type: 'text',
                  text: {
                    content: format2Percent(task.degreeConcentration),
                  },
                },
              ],
            ],
          },
        })),
      ],
    },
  };

  return {
    taskTitle,
    taskTableContent,
  };
};

/**
 * 生成 task 信息的内容
 * @param list
 * @returns
 */
const generateTaskInfoContent = (list: TaskTypeGroup[]) => {
  const taskTitleBlock = {
    object: 'block',
    type: 'heading_1',
    heading_1: {
      rich_text: [
        {
          type: 'text',
          text: { content: 'TaskList' },
        },
      ],
    },
  };

  const taskInfoTableContent = list.map((taskGroup) => {
    const { taskTitle, taskTableContent } =
      generateTaskItemInfoContent(taskGroup);
    return [taskTitle, taskTableContent];
  });

  const taskInfoContent = [taskTitleBlock, ...taskInfoTableContent.flat()];

  return taskInfoContent;
};
