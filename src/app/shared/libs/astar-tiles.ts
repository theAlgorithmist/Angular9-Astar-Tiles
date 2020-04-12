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
 *
 * This software is derived from that bearing the following copyright notice
 *
 * ------
 * copyright (c) 2012, Jim Armstrong.  All Rights Reserved.
 *
 * THIS SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 * This software may be modified for commercial use as long as the above copyright notice remains intact.
 */

import { TileNode } from './tile-node';

import { Grid2D } from './grid-2d';

export interface IHeuristic
{
  (node: TileNode, target: TileNode): number;
}

/**
 * A more or less textbook implementation of A* with a 2d grid of tiles (or nodes).  The code supports injectable
 * heuristics and is written for the needs of typical online or device-based gaming applications.  Every attempt has
 * been made to make variables names and general code structure conform to popular online tutorials on the topic.  The
 * hope is that this code has some Rosetta Code value for those wishing to compare Typescript to other languages.  It
 * also serves as a good testbed for those wishing to learn the basics of A* for tiles.
 *
 * @author Jim Armstrong (www.algorithmist.net)
 *
 * @version 1.0
 */
export class AStarTiles
{
  // the infamous open and closed lists
  protected _openList: Array<TileNode>;
  protected _closedList: Array<TileNode>;

  // start and target nodes
  protected _startNode: TileNode | null;
  protected _targetNode: TileNode | null;

  // Specific heuristic to guide the search
  protected _heuristic: IHeuristic;

  constructor()
  {
    this._openList   = new Array<TileNode>();
    this._closedList = new Array<TileNode>();

    // start and target nodes for a search
    this._startNode  = null;
    this._targetNode = null;

    // heuristic
    this._heuristic = this.__diagonal;
  }

  /**
   * Assign the heuristic to compute cost between two nodes
   *
   * @param {IHeuristic} f Function reference that takes a current node and a target node as arguments, i.e. (node, target)
   * and returns a numerical cost metric.
   */
  public set heuristic(f: IHeuristic)
  {
    if (f !== undefined && f != null) {
      this._heuristic = f;
    }
  }

  /**
   * Find the optimal path from a specified start node to a specified target node across the supplied grid and return
   * an array of {TileNode} references that represent the path.  Array is empty is no path exists.
   *
   * @param {Grid2D} grid Reference to a 2D grid of {TileNodes}.  All tile characteristics should be set in advance, otherwise
   * tiles default to open.
   *
   */
  public findPath(grid: Grid2D): Array<TileNode>
  {
    // reset lists
    this._openList.length = 0;
    this._closedList.length = 0;

    // set the internal start/target node references
    this._startNode = grid.startNode;
    this._targetNode = grid.targetNode;

    // set the f/g/h properties
    this._startNode.g = 0;
    this._startNode.h = this._heuristic(this._startNode, this._targetNode);
    this._startNode.f = this._startNode.g + this._startNode.h;

    let node: TileNode = this._startNode;

    let i: number;
    let j: number;

    let iStart: number;
    let iEnd: number;
    let jStart: number;
    let jEnd: number;
    let temp: TileNode;
    let cost: number;
    let f: number;
    let g: number;
    let h: number;

    while (node !== this._targetNode)
    {
      iStart = Math.max(0, node.row - 1);
      iEnd = Math.min(grid.numRows - 1, node.row + 1);

      jStart = Math.max(0, node.col - 1);
      jEnd = Math.min(grid.numCols - 1, node.col + 1);

      for (i = iStart; i <= iEnd; ++i)
      {
        for (j = jStart; j <= jEnd; ++j)
        {
          temp = grid.getNode(i, j);

          // compensate for going around the edges of an unreachable region
          if (temp === node ||
            !temp.reachable ||
            !grid.getNode(node.row, temp.col).reachable ||
            !grid.getNode(temp.row, node.col).reachable)
            continue;

          cost = 1.0;
          if (!((node.row == temp.row) || (node.col == temp.col))) {
            cost = Math.SQRT2;
          }

          g = node.g + cost * temp.multiplier;
          h = this._heuristic(temp, this._targetNode);
          f = g + h;

          if (this.__isInOpenList(temp) || this.__isInClosedList(temp))
          {
            if (temp.f > f)
            {
              temp.parent = node;

              temp.f = f;
              temp.g = g;
              temp.h = h;
            }
          }
          else
          {
            temp.parent = node;

            temp.f = f;
            temp.g = g;
            temp.h = h;

            this._openList.push(temp);
          }
        }
      }

      this._closedList.push(node);

      if (this._openList.length == 0) {
        return [];
      }

      // sort on the 'f' property
      this._openList.sort((a: TileNode, b: TileNode): number => {
        return a.f == b.f ? 0 : a.f > b.f ? 1 : -1;
      });

      node = this._openList.shift();
    }

    // an optimal path must exist; load it into a return array in the desired order
    const path: Array<TileNode> = new Array<TileNode>();
    node = this._targetNode;
    path.push(node);

    while (node !== this._startNode)
    {
      node = node.parent;
      path.unshift(node);
    }

    return path;
  }

  protected __isInOpenList(node: TileNode): boolean
  {
    let i: number;
    const len: number = this._openList.length;

    for (i = 0; i < len; ++i)
    {
      if (this._openList[i] == node) {
        return true;
      }
    }

    return false;
  }

  protected __isInClosedList(node: TileNode): boolean
  {
    let i: number;
    const len: number = this._closedList.length;

    for (i = 0; i < len; ++i)
    {
      if (this._closedList[i] == node) {
        return true;
      }
    }

    return false;
  }

  // so that we have at least one established heuristic ...
  protected __diagonal(node: TileNode, target: TileNode): number
  {
    // TileNodes use a matrix row-column means to define location, so the column index is the x-coordinate
    // and the row index is the y-coordinate for cost heuristics
    const dx: number = Math.abs(node.col - target.col);
    const dy: number = Math.abs(node.row - target.row);

    const diagonal: number = Math.min(dx, dy);
    const straight: number = dx + dy;

    return straight + (Math.SQRT2 - 2.0) * diagonal;
  }
}
