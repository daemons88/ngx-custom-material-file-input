import 'zone.js/testing';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import {
  FormsModule,
  ReactiveFormsModule,
  FormControl,
  FormGroupDirective,
  NgForm,
} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FileInput } from '../models/file-input.model';
import { FileInputComponent } from './file-input.component';

/** Custom ErrorStateMatcher for tests */
class FileInputSpecErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    _: FormGroupDirective | NgForm | null
  ): boolean {
    return !!(control && control.errors !== null && control.touched);
  }
}

/** Custom ErrorStateMatcher for overriding single component */
class OverrideErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    _: FormGroupDirective | NgForm | null
  ): boolean {
    return !!(
      control &&
      control.errors &&
      Object.keys(control.errors).length === 2
    );
  }
}

/** Helper function to create a mock File object */
const createMockFile = (
  name: string,
  size: number,
  lastModified: number,
  type = 'text/plain'
): File => {
  const blob = new Blob([''], { type }) as any;
  Object.defineProperty(blob, 'name', { value: name });
  Object.defineProperty(blob, 'size', { value: size });
  Object.defineProperty(blob, 'lastModified', { value: lastModified });
  return blob as File;
};

/** Helper function to create a mock FileList object */
const createMockFileList = (files: File[]): FileList => {
  const fileList: FileList = {
    length: files.length,
    item: (index: number) => files[index] || null,
  } as any;
  files.forEach((file, index) => (fileList[index] = file));
  return fileList;
};

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
        MatIconModule,
      ],
      providers: [
        { provide: ErrorStateMatcher, useValue: defaultErrorStateMatcher },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FileInputComponent);
    component = fixture.componentInstance;
  });

  // ---------------------------------------------------------------------------
  // 🔬 BASIC COMPONENT INITIALIZATION
  // ---------------------------------------------------------------------------
  describe('Basic Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should start with no files (value is null)', () => {
      expect(component.value).toBeNull();
    });

    it('should set required property correctly', () => {
      component.required = true;
      fixture.detectChanges();
      expect(component.required).toBeTrue();
    });

    it('should have `accept` attribute', () => {
      const accept = '.pdf';
      component.accept = accept;
      fixture.detectChanges();
      expect(component.accept).toBe(accept);
    });
  });

  // ---------------------------------------------------------------------------
  // 📎 VALUE AND STATE MANAGEMENT
  // ---------------------------------------------------------------------------
  describe('Value and State Management', () => {
    it('should add a file programmatically', fakeAsync(() => {
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      component.value = new FileInput([file]);

      tick();
      fixture.detectChanges();

      expect(component.value.files.length).toBe(1);
    }));

    it('should update value correctly', fakeAsync(() => {
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      component.value = new FileInput([file]);

      tick();
      fixture.detectChanges();

      expect(component.value.files[0].name).toBe('test.pdf');
    }));

    it('should handle disabled state', fakeAsync(() => {
      component.disabled = true;

      tick();
      fixture.detectChanges();

      expect(component.disabled).toBeTrue();
      expect(component.isDisabled).toBeTrue();
    }));

    it('should set disabled state correctly', fakeAsync(() => {
      component.disabled = true;

      tick();
      fixture.detectChanges();

      expect(component.isDisabled).toBeTrue();
      expect(component.disabled).toBeTrue();
    }));

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

    it('should remove a file and update previewUrls', fakeAsync(() => {
      const file1 = new File(['file1'], 'file1.pdf', {
        type: 'application/pdf',
      });
      const file2 = new File(['file2'], 'file2.pdf', {
        type: 'application/pdf',
      });
      component.value = new FileInput([file1, file2]);

      tick();
      fixture.detectChanges();
      expect(component.value.files.length).toBe(2);

      component.removeFile(0);
      expect(component.value.files.length).toBe(1);
      expect(component.previewUrls.length).toBe(1);
    }));
  });

  // ---------------------------------------------------------------------------
  // 📝 PLACEHOLDER AND DISPLAY
  // ---------------------------------------------------------------------------
  describe('Placeholder and Display', () => {
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
  });

  // ---------------------------------------------------------------------------
  // 🖼️ PREVIEW URLS AND ICONS
  // ---------------------------------------------------------------------------
  describe('Preview URLs and Icons', () => {
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

    it('should use the provided defaultIconBase64 for non-image files', fakeAsync(() => {
      const customIcon = 'data:image/svg+xml;base64,...';
      component.defaultIconBase64 = customIcon;

      const nonImageFile = new File(['file'], 'file.txt', {
        type: 'text/plain',
      });
      component.value = new FileInput([nonImageFile]);

      const event = new Event('change');
      Object.defineProperty(event, 'target', {
        writable: true,
        value: { files: createMockFileList([nonImageFile]) },
      });

      component.change(event as any);

      tick();
      fixture.detectChanges();

      expect(component.previewUrls.length).toBe(1);
      expect(component.previewUrls[0]).toBe(customIcon);
    }));
  });

  // ---------------------------------------------------------------------------
  // 🖱️ USER INTERACTION
  // ---------------------------------------------------------------------------
  describe('User Interaction (Container Click)', () => {
    it('should propagate onContainerClick() only when enabled', () => {
      spyOn(component, 'open');
      component.disabled = false;
      fixture.detectChanges();

      component.onContainerClick({ target: { tagName: 'DIV' } } as any);
      expect(component.open).toHaveBeenCalledTimes(1);

      component.disabled = true;
      component.onContainerClick({ target: { tagName: 'DIV' } } as any);
      expect(component.open).toHaveBeenCalledTimes(1);
    });

    it('should not propagate onContainerClick(), when disabled', () => {
      spyOn(component, 'open').and.stub();
      component.disabled = true;
      fixture.detectChanges();

      component.onContainerClick({
        target: {
          tagName: 'not-input',
        } as Partial<Element>,
      } as MouseEvent);
      expect(component.open).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // 🚨 ERROR STATE MATCHER
  // ---------------------------------------------------------------------------
  describe('Error State Logic', () => {
    it('should update errorState from false to true', fakeAsync(() => {
      const mockMatcher = {
        isErrorState: () => false as boolean,
      };

      spyOn(component.stateChanges, 'next');
      component.ngControl = { control: new FormControl(null) } as any;
      const control = component.ngControl.control!;
      component.errorStateMatcher = mockMatcher;
      component.required = false;
      control.setErrors(null);
      control.markAsUntouched();

      const isErrorStateSpy = spyOn(
        mockMatcher,
        'isErrorState'
      ).and.returnValue(false);

      // Called once on initial setup/ngOnInit or first change detection
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
      // Called again after state change
      expect(component.stateChanges.next).toHaveBeenCalledTimes(2);
    }));

    it('should use custom ErrorStateMatcher when provided', fakeAsync(() => {
      component.ngControl = { control: new FormControl(null) } as any;
      component.ngControl.control!.setErrors({ someError: true });
      component.ngControl.control!.markAsTouched();

      tick();
      fixture.detectChanges();

      // Uses default matcher, which is true if touched and has errors
      expect(component.errorState).toBeTrue();

      // Override with custom matcher that requires two errors
      component.errorStateMatcher = new OverrideErrorStateMatcher();

      tick();
      fixture.detectChanges();

      // Now false because it only has one error, not two
      expect(component.errorState).toBeFalse();

      component.ngControl.control!.setErrors({
        someError: true,
        anotherError: true,
      });
      tick();
      fixture.detectChanges();

      // Now true because it has two errors
      expect(component.errorState).toBeTrue();
    }));
  });

  // ---------------------------------------------------------------------------
  // 🎯 DUPLICATE CHECK TESTS
  // ---------------------------------------------------------------------------
  describe('Duplicate File Check', () => {
    let inputElement: HTMLInputElement;

    beforeEach(() => {
      // Set up the mock input element required for the `change` method
      inputElement = document.createElement('input') as HTMLInputElement;
      inputElement.type = 'file';

      spyOn(
        component['_elementRef'].nativeElement,
        'querySelector'
      ).and.returnValue(inputElement);
    });

    it('should allow duplicate files when checkDuplicates is false (default)', fakeAsync(() => {
      component.multiple = true;
      component.checkDuplicates = false;
      const fileA = createMockFile('doc.pdf', 100, 1000);
      const fileA_duplicate = createMockFile('doc.pdf', 100, 1000);

      const mockEvent1 = {
        target: { files: createMockFileList([fileA]) },
      } as unknown as Event;
      component.change(mockEvent1);
      tick();
      expect(component.value?.files.length).toBe(1);

      const mockEvent2 = {
        target: { files: createMockFileList([fileA_duplicate]) },
      } as unknown as Event;
      component.change(mockEvent2);
      tick();

      expect(component.value?.files.length).toBe(2);
      expect(component.value?.files[0].name).toBe('doc.pdf');
      expect(component.value?.files[1].name).toBe('doc.pdf');
    }));

    it('should prevent duplicate files when checkDuplicates is true', fakeAsync(() => {
      component.multiple = true;
      component.checkDuplicates = true;

      const fileA = createMockFile('report.txt', 250, 2000);
      const fileA_duplicate = createMockFile('report.txt', 250, 2000);

      const mockEvent1 = {
        target: { files: createMockFileList([fileA]) },
      } as unknown as Event;
      component.change(mockEvent1);
      tick();
      expect(component.value?.files.length).toBe(1);

      const mockEvent2 = {
        target: { files: createMockFileList([fileA_duplicate]) },
      } as unknown as Event;
      component.change(mockEvent2);
      tick();

      expect(component.value?.files.length).toBe(1);
      expect(component.value?.files[0].name).toBe('report.txt');
    }));

    it('should allow two files with the same name but different properties (not duplicates)', fakeAsync(() => {
      component.multiple = true;
      component.checkDuplicates = true;

      const fileA = createMockFile('config.json', 500, 1000);
      const fileB = createMockFile('config.json', 500, 2000); // Different lastModified

      const mockEvent1 = {
        target: { files: createMockFileList([fileA]) },
      } as unknown as Event;
      component.change(mockEvent1);
      tick();
      expect(component.value?.files.length).toBe(1);

      const mockEvent2 = {
        target: { files: createMockFileList([fileB]) },
      } as unknown as Event;
      component.change(mockEvent2);
      tick();

      expect(component.value?.files.length).toBe(2);
      expect(component.value?.files[0]).toBe(fileA);
      expect(component.value?.files[1]).toBe(fileB);
    }));

    it('should not check for duplicates if multiple is false (new file always replaces)', fakeAsync(() => {
      component.multiple = false;
      component.checkDuplicates = true;

      const fileA = createMockFile('image.png', 50, 500);
      const fileA_duplicate = createMockFile('image.png', 50, 500);

      const mockEvent1 = {
        target: { files: createMockFileList([fileA]) },
      } as unknown as Event;
      component.change(mockEvent1);
      tick();
      expect(component.value?.files.length).toBe(1);
      expect(component.value?.files[0]).toBe(fileA); // First file

      const mockEvent2 = {
        target: { files: createMockFileList([fileA_duplicate]) },
      } as unknown as Event;
      component.change(mockEvent2);
      tick();

      expect(component.value?.files.length).toBe(1);
      // The single file should be the one from the second event
      expect(component.value?.files[0]).toBe(fileA_duplicate);
    }));
  });
});
