import { Injectable } from '@nestjs/common';
import { Client } from '@notionhq/client';
import { Bill } from './interfaces/bill';
import { Todo } from './interfaces/todo';
import { Note } from './interfaces/note';
import { title } from 'process';

@Injectable()
export class NotionService {
  private notionClient: Client;
  private readonly notionTodoDatabaseId = process.env.NOTION_TODO_DATABASE_ID;
  private readonly notionBillDatabaseId = process.env.NOTION_BILL_DATABASE_ID;
  private readonly notionNoteDatabaseId = process.env.NOTION_NOTE_DATABASE_ID;

  constructor() {
    this.notionClient = new Client({
      auth: process.env.NOTION_API_KEY,
    });
  }

  getTodoList() {
    return this.notionClient.databases.query({
      database_id: this.notionTodoDatabaseId,
    });
  }

  addTodo(todo: Todo) {
    const { name, tags, description } = todo;

    const formattedTags = Array.isArray(tags) ? tags : tags.split(' ');

    const tagsArray = formattedTags.map((tag) => {
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
        database_id: this.notionTodoDatabaseId,
      },
      properties: properties,
    });
  }

  getBillList() {
    return this.notionClient.databases.query({
      database_id: this.notionBillDatabaseId,
    });
  }

  addBillRecord(bill: Bill) {
    const { name, method, type, description, isInput, amount } = bill;

    const formattedType = Array.isArray(type) ? type : type.split(' ');

    const typeArr = formattedType.map((item) => {
      return {
        name: item,
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
      Method: {
        type: 'multi_select',
        multi_select: [
          {
            name: method,
          },
        ],
      },
      Type: {
        type: 'multi_select',
        multi_select: typeArr,
      },
      Amount: {
        type: 'number',
        number: amount,
      },
      '支出/收入': {
        type: 'select',
        select: {
          name: isInput ? '收入' : '支出',
        },
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
        database_id: this.notionBillDatabaseId,
      },
      properties: properties,
    });
  }

  getNoteList() {
    return this.notionClient.databases.query({
      database_id: this.notionNoteDatabaseId,
    });
  }

  addNote(note: Note) {
    const { content, tags } = note;

    const formattedTags = Array.isArray(tags) ? tags : (tags || '').split(' ');

    const tagsArray = formattedTags.map((tag) => {
      return {
        name: tag,
      };
    });

    const properties: Record<string, any> = {
      title: {
        title: [
          {
            text: { content: note.title, link: null },
            plain_text: note.title,
          },
        ],
      },
      url: {
        rich_text: [
          {
            text: { content: note.url, link: null },
            plain_text: note.url,
          },
        ],
      },
    };

    if (tags) {
      properties.tags = {
        type: 'multi_select',
        multi_select: tagsArray,
      };
    }
    return this.notionClient.pages.create({
      parent: {
        database_id: this.notionNoteDatabaseId,
      },
      properties: properties,
      children: [
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [{ type: 'text', text: { content: content } }],
          },
        },
      ],
    });
  }
}
