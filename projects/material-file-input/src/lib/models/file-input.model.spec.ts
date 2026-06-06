import { FileInput } from './file-input.model';

describe('FileInput', () => {
  let model: FileInput;

  it('should have empty fileName (empty array)', () => {
    model = new FileInput([]);
    expect(model.fileNames).toBe('');
  });

  it('should have empty fileName (null)', () => {
    model = new FileInput(null);
    expect(model.fileNames).toBe('');
  });

  it('should return the exact file name if only one file is present', () => {
    const file = new File([''], 'resume.pdf', { type: 'application/pdf' });
    model = new FileInput([file]);

    expect(model.fileNames).toBe('resume.pdf');
    expect(model.files.length).toBe(1);
  });

  it('should return a summarized phrase if multiple files are present', () => {
    const file1 = new File([''], 'resume.pdf', { type: 'application/pdf' });
    const file2 = new File([''], 'cover-letter.docx');
    const file3 = new File([''], 'photo.jpg');

    model = new FileInput([file1, file2, file3]);

    expect(model.fileNames).toBe('resume.pdf (+2 more files)');
    expect(model.files.length).toBe(3);
  });
});
