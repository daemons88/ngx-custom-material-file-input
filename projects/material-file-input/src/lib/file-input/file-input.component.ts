import {
  Component,
  OnInit,
  Input,
  ElementRef,
  OnDestroy,
  HostBinding,
  Renderer2,
  HostListener,
  DoCheck,
  ChangeDetectionStrategy,
  inject,
  ChangeDetectorRef,
} from '@angular/core';
import {
  ControlValueAccessor,
  NgControl,
  NgForm,
  FormGroupDirective,
} from '@angular/forms';
import { MatFormFieldControl } from '@angular/material/form-field';
import { ErrorStateMatcher } from '@angular/material/core';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { FocusMonitor } from '@angular/cdk/a11y';
import { FileInputBase } from './file-input.base';
import { FileInput } from '../models/file-input.model';
import { Subject } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'ngx-mat-file-input',
  templateUrl: './file-input.component.html',
  styleUrls: ['./file-input.component.css'],
  providers: [
    { provide: MatFormFieldControl, useExisting: FileInputComponent },
  ],
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: true,
})
export class FileInputComponent
  extends FileInputBase
  implements
    MatFormFieldControl<FileInput>,
    ControlValueAccessor,
    OnInit,
    OnDestroy,
    DoCheck
{
  static nextId = 0;

  focused = false;
  controlType = 'file-input';

  @Input() autofilled = false;

  private fm = inject(FocusMonitor);
  private _elementRef = inject(ElementRef);
  private _renderer = inject(Renderer2);
  private _cdr = inject(ChangeDetectorRef);
  private _placeholder: string;
  private _required = false;
  private _multiple = false;
  private _checkDuplicates = false;
  private _previewUrls: string[] = [];
  private _objectURLs: string[] = [];
  private _internalValue: FileInput | null = null;
  private _disabled = false;
  private _displayMode: 'classic' | 'dropzone' = 'classic';

  @Input() accept: string | null = null;
  @Input() errorStateMatcher: ErrorStateMatcher;
  @Input() defaultIconBase64: string =
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjI0Ij48cGF0aCBkPSJNMCAwaDI0djI0SDBWMHoiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJNMTUgMkg2Yy0xLjEgMC0yIC45LTIgMnYxNmMwIDEuMS45IDIgMiAyaDEyYzEuMSAwIDItLjkgMi0yVjdsLTUtNXpNNiAyMFY0aDh2NGg0djEySDZ6bTEwLTEwdjVjMCAyLjIxLTEuNzkgNC00IDRzLTQtMS43OS00LTRWOC41YzAtMS40NyAxLjI2LTIuNjQgMi43Ni0yLjQ5IDEuMy4xMyAyLjI0IDEuMzIgMi4yNCAyLjYzVjE1aC0yVjguNWMwLS4yOC0uMjItLjUtLjUtLjVsLS41LjIyLS41LjVWMTVjMCAxLjEuOSAyIDIgMnMyLS45IDItMnYtNWgyeiIvPjwvc3ZnPg==';

  public isDragging = false;
  public empty = true;

  override get errorState(): boolean {
    const control = this.ngControl?.control || null;
    const form = this._parentForm || this._parentFormGroup || null;
    const matcher = this.errorStateMatcher || this._defaultErrorStateMatcher;

    return matcher.isErrorState(control, form);
  }

  @HostBinding() id = `ngx-mat-file-input-${FileInputComponent.nextId++}`;
  @HostBinding('attr.aria-describedby') describedBy = '';

  public setDescribedByIds(ids: string[]) {
    this.describedBy = ids.join(' ');
  }

  @Input()
  get displayMode(): 'classic' | 'dropzone' {
    return this._displayMode;
  }
  set displayMode(mode: 'classic' | 'dropzone') {
    this._displayMode = mode;
    this.updateHostClasses();
  }

  @Input()
  get value(): FileInput | null {
    return this.empty ? null : this._internalValue;
  }
  set value(fileInput: FileInput | null) {
    this._internalValue = fileInput;
    this.empty = !this._internalValue || !this._internalValue.files.length;

    this.updatePreviewUrls();
    this._onChange(this._internalValue);
    this.stateChanges.next();
  }

  @Input()
  get multiple(): boolean {
    return this._multiple;
  }
  set multiple(value: boolean | string) {
    this._multiple = coerceBooleanProperty(value);
    this.stateChanges.next();
  }

  @Input()
  get checkDuplicates(): boolean {
    return this._checkDuplicates;
  }
  set checkDuplicates(value: boolean | string) {
    this._checkDuplicates = coerceBooleanProperty(value);
  }

  @Input()
  get placeholder() {
    return this._placeholder;
  }
  set placeholder(plh) {
    this._placeholder = plh;
    this.stateChanges.next();
  }

  @Input()
  get required(): boolean {
    return this._required;
  }
  set required(req: boolean | string) {
    this._required = coerceBooleanProperty(req);
    this.stateChanges.next();
  }

  @HostBinding('class.mat-form-field-should-float')
  get shouldLabelFloat() {
    return (
      this.focused ||
      !this.empty ||
      this.placeholder !== undefined ||
      this._displayMode === 'dropzone'
    );
  }

  get isDisabled() {
    return this.disabled;
  }

  @Input()
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(dis: boolean | string) {
    this._disabled = coerceBooleanProperty(dis);
    this.setDisabledState(this._disabled);
    this.stateChanges.next();
  }

  get previewUrls(): string[] {
    return this._previewUrls;
  }

  private _onChange = (_: any) => {};
  private _onTouched = () => {};

  get fileNames() {
    return this._internalValue
      ? this._internalValue.fileNames
      : this.placeholder;
  }

  get shouldShowFileName(): boolean {
    return this.displayMode === 'classic' && !this.empty;
  }

  constructor() {
    const defaultErrorMatcher = inject(ErrorStateMatcher);
    const selfNgControl = inject(NgControl, { optional: true, self: true })!;
    const parentForm = inject(NgForm, { optional: true });
    const parentFormGroup = inject(FormGroupDirective, { optional: true });

    super(
      defaultErrorMatcher,
      parentForm,
      parentFormGroup,
      selfNgControl,
      new Subject<void>(),
    );

    this._defaultErrorStateMatcher = defaultErrorMatcher;
    this.ngControl = selfNgControl;
    this._parentForm = parentForm;
    this._parentFormGroup = parentFormGroup;

    if (this.ngControl != null) {
      this.ngControl.valueAccessor = this;
    }

    this.fm
      .monitor(this._elementRef.nativeElement, true)
      .subscribe((origin) => {
        this.focused = !!origin;
        this.stateChanges.next();
        this._cdr.markForCheck();
      });
  }

  @HostListener('click', ['$event'])
  public onContainerClick(event: MouseEvent) {
    if (
      (event.target as Element).tagName.toLowerCase() !== 'input' &&
      !this.disabled
    ) {
      this._elementRef.nativeElement.querySelector('input').focus();
      this.focused = true;
      this.open();
    }
  }

  public writeValue(obj: FileInput | null): void {
    this.value = obj;

    if (!obj || obj.files.length === 0) {
      const inputElement =
        this._elementRef.nativeElement.querySelector('input');
      if (inputElement) {
        inputElement.value = '';
      }
    }
  }

  public registerOnChange(fn: (_: any) => void): void {
    this._onChange = fn;
  }

  public registerOnTouched(fn: any): void {
    this._onTouched = fn;
  }

  public clear(event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.value = new FileInput([]);

    const inputElement = this._elementRef.nativeElement.querySelector('input');
    if (inputElement) {
      inputElement.value = null;
    }
  }

  @HostListener('change', ['$event'])
  change(event: Event) {
    const fileList: FileList | null = (<HTMLInputElement>event.target).files;
    if (!fileList) return;
    this.processFileSelection(fileList);
    (<HTMLInputElement>event.target).value = '';
  }

  @HostListener('dragover', ['$event'])
  onDragOver(event: DragEvent) {
    if (this._displayMode === 'dropzone' && !this.disabled) {
      event.preventDefault();
      event.stopPropagation();

      if (!this.isDragging) {
        this.isDragging = true;
        this.updateHostClasses();
        this.stateChanges.next();
      }
    }
  }

  @HostListener('dragleave', ['$event'])
  onDragLeave(event: DragEvent) {
    if (this._displayMode === 'dropzone') {
      event.preventDefault();
      event.stopPropagation();

      if (this.isDragging) {
        this.isDragging = false;
        this.updateHostClasses();
        this.stateChanges.next();
      }
    }
  }

  @HostListener('drop', ['$event'])
  onDrop(event: DragEvent) {
    if (this._displayMode === 'dropzone' && !this.disabled) {
      event.preventDefault();
      event.stopPropagation();

      this.isDragging = false;
      this.updateHostClasses();
      this.stateChanges.next();

      if (event.dataTransfer && event.dataTransfer.files.length > 0) {
        this.processFileSelection(event.dataTransfer.files);
      }
    }
  }

  private processFileSelection(fileList: FileList) {
    let newFiles = Array.from(fileList);
    let currentFiles = this._internalValue?.files || [];
    let filesToSet: File[] = [];

    if (this.multiple) {
      filesToSet = [...currentFiles];

      for (const newFile of newFiles) {
        let isDuplicate = false;

        if (this.checkDuplicates) {
          isDuplicate = currentFiles.some(
            (existingFile) =>
              existingFile.name === newFile.name &&
              existingFile.size === newFile.size &&
              existingFile.lastModified === newFile.lastModified,
          );
        }

        if (!isDuplicate) {
          filesToSet.push(newFile);
        } else {
          console.warn(`Duplicate file skipped: ${newFile.name}`);
        }
      }
    } else {
      filesToSet = newFiles.slice(0, 1);
    }

    this.value = new FileInput(filesToSet);
    this.stateChanges.next();
  }

  private updatePreviewUrls() {
    this._objectURLs.forEach((url) => URL.revokeObjectURL(url));
    this._objectURLs = [];

    if (this._internalValue?.files?.length) {
      this._previewUrls = this._internalValue.files.map((file) => {
        if (file.type.startsWith('image/')) {
          const url = URL.createObjectURL(file);
          this._objectURLs.push(url);
          return url;
        } else {
          return this.defaultIconBase64;
        }
      });
    } else {
      this._previewUrls = [];
    }
  }

  removeFile(index: number) {
    if (!this._internalValue?.files?.length) return;

    const updatedFiles = [...this._internalValue.files];
    updatedFiles.splice(index, 1);
    this.value = new FileInput(updatedFiles);
  }

  @HostListener('focusout')
  public blur() {
    this.focused = false;
    this._onTouched();
  }

  public setDisabledState(isDisabled: boolean): void {
    this._disabled = isDisabled;
    this._renderer.setProperty(
      this._elementRef.nativeElement,
      'disabled',
      isDisabled,
    );
    if (isDisabled) {
      this._renderer.addClass(
        this._elementRef.nativeElement,
        'file-input-disabled',
      );
    } else {
      this._renderer.removeClass(
        this._elementRef.nativeElement,
        'file-input-disabled',
      );
    }
  }

  private updateHostClasses() {
    const el = this._elementRef.nativeElement;

    if (this._displayMode === 'dropzone') {
      this._renderer.addClass(el, 'mode-dropzone');
    } else {
      this._renderer.removeClass(el, 'mode-dropzone');
    }

    if (this.isDragging) {
      this._renderer.addClass(el, 'drag-active');
    } else {
      this._renderer.removeClass(el, 'drag-active');
    }
  }

  public open() {
    if (!this.disabled) {
      this._elementRef.nativeElement.querySelector('input').click();
    }
  }

  ngOnInit() {
    this.updateHostClasses();

    if (this.ngControl) {
      this.updateErrorState();
    }
  }

  ngOnDestroy() {
    this._objectURLs.forEach((url) => URL.revokeObjectURL(url));
    this._objectURLs = [];
    this.stateChanges.complete();
    this.fm.stopMonitoring(this._elementRef.nativeElement);
  }

  ngDoCheck(): void {
    if (this.ngControl) {
      this.updateErrorState();
    }
  }
}
