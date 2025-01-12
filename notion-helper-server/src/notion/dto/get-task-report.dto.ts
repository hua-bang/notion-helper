import { TimeType } from '../constants';
import { TaskTypeGroupSortType } from '../interfaces/task';

export class GetTaskReportDto {
  baseTime?: number;

  timeType: TimeType;

  sortBy?: TaskTypeGroupSortType;
}
