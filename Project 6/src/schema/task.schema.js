import { Schema } from 'redis-om';

export const taskSchema = new Schema(
  'task',
  {
    name: {
      type: 'text', //string
    },
    complete: {
      type: 'boolean',
    },
  },
  {
    dataStructure: 'JSON',
  }
);
