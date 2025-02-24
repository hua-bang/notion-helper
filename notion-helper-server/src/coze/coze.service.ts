import { CozeAPI, Runs } from '@coze/api';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CozeService {
  private cozeAPI: CozeAPI;
  constructor() {
    this.cozeAPI = new CozeAPI({
      token: process.env.COZE_TOKEN,
      baseURL: 'https://api.coze.cn',
    });
  }

  async runWorkFlow(...args: Parameters<Runs['create']>) {
    return this.cozeAPI.workflows.runs.create(...args);
  }
}
