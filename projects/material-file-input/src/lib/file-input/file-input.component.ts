import { Component, OnInit, Input, ElementRef, OnDestroy, HostBinding, Renderer2, HostListener, Optional, Self, DoCheck } from '@angular/core';
import { ControlValueAccessor, NgControl, NgForm, FormGroupDirective } from '@angular/forms';
import { MatFormFieldControl } from "@angular/material/form-field";
import { ErrorStateMatcher } from '@angular/material/core';
import { coerceBooleanProperty } from "@angular/cdk/coercion";
import { FocusMonitor } from '@angular/cdk/a11y';
import { FileInputBase } from './file-input.base';
import { FileInput } from '../models/file-input.model';
import { Subject } from 'rxjs/internal/Subject';

@Component({
    selector: 'ngx-mat-file-input',
    templateUrl: './file-input.component.html',
    styleUrls: ['./file-input.component.css'],
    providers: [{ provide: MatFormFieldControl, useExisting: FileInputComponent }],
    standalone: false
})
export class FileInputComponent extends FileInputBase implements MatFormFieldControl<FileInput>, ControlValueAccessor, OnInit, OnDestroy, DoCheck {
  static nextId = 0;

  focused = false;
  controlType = 'file-input';

  @Input() autofilled = false;

  private _placeholder: string;
  private _required = false;
  private _multiple = false;
  private _previewUrls: string[] = [];
  private _objectURLs: string[] = [];

  @Input() valuePlaceholder: string;
  @Input() accept: string | null = null;
  @Input() errorStateMatcher: ErrorStateMatcher;
  @Input() defaultIconBase64: string = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjI0Ij48cGF0aCBkPSJNMCAwaDI0djI0SDBWMHoiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJNMTUgMkg2Yy0xLjEgMC0yIC45LTIgMnYxNmMwIDEuMS45IDIgMiAyaDEyYzEuMSAwIDItLjkgMi0yVjdsLTUtNXpNNiAyMFY0aDh2NGg0djEySDZ6bTEwLTEwdjVjMCAyLjIxLTEuNzkgNC00IDRzLTQtMS43OS00LTRWOC41YzAtMS40NyAxLjI2LTIuNjQgMi43Ni0yLjQ5IDEuMy4xMyAyLjI0IDEuMzIgMi4yNCAyLjYzVjE1aC0yVjguNWMwLS4yOC0uMjItLjUtLjUtLjVzLS41LjIyLS41LjVWMTVjMCAxLjEuOSAyIDIgMnMyLS45IDItMnYtNWgyeiIvPjwvc3ZnPg==';

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
  get value(): FileInput | null {
    return this.empty ? null : new FileInput(this._elementRef.nativeElement.value || []);
  }

  set value(fileInput: FileInput | null) {
    if (fileInput) {
      this.writeValue(fileInput);
      this.stateChanges.next();
    }
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
  get placeholder() {
    return this._placeholder;
  }
  set placeholder(plh) {
    this._placeholder = plh;
    this.stateChanges.next();
  }

  /**
   * Whether the current input has files
   */
  get empty() {
    return !this._elementRef.nativeElement.value || this._elementRef.nativeElement.value.length === 0;
  }

  @HostBinding('class.mat-form-field-should-float')
  get shouldLabelFloat() {
    return this.focused || !this.empty || this.valuePlaceholder !== undefined;
  }

  @Input()
  get required(): boolean {
    return this._required;
  }
  set required(req: boolean | string) {
    this._required = coerceBooleanProperty(req);
    this.stateChanges.next();
  }

  @HostBinding('class.file-input-disabled')
  get isDisabled() {
    return this.disabled;
  }
  @Input()
  get disabled(): boolean {
    return this._elementRef.nativeElement.disabled;
  }
  set disabled(dis: boolean | string) {
    this.setDisabledState(coerceBooleanProperty(dis));
    this.stateChanges.next();
  }

  get previewUrls(): string[] {
    return this._previewUrls;
  }

  public onContainerClick(event: MouseEvent) {
    if ((event.target as Element).tagName.toLowerCase() !== 'input' && !this.disabled) {
      this._elementRef.nativeElement.querySelector('input').focus();
      this.focused = true;
      this.open();
    }
  }

  /**
   * @see https://angular.io/api/forms/ControlValueAccessor
   */
  constructor(
    private fm: FocusMonitor,
    private _elementRef: ElementRef,
    private _renderer: Renderer2,
    public override _defaultErrorStateMatcher: ErrorStateMatcher,
    @Optional()
    @Self()
    public override ngControl: NgControl,
    @Optional() public override _parentForm: NgForm,
    @Optional() public override _parentFormGroup: FormGroupDirective,
  ) {
    super(_defaultErrorStateMatcher, _parentForm, _parentFormGroup, ngControl, new Subject<void>())

    if (this.ngControl != null) {
      this.ngControl.valueAccessor = this;
    }
    fm.monitor(_elementRef.nativeElement, true).subscribe(origin => {
      this.focused = !!origin;
      this.stateChanges.next();
    });
  }

  private _onChange = (_: any) => {};
  private _onTouched = () => {};

  get fileNames() {
    return this.value ? this.value.fileNames : this.valuePlaceholder;
  }

  public writeValue(obj: FileInput | null): void {
    this._renderer.setProperty(this._elementRef.nativeElement, 'value', obj instanceof FileInput ? obj.files : null);
  }

  public registerOnChange(fn: (_: any) => void): void {
    this._onChange = fn;
  }

  public registerOnTouched(fn: any): void {
    this._onTouched = fn;
  }

  /**
   * Remove all files from the file input component
   * @param [event] optional event that may have triggered the clear action
   */
  public clear(event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.value = new FileInput([]);
    this._previewUrls = [];
    this._elementRef.nativeElement.querySelector('input').value = null;
    this._onChange(this.value);
  }

  @HostListener('change', ['$event'])
  change(event: Event) {
    const fileList: FileList | null = (<HTMLInputElement>event.target).files;
  
    if (!fileList) return;
  
    if (this.multiple) {
      const existingFiles = this.value?.files || [];
      const newFiles: File[] = [];
  
      for (let i = 0; i < fileList.length; i++) {
        newFiles.push(fileList[i]);
      }
  
      const updatedFiles = [...existingFiles, ...newFiles];
      this.value = new FileInput(updatedFiles);
    } else {
      this.value = new FileInput(Array.from(fileList));
    }
  
    this._onChange(this.value);
    this.updatePreviewUrls();
  }

  private updatePreviewUrls() {
    this._objectURLs = [];
    if (this.value?.files?.length) {
      this._previewUrls = this.value.files.map((file) => {
        const isImage = file.type.startsWith('image/');
        if (isImage) {
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

  private revokeObjectURLs() {
    this._objectURLs.forEach((url) => URL.revokeObjectURL(url));
    this._objectURLs = [];
  }

  removeFile(index: number) {
    if (!this.value?.files?.length) return;

    const updatedFiles = [...this.value.files];
    updatedFiles.splice(index, 1);
    this.value = new FileInput(updatedFiles);
    this._onChange(this.value);
    this.updatePreviewUrls();
  }

  @HostListener('focusout')
  public blur() {
    this.focused = false;
    this._onTouched();
  }

  public setDisabledState(isDisabled: boolean): void {
    this._renderer.setProperty(this._elementRef.nativeElement, 'disabled', isDisabled);
  }

  private open() {
    if (!this.disabled) {
      this._elementRef.nativeElement.querySelector('input').click();
    }
  }

  ngOnInit() {
    this.multiple = coerceBooleanProperty(this.multiple);
  }

  ngOnDestroy() {
    this.revokeObjectURLs();
    this.stateChanges.complete();
    this.fm.stopMonitoring(this._elementRef.nativeElement);
  }

  ngDoCheck(): void {
    if (this.ngControl) {
      // We need to re-evaluate this on every change detection cycle, because there are some
      // error triggers that we can't subscribe to (e.g. parent form submissions). This means
      // that whatever logic is in here has to be super lean or we risk destroying the performance.
      this.updateErrorState();
    }
  }
}
