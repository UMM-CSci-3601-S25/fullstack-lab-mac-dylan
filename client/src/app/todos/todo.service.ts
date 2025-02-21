import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Todo } from '../todos/todo';
//import { Category } from '../category-list/category';

/**
 * Service that provides the interface for getting information

 */
@Injectable({
  providedIn: 'root'
})
export class TodoService {

  readonly todoUrl: string = `${environment.apiUrl}todos`;

  private readonly categoryKey = 'category';
  private readonly ownerKey = 'owner';
  private readonly statusKey = 'status';
  private readonly bodyKey = 'body';


  // The private `HttpClient` is *injected* into the service
  // by the Angular framework. This allows the system to create
  // only one `HttpClient` and share that across all services
  // that need it, and it allows us to inject a mock version
  // of `HttpClient` in the unit tests so they don't have to
  // make "real" HTTP calls to a server that might not exist or
  // might not be currently running.
  constructor(private httpClient: HttpClient) {
  }


  getTodos(filters?: { owner?: string; status?: boolean; body?: string; category?: string }): Observable<Todo[]> {
    // `HttpParams` is essentially just a map used to hold key-value
    // pairs that are then encoded as "?key1=value1&key2=value2&…" in
    // the URL when we make the call to `.get()` below.
    let httpParams: HttpParams = new HttpParams();
    if (filters) {
      if (filters.owner) {
        httpParams = httpParams.set(this.ownerKey, filters.owner);
      }
      if (filters.status !== undefined) {
        httpParams = httpParams.set(this.statusKey, filters.status.toString());
      }
      if (filters.category) {
        httpParams = httpParams.set(this.categoryKey, filters.category);
      }
      if (filters.body) {
        httpParams = httpParams.set(this.bodyKey, filters.body);
      }
    }
    // Send the HTTP GET request with the given URL and parameters.

    return this.httpClient.get<Todo[]>(this.todoUrl, {
      params: httpParams,
    });
  }



  getTodoById(id: string): Observable<Todo> {

    return this.httpClient.get<Todo>(`${this.todoUrl}/${id}`);
  }


  filterTodos(todos: Todo[], filters: { owner?: string; status?: boolean; body?: string; category?: string }): Todo[] { // skipcq: JS-0105
    let filteredTodos = todos;

    // Filter by owner
    if (filters.owner) {
      filters.owner = filters.owner.toLowerCase();
      filteredTodos = filteredTodos.filter(todo => todo.owner.toLowerCase().indexOf(filters.owner) !== -1);
    }

     // Filter by category
    if (filters.category) {
      filters.category = filters.category.toLowerCase();
      filteredTodos = filteredTodos.filter(todo => todo.category.toLowerCase().indexOf(filters.category) !== -1);
    }


    // Filter by status
    if (filters.status !== undefined) {
      filteredTodos = filteredTodos.filter(todo => todo.status === filters.status);
    }

     // filter by body
    if (filters.body) {
       filters.body = filters.body.toLowerCase();
       filteredTodos = filteredTodos.filter(todo => todo.body.toLowerCase().indexOf(filters.body) !== -1);
     }
    return filteredTodos;
  }



  addTodo(newTodo: Partial<Todo>): Observable<string> {

    return this.httpClient.post<{id: string}>(this.todoUrl, newTodo).pipe(map(response => response.id));
  }
}
