import { ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { FileInput } from '../models/file-input.model';

export class FileValidator {
  /**
   * Function to control content of files
   *
   * @param bytes max number of bytes allowed
   *
   * @returns
   */
  static maxContentSize(bytes: number): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const size =
        control && control.value
          ? (control.value as FileInput).files
              .map((f) => f.size)
              .reduce((acc, i) => acc + i, 0)
          : 0;
      const condition = bytes >= size;
      return condition
        ? null
        : {
            maxContentSize: {
              actualSize: size,
              maxSize: bytes,
            },
          };
    };
  }


  /**
   * Validator function to validate accepted file formats
   *
   * @param acceptedMimeTypes Array of accepted MIME types (e.g., ['image/jpeg', 'application/pdf'])
   * @returns Validator function
   */
  static acceptedMimeTypes(acceptedMimeTypes: string[]): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const files: File[] = control.value ? (control.value as FileInput).files : [];
      const invalidFiles: File[] = files.filter(file => !acceptedMimeTypes.includes(file.type));
      
      if (invalidFiles.length > 0) {
        return {
          acceptedMimeTypes: {
            validTypes: acceptedMimeTypes
          }
        };
      }
      
      return null;
    };
  }
}
