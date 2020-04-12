import {
  AfterViewInit,
  Component,
  ViewChild
} from '@angular/core';

import { CanvasTileDirective } from './shared/directives/canvas-tile.directive';

import { grid1 } from './shared/libs/grids/grid1';

@Component({
  selector: 'app-root',

  templateUrl: './app.component.html',

  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit
{
  @ViewChild(CanvasTileDirective, {static: true})
  private _tiles: CanvasTileDirective;

  constructor()
  {
    // empty
  }

  public ngAfterViewInit(): void
  {
    this._tiles.assignGrid(grid1);
  }

  public onPathSelected(): void
  {
    this._tiles.showOptimalPath();
  }
}
