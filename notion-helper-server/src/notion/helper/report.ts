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

  const taskGroupBulletList = list.map((taskGroup) => ({
    object: 'block',
    type: 'bulleted_list_item',
    bulleted_list_item: {
      rich_text: [
        {
          type: 'text',
          text: {
            content: `${taskGroup.type}:  ${formatSecondsToTime(taskGroup.actualTime)}/${formatSecondsToTime(taskGroup.costTime)}, ${format2Percent(taskGroup.degreeConcentration)}`,
          },
        },
      ],
    },
  }));

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
    ...taskGroupBulletList,
  ];

  return {
    properties,
    children,
  };
};
