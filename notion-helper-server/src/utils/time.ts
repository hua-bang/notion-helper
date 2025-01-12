import { TimeType } from './../notion/constants/index';

/**
 * 根据 TimeType 获取时间范围
 * 支持传入基准时间， 基于基准时间计算时间范围，默认为当前时间
 * @param timeType 时间类型
 * @param baseTime 基准时间
 */
export function getTimeRangeByTimeType(
  timeType: TimeType,
  baseTime = Date.now(),
) {
  const baseDate = new Date(baseTime);
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const date = baseDate.getDate();
  const day = baseDate.getDay();

  switch (timeType) {
    case TimeType.Day:
      return {
        start: new Date(year, month, date).getTime(),
        end: new Date(year, month, date + 1).getTime(),
      };
    case TimeType.Week:
      return {
        start: new Date(year, month, date - day).getTime(),
        end: new Date(year, month, date - day + 7).getTime(),
      };
    case TimeType.Month:
      return {
        start: new Date(year, month, 1).getTime(),
        end: new Date(year, month + 1, 1).getTime(),
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
  baseTime = Date.now(),
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
