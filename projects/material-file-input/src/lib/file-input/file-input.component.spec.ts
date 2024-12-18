import { ComponentFixture, TestBed, tick, fakeAsync, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule, FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { FileInput } from '../models/file-input.model';
import { FileInputComponent } from './file-input.component';
import { By } from '@angular/platform-browser';

/**
 * Shows error state on a control if it is touched and has any error.
 * Used as global ErrorStateMatcher for all tests.
 */
class FileInputSpecErrorStateMatcher implements ErrorStateMatcher {
  public isErrorState(control: FormControl | null, _: FormGroupDirective | NgForm | null): boolean {
    return !!(control && control.errors !== null && control.touched);
  }
}

/**
 * Shows error state on a control with exactly two validation errors.
 * Used to change the ErrorStateMatcher of a single component.
 */
class OverrideErrorStateMatcher implements ErrorStateMatcher {
  public isErrorState(control: FormControl | null, _: FormGroupDirective | NgForm | null): boolean {
    return !!(control && control.errors && Object.keys(control.errors).length === 2);
  }
}

describe('FileInputComponent', () => {
  let component: FileInputComponent;
  let fixture: ComponentFixture<FileInputComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [FileInputComponent],
      imports: [
        ReactiveFormsModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule
      ],
      providers: [
        { provide: ErrorStateMatcher, useClass: FileInputSpecErrorStateMatcher }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should have no files by default', () => {
    expect(component.value).toBeNull();
  });

  it('should add file from Input', () => {
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    component.value = new FileInput([file]);
    expect(component.value.files.length).toBe(1);
  });

  it('should set/get placeholder', () => {
    const plh = 'Upload file';
    component.placeholder = plh;
    expect(component.placeholder).toBe(plh);
  });

  it('should set/get valuePlaceholder', () => {
    const plh = 'Filenames here';
    component.valuePlaceholder = plh;
    expect(component.valuePlaceholder).toBe(plh);
  });

  it('should replace valuePlaceholder with fileNames when adding a file', () => {
    component.valuePlaceholder = 'Initial text';
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    component.value = new FileInput([file]);
    expect(component.fileNames).toBe(file.name);
  });

  it('should set/get disabled state', () => {
    component.disabled = true;
    expect(component.disabled).toBeTruthy();
  });

  it('should have `accept` attribute', () => {
    const accept = '.pdf';
    component.accept = accept;
    expect(component.accept).toBe(accept);
  });

  it('should propagate onContainerClick()', () => {
    spyOn(component, 'open').and.stub();
    component.onContainerClick({
      target: {
        tagName: 'not-input'
      } as Partial<Element>
    } as MouseEvent);
    expect(component.open).toHaveBeenCalled();
  });

  it('should not propagate onContainerClick(), when disabled', () => {
    spyOn(component, 'open').and.stub();
    component.disabled = true;
    component.onContainerClick({
      target: {
        tagName: 'not-input'
      } as Partial<Element>
    } as MouseEvent);
    expect(component.open).not.toHaveBeenCalled();
  });

  it('should clear all files and reset state', () => {
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    component.value = new FileInput([file]);
    fixture.detectChanges();
    
    expect(component.value.files.length).toBe(1);
  
    component.clear();
    fixture.detectChanges();
  
    expect(component.value).toBeNull();
    expect(component.empty).toBeTruthy();
    expect(component.previewUrls.length).toBe(0);
  });

  it('should recognize all error state changes', () => {
    spyOn(component.stateChanges, 'next');

    component.ngControl = {
      control: new FormControl(null)
    } as any;

    // Initial state, no errors and untouched
    component.ngControl.control!.setErrors(null);
    component.ngControl.control!.markAsUntouched();

    fixture.detectChanges();
    expect(component.errorState).toBeFalsy();
    expect(component.stateChanges.next).not.toHaveBeenCalled();

    // Set errors and touch the control
    component.ngControl.control!.setErrors({ someError: true });
    component.ngControl.control!.markAsTouched();

    fixture.detectChanges();
    expect(component.errorState).toBeTruthy();
    expect(component.stateChanges.next).toHaveBeenCalledTimes(1);
  });

  it('should use input ErrorStateMatcher over provided', () => {
    component.ngControl = {
      control: new FormControl(null)
    } as any;

    // Initial state, with an error and touched
    component.ngControl.control!.setErrors({ someError: true });
    component.ngControl.control!.markAsTouched();

    fixture.detectChanges();
    expect(component.errorState).toBeTruthy();

    // Apply custom error state matcher
    component.errorStateMatcher = new OverrideErrorStateMatcher();
    fixture.detectChanges();
    expect(component.errorState).toBeFalsy();

    // Set multiple errors to match OverrideErrorStateMatcher
    component.ngControl.control!.setErrors({ someError: true, anotherError: true });
    fixture.detectChanges();
    expect(component.errorState).toBeTruthy();
  });

  it('should set required property correctly', () => {
    component.required = true;
    fixture.detectChanges();
    expect(component.required).toBeTrue();
  });
  
  it('should set disabled state correctly', () => {
    component.disabled = true;
    fixture.detectChanges();
    expect(component.isDisabled).toBeTrue();
    expect(component.disabled).toBeTrue();
  });

  it('should update value correctly', () => {
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    component.value = new FileInput([file]);
    fixture.detectChanges();
  
    expect(component.value.files.length).toBe(1);
    expect(component.value.files[0].name).toBe('test.pdf');
  });

  it('should generate preview URLs for image files', async () => {
    const fileInput = fixture.debugElement.query(By.css('input[type="file"]')).nativeElement;
    const file = new File(['dummy content'], 'test-image.png', { type: 'image/png' });
  
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
  
    fileInput.files = dataTransfer.files;
    const event = { target: fileInput } as Event;
    component.change(event);
  
    await fixture.whenStable();
    fixture.detectChanges();
  
    expect(component.previewUrls.length).toBe(1);
    expect(component.previewUrls[0]).toContain('blob:');
  });
  
  it('should use default icon for non-image files', async () => {
    const nonImageFile = new File(['file'], 'file.pdf', { type: 'application/pdf' });
    component.value = new FileInput([nonImageFile]);
  
    const event = new Event('change');
    Object.defineProperty(event, 'target', {
      writable: true,
      value: { files: [nonImageFile] },
    });
    component.change(event);
  
    await fixture.whenStable();
    fixture.detectChanges();
    expect(component.previewUrls.length).toBe(1);
    expect(component.previewUrls[0]).toBe(component.defaultIconBase64);
  });

  it('should remove a file and update previewUrls', async () => {
    const file1 = new File(['file1'], 'file1.pdf', { type: 'application/pdf' });
    const file2 = new File(['file2'], 'file2.pdf', { type: 'application/pdf' });
    component.value = new FileInput([file1, file2]);

    const event = new Event('change');
    Object.defineProperty(event, 'target', {
      writable: true,
      value: { files: [file1, file2] },
    });
    component.change(event);

    await fixture.whenStable();
    fixture.detectChanges();
    expect(component.value.files.length).toBe(2);
    expect(component.previewUrls.length).toBe(2);

    component.removeFile(0);

    await fixture.whenStable();
    fixture.detectChanges();
    expect(component.value.files.length).toBe(1);
    expect(component.previewUrls.length).toBe(1);
  });

  it('should use the provided defaultIconBase64 for non-image files', async () => {
    const customIcon = 'data:image/svg+xml;base64,PHN2ZyBjbGFzcz0ic3ZnLWljb24iIHN0eWxlPSJ3aWR0aDogMWVtOyBoZWlnaHQ6IDFlbTt2ZXJ0aWNhbC1hbGlnbjogbWlkZGxlO2ZpbGw6IGN1cnJlbnRDb2xvcjtvdmVyZmxvdzogaGlkZGVuOyIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik01NTMuOTg0IDM4NGwyMzUuOTg5MzMzIDAtMjM1Ljk4OTMzMy0yMzMuOTg0IDAgMjMzLjk4NHpNMjU2IDg2LjAxNmwzNDIuMDE2IDAgMjU2IDI1NiAwIDUxMnEwIDM0LjAwNTMzMy0yNS45ODQgNTkuMDA4dC01OS45ODkzMzMgMjUuMDAyNjY3bC01MTIgMHEtMzQuMDA1MzMzIDAtNTkuOTg5MzMzLTI1LjAwMjY2N3QtMjUuOTg0LTU5LjAwOGwyLjAwNTMzMy02ODMuOTg5MzMzcTAtMzQuMDA1MzMzIDI1LjAwMjY2Ny01OS4wMDh0NTkuMDA4LTI1LjAwMjY2N3oiICAvPjwvc3ZnPg==';
    component.defaultIconBase64 = customIcon;
  
    const nonImageFile = new File(['file'], 'file.txt', { type: 'text/plain' });
    component.value = new FileInput([nonImageFile]);
  
    const event = new Event('change');
    Object.defineProperty(event, 'target', {
      writable: true,
      value: { files: [nonImageFile] },
    });
    component.change(event);
  
    await fixture.whenStable();
    fixture.detectChanges();
  
    expect(component.previewUrls.length).toBe(1);
    expect(component.previewUrls[0]).toBe(customIcon);
  });
});
