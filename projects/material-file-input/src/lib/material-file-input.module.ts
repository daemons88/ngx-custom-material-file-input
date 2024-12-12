import { NgModule } from '@angular/core';
import { FileInputComponent } from './file-input/file-input.component';
import { FocusMonitor } from '@angular/cdk/a11y';
import { ByteFormatPipe } from './pipe/byte-format.pipe';
import { ErrorStateMatcher } from '@angular/material/core';

@NgModule({
  declarations: [FileInputComponent, ByteFormatPipe],
  providers: [FocusMonitor, ErrorStateMatcher],
  exports: [FileInputComponent, ByteFormatPipe],
})
export class MaterialFileInputModule {}
