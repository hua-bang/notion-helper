import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTodoDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  tags: string[] | string;

  @IsString()
  description: string;
}
