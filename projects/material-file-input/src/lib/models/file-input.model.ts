/**
 * The files to be uploaded
 */
export class FileInput {
  private _fileNames: string;

  constructor(
    private _files: File[] | null,
    private delimiter: string = ', ',
  ) {
    this._fileNames = this.generateFileNamesSummary();
  }

  get files() {
    return this._files || [];
  }

  get fileNames(): string {
    return this._fileNames;
  }

  /**
   * Generates a clean, single-line string summary of the selected files.
   * If multiple files are added, it avoids vertical layout breaking by
   * showing the first file name and a counter for the remaining ones.
   */
  private generateFileNamesSummary(): string {
    const fileArray = this.files;

    if (fileArray.length === 0) {
      return '';
    }

    if (fileArray.length > 1) {
      return `${fileArray[0].name} (+${fileArray.length - 1} more files)`;
    }

    return fileArray[0].name;
  }
}
