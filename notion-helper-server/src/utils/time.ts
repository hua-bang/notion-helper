import * as dayjs from 'dayjs';
import { TimeType } from './../notion/constants/index';

/**
 * 根据 TimeType 获取时间范围
 * 支持传入基准时间， 基于基准时间计算时间范围，默认为当前时间
 * @param timeType 时间类型
 * @param baseTime 基准时间
 */
export function getTimeRangeByTimeType(
  timeType: TimeType,
  baseTime: number | string = Date.now(),
) {
  const baseDate = new Date(baseTime);
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const date = baseDate.getDate();
  const day = baseDate.getDay();

  switch (timeType) {
    case TimeType.Day:
      // 整体返回当天的时间范围， end 需要减 1 秒
      return {
        start: new Date(year, month, date).getTime(),
        end: new Date(year, month, date + 1).getTime() - 1,
      };
    case TimeType.Week:
      // 整体返回当周的时间范围， end 需要减 1 秒
      return {
        // date - day 表示当天是周几，减去 day 就是本周的第一天
        // date - day + 7 表示本周的最后一天
        start: new Date(year, month, date - day).getTime(),
        end: new Date(year, month, date - day + 7).getTime() - 1,
      };
    case TimeType.Month:
      // 整体返回当月的时间范围， end 需要减 1 秒
      return {
        start: new Date(year, month, 1).getTime(),
        end: new Date(year, month + 1, 1).getTime() - 1,
      };
    default:
      return {
        start: 0,
        end: 0,
      };
  }
}

// 确保日期格式符合 ISO 8601 标准
export function formatToISO8601(date: Date): string {
  return date.toISOString().split('.')[0] + 'Z';
}

export function getISO8601TimeRangeByTimeType(
  timeType: TimeType,
  baseTime: number | string = Date.now(),
) {
  const { start, end } = getTimeRangeByTimeType(timeType, baseTime);

  return {
    start: formatToISO8601(new Date(start)),
    end: formatToISO8601(new Date(end)),
  };
}

export function formatSecondsToTime(seconds: number) {
  const hour = Math.floor(seconds / 3600);
  const minute = Math.floor((seconds % 3600) / 60);
  const second = seconds % 60;

  if (!hour && !minute) {
    return `${second}s`;
  }
  if (!hour) {
    return `${minute}m${second}s`;
  }

  return `${hour}h${minute}m${second}s`;
}

export const isSameDay = (
  startDate: number | string,
  endDate: number | string,
) => {
  return dayjs(startDate).isSame(dayjs(endDate), 'day');
};
