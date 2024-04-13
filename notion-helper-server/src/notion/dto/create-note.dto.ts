import { IsNotEmpty, IsString } from 'class-validator';

export class CreateNoteDto {
  @IsNotEmpty()
  title: string;

  tags: string[] | string;

  @IsNotEmpty()
  url: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}
