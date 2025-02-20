export interface Todo {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  isComplete: any;
    _id: string;
    owner: string;
    body: string
    status:boolean;
    category: string;
  }

  export type TodoCategory = 'homework' | 'video games' | 'groceries' | 'software design';
