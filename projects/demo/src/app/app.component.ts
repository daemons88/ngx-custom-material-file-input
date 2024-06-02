import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FileValidator } from 'ngx-custom-material-file-input';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  private readonly validFileTypes = ['image/jpeg', 'image/png'];
  private readonly maxSizeBytes = 2097152; // 2 MB
  public demoForm: FormGroup;

  title = 'demo';

  constructor(private formBuilder: FormBuilder) {
    this.demoForm = this.formBuilder.group({
      basicfile: [
        '',
        [
          Validators.required,
          FileValidator.maxContentSize(this.maxSizeBytes),
          FileValidator.acceptedMimeTypes(this.validFileTypes),
        ],
      ],
    });
  }

  get basicfile() {
    return this.demoForm.get('basicfile');
  }
}
