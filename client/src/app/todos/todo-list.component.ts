import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { catchError, combineLatest, of, switchMap, tap } from 'rxjs';
import { Todo } from './todo';
import { TodoCardComponent } from './todo-card.component';
import { TodoService } from '../todos/todo.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-todo-list-component',
  templateUrl: 'todo-list.component.html',
  styleUrls: ['./todo-list.component.scss'],
  providers: [],
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatSelectModule,
    MatOptionModule,
    MatRadioModule,
    TodoCardComponent,
    MatListModule,
    RouterLink,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
  ],
})
export class TodoListComponent {
  todoOwner = signal<string | undefined>(undefined);
  todoBody = signal<string | undefined>(undefined);
  todoCategory = signal<string | undefined>(undefined);
  todoStatus = signal<string | undefined>(undefined);

  viewType = signal<'card' | 'list'>('card');

  errMsg = signal<string | undefined>(undefined);

  constructor(private todoService: TodoService, private snackBar: MatSnackBar) {}

  private todoBody$ = toObservable(this.todoBody);
  private todoOwner$ = toObservable(this.todoOwner);
  private todoCategory$ = toObservable(this.todoCategory);
  private todoStatus$ = toObservable(this.todoStatus);

  serverFilteredTodos = toSignal(
    combineLatest([this.todoCategory$, this.todoOwner$, this.todoStatus$, this.todoBody$]).pipe(
      switchMap(([category, owner, status, body]) =>
        this.todoService.getTodos({
          category,
          owner,
          status,
          body,
        })
      ),
      catchError((err) => {
        if (err.error instanceof ErrorEvent) {
          this.errMsg.set(`Problem in the client – Error: ${err.error.message}`);
        } else {
          this.errMsg.set(`Problem contacting the server – Error Code: ${err.status}\nMessage: ${err.message}`);
        }
        this.snackBar.open(this.errMsg(), 'OK', { duration: 6000 });

        return of<Todo[]>([]);
      }),
      tap(() => {
        // ...existing code...
      })
    )
  );

  filteredTodos = computed(() => {
    const serverFilteredTodos = this.serverFilteredTodos();
    return this.todoService.filterTodos(serverFilteredTodos, {
      category: this.todoCategory(),
      owner: this.todoOwner(),
      status: this.todoStatus() === 'complete',
    });
  });

  getTodosFromServer(): void {
    this.serverFilteredTodos();
  }
}
