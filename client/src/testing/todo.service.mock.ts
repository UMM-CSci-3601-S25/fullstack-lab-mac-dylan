import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AppComponent } from 'src/app/app.component';
import { Todo } from '../app/todos/todo';
import { TodoService } from '../app/todos/todo.service';

/**
 * A "mock" version of the `UserService` that can be used to test components
 * without having to create an actual service. It needs to be `Injectable` since
 * that's how services are typically provided to components.
 */
@Injectable({
  providedIn: AppComponent
})
export class MockTodoService extends TodoService {
  static testTodos: Todo[] = [
      {
        _id: 'chris_id',
        owner: 'Chris',
        status: true,
        body: 'In sunt ex non tempor cillum commodo amet incididunt anim qui commodo quis. Cillum non labore ex sint esse.',
        category: 'software design',
        isComplete: undefined
      },
      {
        _id: 'pat_id',
        owner: 'Pat',
        status: false,
        body: 'Ipsum esse est ullamco magna tempor anim laborum non officia deserunt veniam commodo. Aute minim incididunt ex commodo.',
        category: 'video games',
        isComplete: undefined
      },
      {
        _id: 'jamie_id',
        owner: 'Jamie',
        status: true,
        body: 'Deserunt in tempor est id consectetur cupidatat. Deserunt officia id Lorem nostrud amet.',
        category: 'homework',
        isComplete: undefined
      }
    ];


  constructor() {
    super(null);
  }

  // skipcq: JS-0105
  // It's OK that the `_filters` argument isn't used here, so we'll disable
  // this warning for just his function.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getTodos(_filters: { owner?: string; status?: boolean; body?: string; category?: string }): Observable<Todo[]> {
    // Our goal here isn't to test (and thus rewrite) the service, so we'll
    // keep it simple and just return the test users regardless of what
    // filters are passed in.
    //
    // The `of()` function converts a regular object or value into an
    // `Observable` of that object or value.
    return of(MockTodoService.testTodos);
  }


}
