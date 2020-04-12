/**
 * Copyright 2016 Jim Armstrong (www.algorithmist.net)
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
 * This is a specific implementation of a grid setup function that assigns non-open tiles
 *
 * @author Jim Armstrong (www.algorithmist.net)
 *
 * @version 1.0
 */

import { Grid2D } from '../grid-2d';

export function grid1(grid: Grid2D): void
{
  let i: number;
  let j: number = 10;

  for (i = 0; i < 20; ++i)
  {
    grid.isReachable(i, j, false);
    grid.isReachable(i, j+1, false);
  }

  i = 30;
  for (j = 0; j < 15; ++j) {
    grid.isReachable(i, j, false);
  }

  i = 18;
  for (j = 21; j < 30; ++j)
  {
    grid.isReachable(i, j, false);
    grid.isReachable(i+1, j, false);
    grid.isReachable(i+2, j, false);
    grid.isReachable(i+3, j, false);
  }

  i = 32;
  for (j = 21; j < 28; ++j)
  {
    grid.isReachable(i, j, false);
    grid.isReachable(i+1, j, false);
    grid.isReachable(i+2, j, false);
  }

  // some high-cost areas
  grid.isHazard(20, 15, 1.2);
  grid.isHazard(20, 16, 1.2);
  grid.isHazard(20, 17, 1.5);
  grid.isHazard(21, 16, 1.2);
  grid.isHazard(21, 17, 1.1);
  grid.isHazard(22, 17, 1.25);

  // and, the start/end tiles
  grid.setStartNode(3,2);
  grid.setTargetNode(9, 26);
};
