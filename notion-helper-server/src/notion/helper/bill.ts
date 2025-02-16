import {
  BillEntity,
  BillInfo,
  IncomeAndExpenditureType,
  TypePercentItem,
} from '../interfaces/bill';

export const transformBillListToBillInfo = (billList: any) => {
  if (!billList.length) {
    return undefined;
  }

  let income = 0,
    expenditure = 0;

  const typePercentMap: Record<string, TypePercentItem> = {};

  const nextBillList = billList.map((bill: any) => {
    const { properties, id } = bill;
    const amount = properties.Amount.number;
    const name = properties.Name.title[0].plain_text;
    const type = properties.Type.multi_select.map((item) => item.name)[0];
    const inOrOutType =
      properties['支出/收入']?.select?.name === '收入'
        ? IncomeAndExpenditureType.INCOME
        : IncomeAndExpenditureType.EXPENDITURE;

    if (inOrOutType === IncomeAndExpenditureType.INCOME) {
      income += amount;
    } else {
      expenditure += amount;
    }

    if (!typePercentMap[type]) {
      typePercentMap[type] = {
        type,
        names: [],
        billNum: 0,
      };
    }
    typePercentMap[type].billNum =
      inOrOutType === IncomeAndExpenditureType.INCOME
        ? typePercentMap[type].billNum + amount
        : typePercentMap[type].billNum - amount;
    typePercentMap[type].names.push(name);

    const billEntity: BillEntity = {
      id: id,
      notionUrl: bill.url,
      amount,
      inOrOutType,
      time: properties.Time.created_time,
      name: properties.Name.title[0].plain_text,
      types: properties.Type.multi_select.map((item) => item.name),
    };

    return billEntity;
  });

  const billNum = income - expenditure;

  Object.keys(typePercentMap).forEach((key) => {
    typePercentMap[key].percent =
      billNum === 0 ? 0 : typePercentMap[key].billNum / billNum;
  });

  const typePercentInfoArr: TypePercentItem[] = Object.values(typePercentMap);

  const billInfo: BillInfo = {
    list: nextBillList,
    income,
    expenditure,
    billNum,
    typePercentInfoArr,
  };

  return billInfo;
};
