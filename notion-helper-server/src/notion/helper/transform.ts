import { TaskForCostTime, TaskTypeGroup } from '../interfaces/task';

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

export const transformTaskForCostTimeList2TaskTypeGroup = (
  taskList: TaskForCostTime[],
  startTime: number,
  endTime: number,
): TaskTypeGroup[] => {
  // 按照任务类型进行分组
  const taskTypeGroupMap: Record<string, TaskTypeGroup> = {};
  taskList.forEach((task) => {
    task.type.forEach((type) => {
      if (!taskTypeGroupMap[type]) {
        taskTypeGroupMap[type] = {
          type,
          tasks: [],
          actualTime: 0,
          costTime: 0,
          degreeConcentration: 0,
          date: [0, 0],
        };
      }
      taskTypeGroupMap[type].tasks.push(task);
      taskTypeGroupMap[type].actualTime += task.actualTime;
      taskTypeGroupMap[type].costTime += task.costTime;
    });
  });
  // 将分组结果转换为数组
  const taskTypeGroupList: TaskTypeGroup[] = Object.values(taskTypeGroupMap);
  // 计算任务专注度
  taskTypeGroupList.forEach((group) => {
    group.degreeConcentration = group.actualTime / group.costTime;
    group.date = [startTime, endTime];
  });

  return taskTypeGroupList;
};
