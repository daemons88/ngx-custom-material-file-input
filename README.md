[![npm version](https://badge.fury.io/js/ngx-custom-material-file-input.svg)](https://badge.fury.io/js/ngx-custom-material-file-input)
[![npm](https://img.shields.io/npm/dt/ngx-custom-material-file-input.svg)](https://www.npmjs.com/package/ngx-custom-material-file-input)
[![Known Vulnerabilities](https://snyk.io/test/github/daemons88/ngx-custom-material-file-input/badge.svg)](https://snyk.io/test/github/daemons88/ngx-custom-material-file-input)

# ngx-custom-material-file-input

This project is a copy of [ngx-material-file-input](https://github.com/merlosy/ngx-material-file-input), this was made from angular 14 as a new project, only what was necessary was added and is already updated.

| Library Version | Angular Version |
|-----------------|-----------------|
| 1.0.0           | 14.0.0          |
| 2.0.0           | 15.0.0          |
| 3.0.0           | 16.0.0          |
| 4.0.0           | 17.0.0          |
| 18.0.0          | 18.0.0          |

From now on, the package version will be the same as the Angular version so I don't have to update the table all the time. In this version 18, a new validator for MIME types was added, an example was added in the release notes.

- Latest version is using **Angular 19**

# material-file-input

This project provides :

* `ngx-mat-file-input` component, to use inside Angular Material `mat-form-field`
* a `FileValidator` with `acceptedMimeTypes`, to limit the format types using the mime types
* a `FileValidator` with `maxContentSize`, to limit the file size
* a `ByteFormatPipe` to format the file size in a human-readable format
* a `previewUrls` to receive the images/file as a url to show in a preview

For more code samples, have a look at the [DEMO SITE](https://merlosy.github.io/ngx-material-file-input)
or in the [release notes](https://github.com/daemons88/ngx-custom-material-file-input/releases). 

## Install

```
npm i ngx-custom-material-file-input
```

## API reference

### MaterialFileInputModule

```ts
import { MaterialFileInputModule } from 'ngx-custom-material-file-input';

@NgModule({
  imports: [
    // the module for this lib
    MaterialFileInputModule
  ]
})
```

#### NGX_MAT_FILE_INPUT_CONFIG token (optional):

Change the unit of the ByteFormat pipe

```ts
export const config: FileInputConfig = {
  sizeUnit: 'Octet'
};

// add with module injection
providers: [{ provide: NGX_MAT_FILE_INPUT_CONFIG, useValue: config }];
```

### FileInputComponent

selector: `<ngx-mat-file-input>`

implements: [MatFormFieldControl](https://material.angular.io/components/form-field/api#MatFormFieldControl)<FileInput> from Angular Material

**Additionnal properties**

| Name                                   | Description                                                                                                                 |
| -------------------------------------  | --------------------------------------------------------------------------------------------------------------------------- |
| _@Input()_ valuePlaceholder: `string`  | Placeholder for file names, empty by default                                                                                |
| _@Input()_ multiple: `boolean`         | Allows multiple file inputs, `false` by default                                                                             |
| _@Input()_ autofilled: `boolean`       | Whether the input is currently in an autofilled state. If property is not present on the control it is assumed to be false. |
| _@Input()_ accept: `string`            | Any value that `accept` attribute can get. [more about "accept"](https://www.w3schools.com/tags/att_input_accept.asp)       |
| value: `FileInput`                     | Form control value                                                                                                          |
| empty: `boolean`                       | Whether the input is empty (no files) or not                                                                                |
| clear(): `(event?) => void`            | Removes all files from the input                                                                                            |
| previewUrls: `string[]`                | Contains a generate url in memory to show the previews of the files                                                         |
| _@Input()_ defaultIconBase64: `string` | Set the default icon for the previews of files that are not images, is a base64 string, example: data:image/svg+xml;base64,PHN2ZyB.....                                                                                            |

### ByteFormatPipe

**Example**

```html
<span>{{ 104857600 | byteFormat }}</span>
```

_Output:_ 100 MB

### FileValidator

| Name                                           | Description                                     | Error structure                           |
| ---------------------------------------------- | ----------------------------------------------- | ----------------------------------------- |
| maxContentSize(value: `number`): `ValidatorFn` | Limit the total file(s) size to the given value | `{ actualSize: number, maxSize: number }` |
| acceptedMimeTypes(value: `string`): `ValidatorFn` | Limit the mime types valid to use given value | `{ validTypes: string }` |
