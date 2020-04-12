import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent        } from './app.component';
import { CanvasTileDirective } from './shared/directives/canvas-tile.directive';

@NgModule({
  declarations: [
    AppComponent,
    CanvasTileDirective
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
