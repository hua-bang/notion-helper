export const format2Percent = (num: number) => {
  // 保留两位小数
  return (num * 100).toFixed(2) + '%';
};
