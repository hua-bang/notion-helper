import { Controller } from '@nestjs/common';
import { CozeService } from './coze.service';

@Controller('coze')
export class CozeController {
  constructor(private readonly cozeService: CozeService) {}
}
