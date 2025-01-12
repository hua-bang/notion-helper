import { TaskForCostTime } from '../interfaces/task';

export const transformTaskDatabaseResponse2TaskForCostTime = (
  task: any,
): TaskForCostTime => {
  // 获取任务名称
  const name =
    task.properties.Name.type === 'title'
      ? (task.properties.Name.title[0] as { plain_text: string })?.plain_text ||
        ''
      : '';

  // 获取任务类型
  const type =
    task.properties.Type.type === 'multi_select'
      ? (task.properties.Type.multi_select as any).map((t) => t.name)
      : [];

  // 获取开始和结束时间
  const dateProperty =
    task.properties.Date.type === 'date' ? task.properties.Date.date : null;

  const date: [number, number] = dateProperty
    ? [
        new Date(dateProperty.start).getTime(),
        dateProperty.end
          ? new Date(dateProperty.end).getTime()
          : new Date(dateProperty.start).getTime(),
      ]
    : [0, 0];

  // 获取预计时间（以秒为单位）
  const costTime =
    task.properties.EstimatedTime.type === 'formula'
      ? task.properties.EstimatedTime.formula.type === 'number'
        ? task.properties.EstimatedTime.formula.number || 0
        : 0
      : 0;

  // 获取实际时间（以秒为单位）
  const actualTime =
    task.properties.ActualTime.type === 'number'
      ? task.properties.ActualTime.number || 0
      : 0;

  return {
    name,
    type,
    date,
    costTime,
    actualTime,
    notionUrl: task.url,
    degreeConcentration: actualTime / costTime,
  };
};
