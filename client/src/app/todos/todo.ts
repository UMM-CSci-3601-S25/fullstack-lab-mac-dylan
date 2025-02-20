export interface Todo {
  _id: string;
  owner: string;
  status: boolean;
  body: string;
  category: TodoCategory;
}

export type TodoCategory = 'home work' | 'video games' | 'software design' | 'groceries';
