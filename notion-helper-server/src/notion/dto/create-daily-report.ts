import { TimeType } from '../constants';
import { TaskTypeGroupSortType } from '../interfaces/task';

export class CreateDailyReportDto {
  baseTime?: number;

  timeType?: TimeType;

  sortBy?: TaskTypeGroupSortType;
}
