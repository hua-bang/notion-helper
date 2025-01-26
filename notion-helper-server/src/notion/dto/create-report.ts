import { TimeType } from '../constants';
import { TaskTypeGroupSortType } from '../interfaces/task';

export class CreateReportDto {
  baseTime?: number;

  timeType?: TimeType;

  sortBy?: TaskTypeGroupSortType;
}
