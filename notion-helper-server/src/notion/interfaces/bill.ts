export interface Bill {
  name: string;

  method: string;

  type: string[] | string;

  amount: number;

  description?: string;

  isInput?: boolean;
}