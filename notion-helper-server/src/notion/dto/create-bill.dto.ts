import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateBillDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  method: string;

  @IsNotEmpty()
  type: string[] | string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsString()
  description: string;

  isInput?: boolean;
}
