/*
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * Directory walk helper
 * @param directory The path of the directory to traverse
 * @param fileList  The files within the directory
 */
export async function getFiles(
  directory: string,
  fileList: string[] = [],
): Promise<string[]> {
  const items = await fs.promises.readdir(directory);
  for (const item of items) {
    const stat = await fs.promises.stat(path.posix.join(directory, item));
    if (stat.isDirectory())
      fileList = await getFiles(path.posix.join(directory, item), fileList);
    else fileList.push(path.posix.join(directory, item));
  }
  return fileList;
}
