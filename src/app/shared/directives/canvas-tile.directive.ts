/**
 * Copyright 2020 Jim Armstrong (www.algorithmist.net)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Attribute directive to imbue a container such as a DIV with a Canvas into which tiles are drawn
 * and managed as part of the A* algorithm.
 *
 * @author Jim Armstrong (www.algorithmist.net)
 *
 * @version 1.0
 */

import * as PIXI from 'pixi.js/dist/pixi.js';

import {
  Directive,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  SimpleChange,
  SimpleChanges
} from '@angular/core';

import { Grid2D   } from '../libs/grid-2d';
import { GridView } from '../libs/grid-view';

import { AStarTiles } from '../libs/astar-tiles';
import { TileNode   } from '../libs/tile-node';
import { IGridSetup } from '../interfaces/grid-setup';

@Directive({
  selector: '[canvas-tile]'
})
export class CanvasTileDirective implements OnInit, OnChanges
{
  @Input()
  public cellWidth: number;

  // static PIXI options
  protected static OPTIONS: Object = {
    backgroundColor: 0xeeeeee,
    antialias: true
  };

  protected _domContainer: HTMLDivElement;        // DOM container for freehand strokes (DIV)
  protected _rect: ClientRect | DOMRect;

  // container width and height
  protected _width: number;
  protected _height: number;

  // number of grid rows/colums (computed from cell width)
  protected _rows: number;
  protected _cols: number;

  // PIXI app and stage references
  protected _app: PIXI.Application;
  protected _stage: PIXI.Container;

  // PIXI drawing
  protected _tiles: PIXI.Graphics;

  // 2D tile helpers
  protected _grid2D: Grid2D;
  protected _gridView: GridView;

  // A* for tiles
  protected _astar: AStarTiles;

  constructor(protected _elRef: ElementRef)
  {
    this._rows     = 0;
    this._cols     = 0;
    this.cellWidth = 5;

    this._astar = new AStarTiles();

    this._domContainer = <HTMLDivElement> this._elRef.nativeElement;
    this._rect         = this._domContainer.getBoundingClientRect();

    this._width  = this._elRef.nativeElement.clientWidth;
    this._height = this._elRef.nativeElement.clientHeight;

    this.__pixiSetup();
  }

  public ngOnInit(): void
  {
    // reserved for future use
  }

  public ngOnChanges(changes: SimpleChanges): void
  {
    let prop: string;
    let change: SimpleChange;

    for (prop in changes)
    {
      change = changes[prop];

      // add as much property validation as desired
      switch (prop)
      {
        case 'cellWidth':
          const c: number = +change.currentValue;
          this.cellWidth  = !isNaN(c) && c > 0 ? c : this.cellWidth;

          if (this.cellWidth > 0)
          {
            this._rows = Math.round(this._height / this.cellWidth);
            this._cols = Math.round(this._width / this.cellWidth);

            this._grid2D   = new Grid2D(this._rows, this._cols);
            this._gridView = new GridView(this.cellWidth);

            this._grid2D.gridView = this._gridView;

            this._gridView.drawDefaultGrid(this._tiles, this._rows, this._cols, 2, "0x000000", "0xebebeb");
          }
          break;
      }
    }
  }

  /**
   * Assign initial geometry to the {Grid2D} helper associated with this display
   *
   * @param fcn Function to set tile properties such as barriers, high-cost areas, and start/target cells
   */
  public assignGrid(fcn: IGridSetup): void
  {
    if (fcn !== undefined && fcn != null) {
      fcn(this._grid2D);
    }
  }

  /**
   * Display the optimal path
   */
  public showOptimalPath(): void
  {
    // this presumes all tile data has been assigned - no check at this point
    const path: Array<TileNode> = this._astar.findPath(this._grid2D);

    path.forEach( (node: TileNode): void => {
      this._grid2D.isOccupied(node.row, node.col, true);
    });
  }

  protected __pixiSetup(): void
  {
    const options = Object.assign({width: this._width, height: this._height}, CanvasTileDirective.OPTIONS);

    this._app = new PIXI.Application(options);

    this._domContainer.appendChild(this._app.view);

    this._stage = this._app.stage;
    this._tiles = new PIXI.Graphics();

    this._stage.addChild(this._tiles);
  }
}
