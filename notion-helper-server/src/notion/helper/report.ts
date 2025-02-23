import { format2Percent } from 'src/utils/format';
import { TaskReport, TaskTypeGroup } from '../interfaces/task';
import * as dayjs from 'dayjs';
import { formatSecondsToTime, isSameDay } from 'src/utils/time';
import { BillInfo, IncomeAndExpenditureType } from '../interfaces/bill';
import { getTOCElement } from '../elements/get-toc-element';

/**
 * 生成报告
 * @param reportInfo
 * @returns
 */
export const generateReport = (reportInfo: TaskReport, billInfo: BillInfo) => {
  const timeStartStr = dayjs(reportInfo.dateRange.start).format('YYYY-MM-DD');
  const timeEndStr = dayjs(reportInfo.dateRange.end).format('YYYY-MM-DD');

  const timeStr = isSameDay(timeStartStr, timeEndStr)
    ? dayjs(timeStartStr).format('YYYY-MM-DD')
    : `${timeStartStr} - ${timeEndStr}`;

  const {
    actualTime,
    costTime,
    degreeConcentration,
    actualTimeStr,
    costTimeStr,
    list = [],
  } = reportInfo;

  const { billNum } = billInfo;

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
        start: timeStartStr, // 填写您想要的日期
        end: timeEndStr, // 如果没有结束日期，可以设置为 null
      },
    },

    // 数字属性
    actualTime: {
      number: actualTime,
    },
    costTime: {
      number: costTime,
    },
    billNum: {
      number: billNum || 0,
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
              content: `🧘 时间专注度:  ${format2Percent(degreeConcentration)} (${actualTimeStr}/${costTimeStr})`,
            },
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
              content: `💰 经济开销为:  ${billNum}（开销为：${billInfo.expenditure}, 收入为 ${billInfo.income}）`,
            },
          },
        ],
      },
    },
  ];

  const billInfoContent = generateBillInfoContent(billInfo);

  const children: any = [
    // 添加单个 TOC 节点
    getTOCElement(),
    ...summaryContent,
    ...taskInfoContent,
    ...billInfoContent,
  ];

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
const generateTaskInfoItemContent = (taskItem: TaskTypeGroup) => {
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
              [
                {
                  type: 'text',
                  text: {
                    content: task.name,
                    link: {
                      url: task.notionUrl,
                    },
                  },
                },
              ],
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
      generateTaskInfoItemContent(taskGroup);
    return [taskTitle, taskTableContent];
  });

  const taskInfoContent = [taskTitleBlock, ...taskInfoTableContent.flat()];

  return taskInfoContent;
};

const generateBillInfoContent = (billInfo: BillInfo) => {
  const billTitleBlock = {
    object: 'block',
    type: 'heading_1',
    heading_1: {
      rich_text: [
        {
          type: 'text',
          text: { content: '💰 Bill ' },
        },
      ],
    },
  };

  // 新增：按类型统计金额（支持多类型）
  const typeSummary = Object.entries(
    billInfo.list.reduce(
      (acc, item) => {
        item.types.forEach((type) => {
          acc[type] = (acc[type] || 0) + item.amount;
        });
        return acc;
      },
      {} as Record<string, number>,
    ),
  ).map(([type, total]) => ({
    object: 'block',
    type: 'bulleted_list_item',
    bulleted_list_item: {
      rich_text: [
        {
          type: 'text',
          text: { content: `${type}:  ` },
          annotations: { bold: true },
        },
        {
          type: 'text',
          text: {
            content: `${total >= 0 ? '¥' : '-¥'}${Math.abs(total).toFixed(2)}(${((total / billInfo.billNum) * 100).toFixed(2)}%)`,
          },
        },
      ],
    },
  }));

  const billInfoTableContent = generateBillListTable(billInfo);

  const billInfoContent = [
    billTitleBlock,
    // 添加分类统计区块
    ...typeSummary,
    // 原有表格内容
    billInfoTableContent,
  ];

  return billInfoContent;
};

const generateBillListTable = (billInfo: BillInfo) => {
  const billList = billInfo.list.sort((a, b) => b.amount - a.amount);
  const billTableContent = {
    object: 'block',
    type: 'table',
    table: {
      table_width: 5,
      has_column_header: true,
      has_row_header: false,
      children: [
        {
          type: 'table_row',
          table_row: {
            cells: [
              [{ type: 'text', text: { content: '😄 项目' } }],
              [{ type: 'text', text: { content: '🤔 收入/支出' } }],
              [{ type: 'text', text: { content: '🥸 类型' } }],
              [{ type: 'text', text: { content: '💰 金额情况' } }],
              [{ type: 'text', text: { content: '👀 占比' } }],
            ],
          },
        },
        ...(billList || []).map((bill) => ({
          type: 'table_row',
          table_row: {
            cells: [
              [
                {
                  type: 'text',
                  text: {
                    content: bill.name,
                    link: {
                      url: bill.notionUrl,
                    },
                  },
                },
              ],
              [
                {
                  type: 'text',
                  text: {
                    content:
                      bill.inOrOutType === IncomeAndExpenditureType.INCOME
                        ? '收入'
                        : '支出',
                  },
                },
              ],
              [
                {
                  type: 'text',
                  text: { content: bill.types.join(',') },
                },
              ],
              [
                {
                  type: 'text',
                  text: { content: String(bill.amount) },
                },
              ],
              [
                {
                  type: 'text',
                  text: {
                    content:
                      billInfo.billNum === 0
                        ? '-'
                        : `${((bill.amount / billInfo.billNum) * 100).toFixed(2)}%`,
                  },
                },
              ],
            ],
          },
        })),
      ],
    },
  };

  return billTableContent;
};
