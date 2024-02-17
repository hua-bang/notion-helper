import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTodoDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  tags: string[];

  @IsString()
  description: string;
}
