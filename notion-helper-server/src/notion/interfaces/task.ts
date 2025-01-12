export interface TaskForCostTime {
  name: string;
  type: string[];
  date: [number, number];
  costTime: number;
  actualTime: number;
  notionUrl: string;
  degreeConcentration: number;
}

export interface TaskTypeGroup {
  // 任务类型
  type: string;
  // 任务列表
  tasks: TaskForCostTime[];
  // 任务实际时间总和
  actualTime: number;
  // 任务预计时间总和
  costTime: number;
  // 任务专注度
  degreeConcentration: number;
  // 任务开始时间和结束时间
  date: [number, number];
}

export type TaskTypeGroupSortType =
  | 'costTime'
  | 'actualTime'
  | 'degreeConcentration';

export interface TaskReport {
  list: TaskTypeGroup[];
  actualTime: number;
  costTime: number;
  degreeConcentration: number;
  actualTimeStr: string;
  costTimeStr: string;
  dateRange: {
    start: number;
    end: number;
    startISO8601: string;
    endISO8601: string;
  };
}
