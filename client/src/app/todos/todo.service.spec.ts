import { HttpClient, HttpParams, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
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
      category: 'software design'
    },
    {
      _id: '58af3a600343927e48e87210',
      owner: 'Fry',
      status: false,
      body: 'Ipsum esse est ullamco magna tempor anim laborum non officia deserunt veniam commodo',
      category: 'video games'
    },
    {
      _id: '58af3a600343927e48e87214',
      owner: 'barry',
      status: true,
      body: 'Nisi sit non non sunt veniam pariatur',
      category: 'video games'
    }
  ];
  let todoService: TodoService;
  // These are used to mock the HTTP requests so that we (a) don't have to
  // have the server running and (b) we can check exactly which HTTP
  // requests were made to ensure that we're making the correct requests.
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    // Set up the mock handling of the HTTP requests
    TestBed.configureTestingModule({
    imports: [],
    providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    // Construct an instance of the service with the mock
    // HTTP client.
    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    todoService = new TodoService(httpClient);
  });

  afterEach(() => {
    // After every test, assert that there are no more pending requests.
    httpTestingController.verify();
  });

  describe('When getTodos() is called with no parameters', () => {
   /* We really don't care what `getTodos()` returns. Since all the
    * filtering (when there is any) is happening on the server,
    * `getTodos()` is really just a "pass through" that returns whatever it receives,
    * without any "post processing" or manipulation. The test in this
    * `describe` confirms that the HTTP request is properly formed
    * and sent out in the world, but we don't _really_ care about
    * what `getTodos()` returns as long as it's what the HTTP
    * request returns.
    *
    * So in this test, we'll keep it simple and have
    * the (mocked) HTTP request return the entire list `testTodos`
    * even though in "real life" we would expect the server to
    * return return a filtered subset of the todos. Furthermore, we
    * won't actually check what got returned (there won't be an `expect`
    * about the returned value). Since we don't use the returned value in this test,
    * It might also be fine to not bother making the mock return it.
    */
    it('calls `api/todos`', waitForAsync(() => {
      // Mock the `httpClient.get()` method, so that instead of making an HTTP request,
      // it just returns our test data.
      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testTodos));

      // Call `todoService.getTodos()` and confirm that the correct call has
      // been made with the correct arguments.
      //
      // We have to `subscribe()` to the `Observable` returned by `getTodos()`.
      // The `todos` argument in the function is the array of Todos returned by
      // the call to `getTodos()`.
      todoService.getTodos().subscribe(() => {
        // The mocked method (`httpClient.get()`) should have been called
        // exactly one time.
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        // The mocked method should have been called with two arguments:
        //   * the appropriate URL ('/api/todos' defined in the `TodoService`)
        //   * An options object containing an empty `HttpParams`
        expect(mockedMethod)
          .withContext('talks to the correct endpoint')
          .toHaveBeenCalledWith(todoService.todoUrl, { params: new HttpParams() });
      });
    }));
  });

  describe('When getTodos() is called with parameters, it correctly forms the HTTP request (Javalin/Server filtering)', () => {
    /*
    * As in the test of `getTodos()` that takes in no filters in the params,
    * we really don't care what `getTodos()` returns in the cases
    * where the filtering is happening on the server. Since all the
    * filtering is happening on the server, `getTodos()` is really
    * just a "pass through" that returns whatever it receives, without
    * any "post processing" or manipulation. So the tests in this
    * `describe` block all confirm that the HTTP request is properly formed
    * and sent out in the world, but don't _really_ care about
    * what `getTodos()` returns as long as it's what the HTTP
    * request returns.
    *
    * So in each of these tests, we'll keep it simple and have
    * the (mocked) HTTP request return the entire list `testTodos`
    * even though in "real life" we would expect the server to
    * return return a filtered subset of the todos. Furthermore, we
    * won't actually check what got returned (there won't be an `expect`
    * about the returned value).
    */

    it('correctly calls api/todos with filter parameter \'home work\'', () => {
        const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testTodos));

        todoService.getTodos({ category: 'home work' }).subscribe(() => {
          expect(mockedMethod)
            .withContext('one call')
            .toHaveBeenCalledTimes(1);
          // The mocked method should have been called with two arguments:
          //   * the appropriate URL ('/api/todos' defined in the `TodoService`)
          //   * An options object containing an `HttpParams` with the `body`:`admin`
          //     key-value pair.
          expect(mockedMethod)
            .withContext('talks to the correct endpoint')
            .toHaveBeenCalledWith(todoService.todoUrl, { params: new HttpParams().set('category', 'home work') });
        });
    });

    it('correctly calls api/todos with filter parameter \'false\'', () => {
      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testTodos));

      todoService.getTodos({ status: false }).subscribe(() => {
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        expect(mockedMethod)
          .withContext('talks to the correct endpoint')
          .toHaveBeenCalledWith(todoService.todoUrl, { params: new HttpParams().set('status', false) });
      });
    });

    it('correctly calls api/todos with multiple filter parameters', () => {
        const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testTodos));

        todoService.getTodos({ category: 'home work', status: false }).subscribe(() => {
          // This test checks that the call to `todoService.getTodos()` does several things:
          //   * It calls the mocked method (`HttpClient#get()`) exactly once.
          //   * It calls it with the correct endpoint (`todoService.todoUrl`).
          //   * It calls it with the correct parameters:
          //      * There should be three parameters (this makes sure that there aren't extras).
          //      * There should be a "category:home work" key-value pair.
          //      * And a "status:false" pair.

          // This gets the arguments for the first (and in this case only) call to the `mockMethod`.
          const [url, options] = mockedMethod.calls.argsFor(0);
          // Gets the `HttpParams` from the options part of the call.
          // `options.param` can return any of a broad number of types;
          // it is in fact an instance of `HttpParams`, and I need to use
          // that fact, so I'm casting it (the `as HttpParams` bit).
          const calledHttpParams: HttpParams = (options.params) as HttpParams;
          expect(mockedMethod)
            .withContext('one call')
            .toHaveBeenCalledTimes(1);
          expect(url)
            .withContext('talks to the correct endpoint')
            .toEqual(todoService.todoUrl);
          expect(calledHttpParams.keys().length)
            .withContext('should have 2 params')
            .toEqual(2);
          expect(calledHttpParams.get('category'))
            .withContext('category of home work')
            .toEqual('home work');
          expect(calledHttpParams.get('status'))
            .withContext('status being false')
            .toEqual('false');
        });
    });
  });

  describe('When getTodoById() is given an ID', () => {
   /* We really don't care what `getTodoById()` returns. Since all the
    * interesting work is happening on the server, `getTodoById()`
    * is really just a "pass through" that returns whatever it receives,
    * without any "post processing" or manipulation. The test in this
    * `describe` confirms that the HTTP request is properly formed
    * and sent out in the world, but we don't _really_ care about
    * what `getTodoById()` returns as long as it's what the HTTP
    * request returns.
    *
    * So in this test, we'll keep it simple and have
    * the (mocked) HTTP request return the `targetTodo`
    * Furthermore, we won't actually check what got returned (there won't be an `expect`
    * about the returned value). Since we don't use the returned value in this test,
    * It might also be fine to not bother making the mock return it.
    */
    it('calls api/todos/id with the correct ID', waitForAsync(() => {
      // We're just picking a Todo "at random" from our little
      // set of Todos up at the top.
      const targetTodo: Todo = testTodos[1];
      const targetId: string = targetTodo._id;

      // Mock the `httpClient.get()` method so that instead of making an HTTP request
      // it just returns one todo from our test data
      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(targetTodo));

      // Call `todoService.getTodo()` and confirm that the correct call has
      // been made with the correct arguments.
      //
      // We have to `subscribe()` to the `Observable` returned by `getTodoById()`.
      // The `todo` argument in the function below is the thing of type Todo returned by
      // the call to `getTodoById()`.
      todoService.getTodoById(targetId).subscribe(() => {
        // The `Todo` returned by `getTodoById()` should be targetTodo, but
        // we don't bother with an `expect` here since we don't care what was returned.
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        expect(mockedMethod)
          .withContext('talks to the correct endpoint')
          .toHaveBeenCalledWith(`${todoService.todoUrl}/${targetId}`);
      });
    }));
  });

  describe('Filtering on the client using `filterTodos()` (Angular/Client filtering)', () => {
    /*
     * Since `filterTodos` actually filters "locally" (in
     * Angular instead of on the server), we do want to
     * confirm that everything it returns has the desired
     * properties. Since this doesn't make a call to the server,
     * though, we don't have to use the mock HttpClient and
     * all those complications.
     */
    it('filters by owner', () => {
      const todoOwner = 'i';
      const filteredTodos = todoService.filterTodos(testTodos, { owner: todoOwner });
      // There should be two todos with an 'i' in their
      // owner: Chris and Jamie.
      expect(filteredTodos.length).toBe(2);
      // Every returned todo's owner should contain an 'i'.
      filteredTodos.forEach(todo => {
        expect(todo.owner.indexOf(todoOwner)).toBeGreaterThanOrEqual(0);
      });
    });

  //   it('filters by owner and company', () => {
  //     // There's only one todo (Chris) whose owner
  //     // contains an 'i' and whose company contains
  //     // an 'M'. There are two whose owner contains
  //     // an 'i' and two whose company contains an
  //     // an 'M', so this should test combined filtering.
  //     const todoOwner = 'i';
  //     const todoCompany = 'M';
  //     const filters = { owner: todoOwner, company: todoCompany };
  //     const filteredTodos = todoService.filterTodos(testTodos, filters);
  //     // There should be just one todo with these properties.
  //     expect(filteredTodos.length).toBe(1);
  //     // Every returned todo should have _both_ these properties.
  //     filteredTodos.forEach(todo => {
  //       expect(todo.owner.indexOf(todoOwner)).toBeGreaterThanOrEqual(0);
  //       expect(todo.company.indexOf(todoCompany)).toBeGreaterThanOrEqual(0);
  //     });
  //   });
  // });

  describe('Adding a todo using `addTodo()`', () => {
    it('talks to the right endpoint and is called once', waitForAsync(() => {
      const todo_id = 'pat_id';
      const expected_http_response = { id: todo_id } ;

      // Mock the `httpClient.addTodo()` method, so that instead of making an HTTP request,
      // it just returns our expected HTTP response.
      const mockedMethod = spyOn(httpClient, 'post')
        .and
        .returnValue(of(expected_http_response));

      todoService.addTodo(testTodos[1]).subscribe((new_todo_id) => {
        expect(new_todo_id).toBe(todo_id);
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        expect(mockedMethod)
          .withContext('talks to the correct endpoint')
          .toHaveBeenCalledWith(todoService.todoUrl, testTodos[1]);
      });
    }));
  });
});
})
