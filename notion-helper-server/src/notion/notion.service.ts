import { Injectable } from '@nestjs/common';
import { Client } from '@notionhq/client';
import { CreateTodoDto } from './dto/create-todo.dto';

@Injectable()
export class NotionService {
  private notionClient: Client;

  constructor() {
    this.notionClient = new Client({
      auth: process.env.NOTION_API_KEY,
    });
  }

  getTodoList() {
    return this.notionClient.databases.query({
      database_id: process.env.NOTION_TODO_DATABASE_ID,
    });
  }

  addTodo(todo: CreateTodoDto) {
    const { name, tags, description } = todo;

    const tagsArray = tags.map((tag) => {
      return {
        name: tag,
      };
    });

    const properties: Record<string, any> = {
      Name: {
        title: [
          {
            text: { content: name, link: null },
            plain_text: name,
          },
        ],
      },
      Tags: {
        type: 'multi_select',
        multi_select: tagsArray,
      },
    };

    if (description) {
      properties.description = {
        rich_text: [
          {
            text: { content: description, link: null },
            plain_text: description,
          },
        ],
      };
    }

    return this.notionClient.pages.create({
      parent: {
        database_id: process.env.NOTION_TODO_DATABASE_ID,
      },
      properties: properties,
    });
  }
}
