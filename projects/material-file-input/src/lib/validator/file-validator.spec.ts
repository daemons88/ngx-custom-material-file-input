import { FormControl, ValidationErrors } from '@angular/forms';
import { FileInput } from '../models/file-input.model';
import { FileValidator } from './file-validator';

describe('FileValidator', () => {
  describe('maxContentSize', () => {
    it('should validate', () => {
      const data = new FileInput([new File(['test'], 'test.txt')]);
      const control = new FormControl(data, [FileValidator.maxContentSize(5)]);
      expect(control.value).toBe(data);
      expect(control.valid).toBeTruthy();
    });

    it('should validate with size equal', () => {
      const data = new FileInput([new File(['test'], 'test.txt')]);
      const control = new FormControl(data, [FileValidator.maxContentSize(4)]);
      expect(control.value).toBe(data);
      expect(control.valid).toBeTruthy();
    });

    it('should not validate', () => {
      const data = new FileInput([new File(['test'], 'test.txt')]);
      const control = new FormControl(data, [FileValidator.maxContentSize(3)]);
      expect(control.value).toBe(data);
      expect(control.valid).toBeFalsy();
    });

    it('should not validate, with "maxContentSize" error', () => {
      const data = new FileInput([new File(['test'], 'test.txt')]);
      const control = new FormControl(data, [FileValidator.maxContentSize(3)]);
      const errors: ValidationErrors | null =
        control.errors as ValidationErrors;
      const maxSizeError: { [key: string]: any } | null = errors[
        'maxContentSize'
      ] as { [key: string]: any };
      expect(maxSizeError).toEqual({
        actualSize: 4,
        maxSize: 3,
      });
      expect(control.hasError('maxContentSize')).toBeTruthy();
    });

    it('should validate with no files', () => {
      const control = new FormControl(undefined, [
        FileValidator.maxContentSize(3),
      ]);
      expect(control.value).toBe(null);
      expect(control.valid).toBeTruthy();
    });
  });

  describe('acceptedMimeTypes', () => {
    it('should validate with accepted MIME types', () => {
      const data = new FileInput([
        new File(['test'], 'test.pdf', { type: 'application/pdf' }),
      ]);
      const control = new FormControl(data, [
        FileValidator.acceptedMimeTypes(['image/jpeg', 'application/pdf']),
      ]);
      expect(control.value).toBe(data);
      expect(control.valid).toBeTruthy();
    });

    it('should not validate with non-accepted MIME type', () => {
      const data = new FileInput([
        new File(['test'], 'test.txt', { type: 'text/plain' }),
      ]);
      const control = new FormControl(data, [
        FileValidator.acceptedMimeTypes(['image/jpeg', 'application/pdf']),
      ]);
      expect(control.value).toBe(data);
      expect(control.valid).toBeFalsy();
    });

    it('should not validate with non-accepted MIME type, with "acceptedMimeTypes" error', () => {
      const data = new FileInput([
        new File(['test'], 'test.txt', { type: 'text/plain' }),
      ]);
      const control = new FormControl(data, [
        FileValidator.acceptedMimeTypes(['image/jpeg', 'application/pdf']),
      ]);
      const errors: ValidationErrors | null =
        control.errors as ValidationErrors;
      const acceptedMimeTypesError: { [key: string]: any } | null = errors[
        'acceptedMimeTypes'
      ] as { [key: string]: any };
      expect(acceptedMimeTypesError).toEqual({
        validTypes: ['image/jpeg', 'application/pdf'],
      });
      expect(control.hasError('acceptedMimeTypes')).toBeTruthy();
    });

    it('should validate with no files', () => {
      const control = new FormControl(undefined, [
        FileValidator.acceptedMimeTypes(['image/jpeg', 'application/pdf']),
      ]);
      expect(control.value).toBe(null);
      expect(control.valid).toBeTruthy();
    });
  });

  describe('minFileCount', () => {
    it('should validate with file count equal to minFileCount', () => {
      const data = new FileInput([
        new File(['test'], 'test.txt'),
        new File(['test'], 'test2.txt'),
      ]);
      const control = new FormControl(data, [FileValidator.minFileCount(2)]);
      expect(control.value).toBe(data);
      expect(control.valid).toBeTruthy();
    });

    it('should not validate with invalid file count', () => {
      const data = new FileInput([new File(['test'], 'test.txt')]);
      const control = new FormControl(data, [FileValidator.minFileCount(2)]);
      expect(control.value).toBe(data);
      expect(control.valid).toBeFalsy();
    });

    it('should not validate with invalid file count, with "minFileCount" error', () => {
      const data = new FileInput([new File(['test'], 'test.txt')]);
      const control = new FormControl(data, [FileValidator.minFileCount(2)]);
      const errors: ValidationErrors | null = control.errors as ValidationErrors;
      const minFileCountError: { [key: string]: any } | null = errors[
        'minFileCount'
      ] as { [key: string]: any };
      expect(minFileCountError).toEqual({
        actualCount: 1,
        minCount: 2,
      });
      expect(control.hasError('minFileCount')).toBeTruthy();
    });

    it('should validate with no files', () => {
      const control = new FormControl(undefined, [
        FileValidator.minFileCount(2),
      ]);
      
      expect(control.value).toBe(null);
      expect(control.valid).toBeFalsy();
      expect(control.hasError('minFileCount')).toBeTruthy();
    });
  });

  describe('maxFileCount', () => {
    it('should validate with file count equal to maxFileCount', () => {
      const data = new FileInput([
        new File(['test'], 'test.txt'),
        new File(['test'], 'test2.txt'),
      ]);
      const control = new FormControl(data, [FileValidator.maxFileCount(2)]);
      expect(control.value).toBe(data);
      expect(control.valid).toBeTruthy();
    });

    it('should not validate with invalid file count', () => {
      const data = new FileInput([
        new File(['test'], 'test.txt'),
        new File(['test'], 'test2.txt'),
        new File(['test'], 'test3.txt'),
      ]);
      const control = new FormControl(data, [FileValidator.maxFileCount(2)]);
      expect(control.value).toBe(data);
      expect(control.valid).toBeFalsy();
    });

    it('should not validate with invalid file count, with "maxFileCount" error', () => {
      const data = new FileInput([
        new File(['test'], 'test.txt'),
        new File(['test'], 'test2.txt'),
        new File(['test'], 'test3.txt'),
      ]);
      const control = new FormControl(data, [FileValidator.maxFileCount(2)]);
      const errors: ValidationErrors | null = control.errors as ValidationErrors;
      const maxFileCountError: { [key: string]: any } | null = errors[
        'maxFileCount'
      ] as { [key: string]: any };
      expect(maxFileCountError).toEqual({
        actualCount: 3,
        maxCount: 2,
      });
      expect(control.hasError('maxFileCount')).toBeTruthy();
    });

    it('should validate with no files', () => {
      const control = new FormControl(undefined, [
        FileValidator.maxFileCount(2),
      ]);
      expect(control.value).toBe(null);
      expect(control.valid).toBeTruthy();
      expect(control.hasError('maxFileCount')).toBeFalsy();
    });
  });
});
