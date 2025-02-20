import { Component, DestroyRef, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { catchError, map, switchMap } from 'rxjs/operators';
import { TodoCardComponent } from './todo-card.component';
import { TodoService } from './todo.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
// import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-todo-profile',
  templateUrl: './todo-profile.component.html',
  styleUrls: ['./todo-profile.component.scss'],
  imports: [TodoCardComponent, MatCardModule],
})
export class TodoProfileComponent {
  todo = toSignal(
    this.route.paramMap.pipe(
      // Map the paramMap into the id
      map((paramMap: ParamMap) => paramMap.get('id')),
      // Maps the `id` string into the Observable<Todo>,
      // which will emit zero or one values depending on whether there is a
      // `Todo` with that ID.
      switchMap((id: string) => this.todoService.getTodoById(id)),
      catchError((_err) => {
        this.error.set({
          help: 'There was a problem loading the todo – try again.',
          httpResponse: _err.message,
          message: _err.error?.title,
        });
        return of();
      })
      /*
       * You can uncomment the line that starts with `finalize` below to use that console message
       * as a way of verifying that this subscription is completing.
       * We removed it since we were not doing anything interesting on completion
       * and didn't want to clutter the console log
       */
      // finalize(() => console.log('We got a new todo, and we are done!'))
    )
  );
  // The `error` will initially have empty strings for all its components.
  error = signal({ help: '', httpResponse: '', message: '' });

  constructor(
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private todoService: TodoService,
    private destroyRef: DestroyRef
  ) {}
}
