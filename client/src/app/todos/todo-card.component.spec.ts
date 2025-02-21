import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TodoCardComponent } from './todo-card.component';
import { Todo } from './todo';



describe('TodoCardComponent', () => {
  let component: TodoCardComponent;
  let fixture: ComponentFixture<TodoCardComponent>;
  let expectedTodo: Todo;


  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        MatCardModule,
        TodoCardComponent
      ]
    })
      .compileComponents();
  }));


  beforeEach(async() => {

    fixture = TestBed.createComponent(TodoCardComponent);
    component = fixture.componentInstance;
    expectedTodo = {
        _id: 'todo_id',
        category: 'software design',
        body: 'This is a test todo body.',
        status: true,
        owner: 'Chris',
        isComplete: false
      };


    fixture.componentRef.setInput('todo', expectedTodo);
    await fixture.whenStable();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });

    it('should be associated with the correct user', () => {
      expect(component.todo()).toEqual(expectedTodo);
    });

    it('should be the user named Chris', () => {
      expect(component.todo().owner).toEqual('Chris');
    });


});
