import 'zone.js/testing';
import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule, FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { FileInput } from '../models/file-input.model';
import { FileInputComponent } from './file-input.component';

/** Custom ErrorStateMatcher for tests */
class FileInputSpecErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, _: FormGroupDirective | NgForm | null): boolean {
    return !!(control && control.errors !== null && control.touched);
  }
}

/** Custom ErrorStateMatcher for overriding single component */
class OverrideErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, _: FormGroupDirective | NgForm | null): boolean {
    return !!(control && control.errors && Object.keys(control.errors).length === 2);
  }
}

describe('FileInputComponent', () => {
  let component: FileInputComponent;
  let fixture: ComponentFixture<FileInputComponent>;
  let defaultErrorStateMatcher: FileInputSpecErrorStateMatcher;

  beforeEach(async () => {
    defaultErrorStateMatcher = new FileInputSpecErrorStateMatcher();

    await TestBed.configureTestingModule({
      imports: [
        FileInputComponent, 
        ReactiveFormsModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule
      ],
      providers: [
        { provide: ErrorStateMatcher, useValue: defaultErrorStateMatcher }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FileInputComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges(); 
    expect(component).toBeTruthy();
  });

  it('should start with no files', () => {
    fixture.detectChanges();
    expect(component.value).toBeNull();
  });

  it('should add a file programmatically', fakeAsync(() => {
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    component.value = new FileInput([file]);

    tick(); 
    fixture.detectChanges(); 

    expect(component.value.files.length).toBe(1);
  }));

  it('should set placeholder and valuePlaceholder', fakeAsync(() => {
    component.placeholder = 'Upload file';
    component.valuePlaceholder = 'Filenames here';

    tick();
    fixture.detectChanges();

    expect(component.placeholder).toBe('Upload file');
    expect(component.valuePlaceholder).toBe('Filenames here');
  }));

  it('should display file name instead of valuePlaceholder', fakeAsync(() => {
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    component.valuePlaceholder = 'Initial text';
    component.value = new FileInput([file]);
    
    tick();
    fixture.detectChanges();

    expect(component.fileNames).toBe(file.name);
  }));

  it('should handle disabled state', fakeAsync(() => {
    component.disabled = true;
    
    tick();
    fixture.detectChanges();

    expect(component.disabled).toBeTrue();
    expect(component.isDisabled).toBeTrue();
  }));

    it('should have `accept` attribute', () => {
    const accept = '.pdf';
    component.accept = accept;
    fixture.detectChanges();
    expect(component.accept).toBe(accept);
  });

  it('should propagate onContainerClick() only when enabled', () => {
    spyOn(component, 'open');
    component.disabled = false;
    fixture.detectChanges(); 
    
    // Enabled
    component.onContainerClick({ target: { tagName: 'DIV' } } as any);
    expect(component.open).toHaveBeenCalledTimes(1);

    // Disabled
    component.disabled = true;
    component.onContainerClick({ target: { tagName: 'DIV' } } as any);
    expect(component.open).toHaveBeenCalledTimes(1);
  });

  it('should not propagate onContainerClick(), when disabled', () => {
    spyOn(component, 'open').and.stub();
    fixture.detectChanges();

    component.disabled = true;
    component.onContainerClick({
      target: {
        tagName: 'not-input'
      } as Partial<Element>
    } as MouseEvent);
    expect(component.open).not.toHaveBeenCalled();
  });

  it('should clear files and reset state', fakeAsync(() => {
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    component.value = new FileInput([file]);

    tick();
    fixture.detectChanges();

    component.clear();
    expect(component.value).toBeNull();
    expect(component.empty).toBeTrue();
    expect(component.previewUrls.length).toBe(0);
  }));

  it('should update errorState from false to true', fakeAsync(() => {
    const mockMatcher = {
        isErrorState: () => false as boolean 
    };
    
    spyOn(component.stateChanges, 'next');
    component.ngControl = { control: new FormControl(null) } as any;
    const control = component.ngControl.control!;
    component.errorStateMatcher = mockMatcher; 
    component.required = false; 
    control.setErrors(null);
    control.markAsUntouched();
    const isErrorStateSpy = spyOn(mockMatcher, 'isErrorState').and.returnValue(false);
    expect(component.stateChanges.next).toHaveBeenCalledTimes(1); 

    tick(); 
    fixture.detectChanges();
    
    expect(component.errorState).toBeFalse();

    control.setErrors({ someError: true }); 
    control.markAsTouched(); 
    control.updateValueAndValidity({ onlySelf: true }); 
    isErrorStateSpy.and.returnValue(true);

    tick(); 
    fixture.detectChanges();
    
    expect(component.errorState).toBeTrue(); 
    expect(component.stateChanges.next).toHaveBeenCalledTimes(2); 
  }));

  it('should use custom ErrorStateMatcher when provided', fakeAsync(() => {
    component.ngControl = { control: new FormControl(null) } as any;
    component.ngControl.control!.setErrors({ someError: true });
    component.ngControl.control!.markAsTouched();

    tick();
    fixture.detectChanges();

    expect(component.errorState).toBeTrue();
    component.errorStateMatcher = new OverrideErrorStateMatcher();

    tick();
    fixture.detectChanges();

    expect(component.errorState).toBeFalse();

    component.ngControl.control!.setErrors({ someError: true, anotherError: true });
    tick();
    fixture.detectChanges();

    expect(component.errorState).toBeTrue();
  }));

  it('should set required property correctly', () => {
    component.required = true;
    fixture.detectChanges();
    expect(component.required).toBeTrue();
  });

  it('should set disabled state correctly', fakeAsync(() => {
    component.disabled = true;

    tick();
    fixture.detectChanges();
    
    expect(component.isDisabled).toBeTrue();
    expect(component.disabled).toBeTrue();
  }));

  it('should update value correctly', fakeAsync(() => {
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    component.value = new FileInput([file]);
    
    tick();
    fixture.detectChanges();

    expect(component.value.files[0].name).toBe('test.pdf');
  }));

  it('should generate preview URL for image file', fakeAsync(() => {
    const file = new File(['dummy'], 'img.png', { type: 'image/png' });
    component.value = new FileInput([file]);
    
    tick();
    fixture.detectChanges(); 

    expect(component.previewUrls.length).toBe(1);
    expect(component.previewUrls[0]).toContain('blob:');
  }));

  it('should use default icon for non-image files', fakeAsync(() => {
    const file = new File(['file'], 'file.pdf', { type: 'application/pdf' });
    component.value = new FileInput([file]);
    
    tick();
    fixture.detectChanges();

    expect(component.previewUrls[0]).toBe(component.defaultIconBase64);
  }));

  it('should remove a file and update previewUrls', fakeAsync(() => {
    const file1 = new File(['file1'], 'file1.pdf', { type: 'application/pdf' });
    const file2 = new File(['file2'], 'file2.pdf', { type: 'application/pdf' });
    component.value = new FileInput([file1, file2]);

    tick();
    fixture.detectChanges();
    expect(component.value.files.length).toBe(2);

    component.removeFile(0); 
    expect(component.value.files.length).toBe(1);
    expect(component.previewUrls.length).toBe(1);
  }));

  it('should use the provided defaultIconBase64 for non-image files', fakeAsync(() => {
    const customIcon = 'data:image/svg+xml;base64,...';
    component.defaultIconBase64 = customIcon;

    const nonImageFile = new File(['file'], 'file.txt', { type: 'text/plain' });
    component.value = new FileInput([nonImageFile]);

    const event = new Event('change');
    Object.defineProperty(event, 'target', {
      writable: true,
      value: { files: [nonImageFile] },
    });
    
    component.change(event); 
    
    tick();
    fixture.detectChanges();

    expect(component.previewUrls.length).toBe(1);
    expect(component.previewUrls[0]).toBe(customIcon);
  }));
});