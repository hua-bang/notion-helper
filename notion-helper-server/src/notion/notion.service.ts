import { Injectable } from '@nestjs/common';
import { Client } from '@notionhq/client';

@Injectable()
export class NotionService {
  private notionClient: Client;

  constructor() {
    this.notionClient = new Client({
      auth: '',
    });
  }

  getDatabaseList() {
    return this.notionClient.databases.query({
      database_id: '',
    });
  }
}
