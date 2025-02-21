import { HttpClient, HttpParams } from '@angular/common/http';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { of } from 'rxjs';
import { Todo } from './todo';
import { TodoService } from './todo.service';

describe('TodoService', () => {
  // A small collection of test todos
  const testTodos: Todo[] = [
    {
      _id: "58af3a600343927e48e8720f",
      owner: 'Blanche',
      status: false,
      body: 'In sunt ex non tempor cillum commodo amet incididunt anim qui commodo quis',
      category: 'software design',
      isComplete: undefined
    },
    {
      _id: '58af3a600343927e48e87210',
      owner: 'Fry',
      status: false,
      body: 'Ipsum esse est ullamco magna tempor anim laborum non officia deserunt veniam commodo',
      category: 'video games',
      isComplete: undefined
    },
    {
      _id: '58af3a600343927e48e87214',
      owner: 'Barry',
      status: true,
      body: 'Nisi sit non non sunt veniam pariatur',
      category: 'video games',
      isComplete: undefined
    }
  ];
  let todoService: TodoService;
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TodoService]
    });
    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    todoService = TestBed.inject(TodoService);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  describe('When getTodos() is called with no parameters', () => {
    it('calls `api/todos`', waitForAsync(() => {
      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testTodos));

      todoService.getTodos().subscribe(() => {
        expect(mockedMethod).toHaveBeenCalledTimes(1);
        expect(mockedMethod).toHaveBeenCalledWith(todoService.todoUrl, { params: new HttpParams() });
      });
    }));
  });

  describe('When getTodos() is called with parameters, it correctly forms the HTTP request', () => {
    it('correctly calls api/todos with filter parameter `homework`', () => {
      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testTodos));

      todoService.getTodos({ category: 'homework' }).subscribe(() => {
        expect(mockedMethod).toHaveBeenCalledTimes(1);
        expect(mockedMethod).toHaveBeenCalledWith(todoService.todoUrl, { params: new HttpParams().set('category', 'homework') });
      });
    });

    it('correctly calls api/todos with filter parameter `false`', () => {
      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testTodos));

      todoService.getTodos({ status: false }).subscribe(() => {
        expect(mockedMethod).toHaveBeenCalledTimes(1);
        expect(mockedMethod).toHaveBeenCalledWith(todoService.todoUrl, { params: new HttpParams().set('status', 'false') });
      });
    });

    it('correctly calls api/todos with multiple filter parameters', () => {
      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testTodos));

      todoService.getTodos({ category: 'homework', status: false }).subscribe(() => {
        const [url, options] = mockedMethod.calls.argsFor(0);
        const calledHttpParams: HttpParams = (options.params) as HttpParams;
        expect(mockedMethod).toHaveBeenCalledTimes(1);
        expect(url).toEqual(todoService.todoUrl);
        expect(calledHttpParams.keys().length).toEqual(2);
        expect(calledHttpParams.get('category')).toEqual('homework');
        expect(calledHttpParams.get('status')).toEqual('false');
      });
    });
  });

  describe('When getTodoById() is given an ID', () => {
    it('calls api/todos/id with the correct ID', waitForAsync(() => {
      const targetTodo: Todo = testTodos[1];
      const targetId: string = targetTodo._id;

      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(targetTodo));

      todoService.getTodoById(targetId).subscribe(() => {
        expect(mockedMethod).toHaveBeenCalledTimes(1);
        expect(mockedMethod).toHaveBeenCalledWith(`${todoService.todoUrl}/${targetId}`);
      });
    }));
  });

  describe('Filtering on the client using `filterTodos()`', () => {
    it('filters by owner', () => {
      const todoOwner = 'i';
      const filteredTodos = todoService.filterTodos(testTodos, { owner: todoOwner });
      expect(filteredTodos.length).toBe(2);
      filteredTodos.forEach(todo => {
        expect(todo.owner.indexOf(todoOwner)).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Adding a todo using `addTodo()`', () => {
    it('talks to the right endpoint and is called once', waitForAsync(() => {
      const todo_id = 'pat_id';
      const expected_http_response = { id: todo_id };

      const mockedMethod = spyOn(httpClient, 'post').and.returnValue(of(expected_http_response));

      todoService.addTodo(testTodos[1]).subscribe((new_todo_id) => {
        expect(new_todo_id).toBe(todo_id);
        expect(mockedMethod).toHaveBeenCalledTimes(1);
        expect(mockedMethod).toHaveBeenCalledWith(todoService.todoUrl, testTodos[1]);
      });
    }));
  });
});
