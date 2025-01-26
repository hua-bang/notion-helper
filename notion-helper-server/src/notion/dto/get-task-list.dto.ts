import { TimeType } from './../constants/index';

export class GetTaskListDto {
  baseTime?: number | string;

  timeType: TimeType;
}
