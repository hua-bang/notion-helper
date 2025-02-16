import { TimeType } from '../constants';

export interface GetBillListDto {
  baseTime?: number;

  timeType?: TimeType;
}
