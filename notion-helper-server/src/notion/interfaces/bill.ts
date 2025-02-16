export interface Bill {
  name: string;

  method: string;

  type: string[] | string;

  amount: number;

  description?: string;

  isInput?: boolean;
}

export interface BillEntity {
  id: string;

  name: string;

  amount: number;

  inOrOutType: IncomeAndExpenditureType;

  notionUrl?: string;

  time: string;

  types: string[];
}

export interface TypePercentItem {
  type: string;
  names: string[];
  billNum: number;
  percent?: number;
}

export interface BillInfo {
  list: BillEntity[];
  income: number;
  expenditure: number;
  billNum: number;
  typePercentInfoArr: TypePercentItem[];
}

export enum IncomeAndExpenditureType {
  INCOME = 1,
  EXPENDITURE = 2,
}
