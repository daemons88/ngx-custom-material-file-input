import { FormGroupDirective, NgControl, NgForm } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { Subject } from 'rxjs';

/** Base class for error state management */
export class FileInputBase {
  private _errorState = false;

  constructor(
    public _defaultErrorStateMatcher: ErrorStateMatcher,
    public _parentForm: NgForm | null,
    public _parentFormGroup: FormGroupDirective | null,
    public ngControl: NgControl,
    public stateChanges: Subject<void>
  ) {}

  /** Determines whether the control is in an error state */
  get errorState(): boolean {
    const control = this.ngControl?.control || null; 
    const form = this._parentForm || this._parentFormGroup || null;

    return this._defaultErrorStateMatcher.isErrorState(control, form);
  }

  /** Triggers error state update */
  updateErrorState() {
    const previousState = this._errorState;
    this._errorState = this.errorState;

    if (previousState !== this._errorState) {
      this.stateChanges.next();
    }
  }
}
