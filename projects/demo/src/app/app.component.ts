import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FileValidator } from 'ngx-custom-material-file-input';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    standalone: false
})
export class AppComponent {
  private readonly validFileTypes = ['image/jpeg', 'image/png'];
  private readonly maxSizeBytes = 2097152; // 2 MB
  public readonly minFiles = 1;
  public readonly maxFiles = 2;
  public demoForm: FormGroup;

  title = 'demo';

  constructor(private formBuilder: FormBuilder) {
    this.demoForm = this.formBuilder.group({
      basicfile: [
        '',
        [
          Validators.required,
          FileValidator.maxContentSize(this.maxSizeBytes),
          FileValidator.acceptedMimeTypes(this.validFileTypes)
        ],
      ],
      multiplefile: [
        '',
        [
          FileValidator.minFileCount(this.minFiles),
          FileValidator.maxFileCount(this.maxFiles)
        ]
      ]
    });
  }

  get basicfile() {
    return this.demoForm.get('basicfile');
  }

  get multiplefile() {
    return this.demoForm.get('multiplefile');
  }
}
