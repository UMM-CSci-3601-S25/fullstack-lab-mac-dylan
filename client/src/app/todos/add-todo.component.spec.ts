/* eslint-disable @typescript-eslint/no-unused-vars */
import { Location } from '@angular/common';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, flush, tick, waitForAsync } from '@angular/core/testing';
import { AbstractControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router, RouterModule } from '@angular/router';
import { of, throwError } from 'rxjs';
import { MockTodoService } from 'src/testing/todo.service.mock';
import { AddTodoComponent } from './add-todo.component';
import { TodoProfileComponent } from './todo-profile.component';
import { TodoService } from './todo.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('AddTodoComponent', () => {
  let addTodoComponent: AddTodoComponent;
  let addTodoForm: FormGroup;
  let fixture: ComponentFixture<AddTodoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.overrideProvider(TodoService, { useValue: new MockTodoService() });
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        MatSnackBarModule,
        MatCardModule,
        MatFormFieldModule,
        MatSelectModule,
        MatInputModule,
        BrowserAnimationsModule,
        RouterModule,
        AddTodoComponent
      ],
    }).compileComponents().catch(error => {
      expect(error).toBeNull();
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTodoComponent);
    addTodoComponent = fixture.componentInstance;
    fixture.detectChanges();
    addTodoForm = addTodoComponent.addTodoForm;
    expect(addTodoForm).toBeDefined();
    expect(addTodoForm.controls).toBeDefined();
  });

  it('should create the component and form', () => {
    expect(addTodoComponent).toBeTruthy();
    expect(addTodoForm).toBeTruthy();
  });

  it('form should be invalid when empty', () => {
    expect(addTodoForm.valid).toBeFalsy();
  });

  describe('The owner field', () => {
    let ownerControl: AbstractControl;

    beforeEach(() => {
      ownerControl = addTodoComponent.addTodoForm.controls.owner;
    });

    it('should not allow empty owners', () => {
      ownerControl.setValue('');
      expect(ownerControl.valid).toBeFalsy();
    });

    it('should be fine with "Chris Smith"', () => {
      ownerControl.setValue('Chris Smith');
      expect(ownerControl.valid).toBeTruthy();
    });

    it('should fail on single character owners', () => {
      ownerControl.setValue('x');
      expect(ownerControl.valid).toBeFalsy();
      expect(ownerControl.hasError('minlength')).toBeTruthy();
    });

    it('should fail on really long owners', () => {
      ownerControl.setValue('x'.repeat(100));
      expect(ownerControl.valid).toBeFalsy();
      expect(ownerControl.hasError('maxlength')).toBeTruthy();
    });

    it('should allow digits in the owner', () => {
      ownerControl.setValue('Bad2Th3B0ne');
      expect(ownerControl.valid).toBeTruthy();
    });
  });

  describe('The status field', () => {
    let statusControl: AbstractControl;

    beforeEach(() => {
      statusControl = addTodoComponent.addTodoForm.controls.status;
    });

    it('should not allow empty statuses', () => {
      statusControl.setValue('');
      expect(statusControl.valid).toBeFalsy();
    });

    it('should allow "complete"', () => {
      statusControl.setValue('complete');
      expect(statusControl.valid).toBeTruthy();
    });

    it('should allow "incomplete"', () => {
      statusControl.setValue('incomplete');
      expect(statusControl.valid).toBeTruthy();
    });
  });

  describe('The category field', () => {
    it('should allow empty values', () => {
      const categoryControl = addTodoForm.controls.category;
      categoryControl.setValue('');
      expect(categoryControl.valid).toBeTruthy();
    });
  });

  describe('The body field', () => {
    let bodyControl: AbstractControl;

    beforeEach(() => {
      bodyControl = addTodoComponent.addTodoForm.controls.body;
    });

    it('should not allow empty values', () => {
      bodyControl.setValue('');
      expect(bodyControl.valid).toBeFalsy();
      expect(bodyControl.hasError('required')).toBeTruthy();
    });

    it('should accept valid body text', () => {
      bodyControl.setValue('This is a valid body text.');
      expect(bodyControl.valid).toBeTruthy();
    });

    it('should fail on really long body text', () => {
      bodyControl.setValue('x'.repeat(1000));
      expect(bodyControl.valid).toBeFalsy();
      expect(bodyControl.hasError('maxlength')).toBeTruthy();
    });
  });

  describe('getErrorMessage()', () => {
    it('should return the correct error message', () => {
      let controlName: keyof typeof addTodoComponent.addTodoValidationMessages = 'owner';
      addTodoComponent.addTodoForm.get(controlName).setErrors({'required': true});
      expect(addTodoComponent.getErrorMessage(controlName)).toEqual('Owner is required');

      controlName = 'body';
      addTodoComponent.addTodoForm.get(controlName).setErrors({'required': true});
      expect(addTodoComponent.getErrorMessage(controlName)).toEqual('Body is required');

      controlName = 'body';
      addTodoComponent.addTodoForm.get(controlName).setErrors({'maxlength': true});
      expect(addTodoComponent.getErrorMessage(controlName)).toEqual('Body cannot be more than 500 characters long');
    });

    it('should return "Unknown error" if no error message is found', () => {
      const controlName: keyof typeof addTodoComponent.addTodoValidationMessages = 'owner';
      addTodoComponent.addTodoForm.get(controlName).setErrors({'unknown': true});
      expect(addTodoComponent.getErrorMessage(controlName)).toEqual('Unknown error');
    });
  });
});

describe('AddTodoComponent#submitForm()', () => {
  let component: AddTodoComponent;
  let fixture: ComponentFixture<AddTodoComponent>;
  let todoService: TodoService;
  let location: Location;

  beforeEach(() => {
    TestBed.overrideProvider(TodoService, { useValue: new MockTodoService() });
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        MatSnackBarModule,
        MatCardModule,
        MatSelectModule,
        MatInputModule,
        BrowserAnimationsModule,
        RouterModule.forRoot([
          { path: 'todos/1', component: TodoProfileComponent }
        ]),
        AddTodoComponent, TodoProfileComponent
      ],
      providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
    }).compileComponents().catch(error => {
      expect(error).toBeNull();
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTodoComponent);
    component = fixture.componentInstance;
    todoService = TestBed.inject(TodoService);
    location = TestBed.inject(Location);
    TestBed.inject(Router);
    TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  beforeEach(() => {
    component.addTodoForm.controls.owner.setValue('Chris Smith');
    component.addTodoForm.controls.status.setValue('complete');
    component.addTodoForm.controls.category.setValue('work');
    component.addTodoForm.controls.body.setValue('This is a valid body text.');
  });

  // it('should call addTodo() and handle success response', fakeAsync(() => {
  //   fixture.ngZone.run(() => {
  //     const addTodoSpy = spyOn(todoService, 'addTodo').and.returnValue(of('1'));
  //     component.submitForm();
  //     expect(addTodoSpy).toHaveBeenCalledWith(component.addTodoForm.value);
  //     tick();
  //     expect(location.path()).toBe('/todos/1');
  //     flush();
  //   });
  // }));

  // it('should call addTodo() and handle error response', () => {
  //   const path = location.path();
  //   const errorResponse = { status: 500, message: 'Server error' };
  //   const addTodoSpy = spyOn(todoService, 'addTodo')
  //     .and
  //     .returnValue(throwError(() => errorResponse));
  //   component.submitForm();
  //   expect(addTodoSpy).toHaveBeenCalledWith(component.addTodoForm.value);
  //   expect(location.path()).toBe(path);
  // });
});
