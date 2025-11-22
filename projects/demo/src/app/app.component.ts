import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FileInputComponent, FileValidator, ByteFormatPipe } from 'ngx-custom-material-file-input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    standalone: true,
    imports: [
      ReactiveFormsModule,
      FileInputComponent,
      MatFormFieldModule,
      ByteFormatPipe,
      MatIconModule,
      MatButtonModule,
      MatInputModule
    ]
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
