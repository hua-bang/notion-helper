import { format2Percent } from 'src/utils/format';
import { TaskReport } from '../interfaces/task';
import * as dayjs from 'dayjs';
import { formatSecondsToTime } from 'src/utils/time';

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

  const taskGroupTable = [
    {
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
                [{ type: 'text', text: { content: 'Task Type' } }],
                [{ type: 'text', text: { content: 'Actual Time' } }],
                [{ type: 'text', text: { content: 'Cost Time' } }],
                [{ type: 'text', text: { content: 'Concentration' } }],
              ],
            },
          },
          ...list.map((taskGroup) => ({
            type: 'table_row',
            table_row: {
              cells: [
                [{ type: 'text', text: { content: taskGroup.type } }],
                [
                  {
                    type: 'text',
                    text: {
                      content: formatSecondsToTime(taskGroup.actualTime),
                    },
                  },
                ],
                [
                  {
                    type: 'text',
                    text: { content: formatSecondsToTime(taskGroup.costTime) },
                  },
                ],
                [
                  {
                    type: 'text',
                    text: {
                      content: format2Percent(taskGroup.degreeConcentration),
                    },
                  },
                ],
              ],
            },
          })),
        ],
      },
    },
  ];

  const children: any = [
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
    {
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
    },
    ...taskGroupTable,
  ];

  return {
    properties,
    children,
  };
};
