import { ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { FileInput } from '../models/file-input.model';

export class FileValidator {
  /**
   * Function to control content of files
   *
   * @param bytes max number of bytes allowed
   *
   * @returns Validator function
   */
  static maxContentSize(bytes: number): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const size =
        control && control.value && control.value.files
          ? (control.value as FileInput).files
              .map((file) => file.size)
              .reduce((acc, fileSize) => acc + fileSize, 0)
          : 0;

      const isValid = bytes >= size;

      return isValid
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

  /**
   * Validator function to validate the min number of uploaded files
   *
   * @param minCount Number of minimum files to upload
   * @returns Validator function
   */
  static minFileCount(minCount: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return {
          minFileCount: {
            minCount: minCount,
            actualCount: 0
          }
        };
      }

      const files: File[] = (control.value as FileInput).files;

      if (files && files.length < minCount) {
        return {
          minFileCount: {
            minCount: minCount,
            actualCount: files.length
          }
        };
      }

      return null;
    };
  }

  /**
   * Validator function to validate the max number of uploaded files
   *
   * @param maxCount Number of maximum files to upload
   * @returns Validator function
   */
  static maxFileCount(maxCount: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const files: File[] = control.value ? (control.value as FileInput).files : [];

      if (files && files.length > maxCount) {
        return {
          maxFileCount: {
            maxCount: maxCount,
            actualCount: files.length
          }
        };
      }

      return null;
    };
  }
}
