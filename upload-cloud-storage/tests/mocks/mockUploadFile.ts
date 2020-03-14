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

import { UploadResponse, File, Bucket, Storage } from '@google-cloud/storage';
import * as path from 'path';

export async function mockUploadFile(
  bucketName: string,
  filename: string,
  destination?: string,
): Promise<UploadResponse> {
  let fileName: string = path.posix.basename(filename);
  if (destination) {
    // if obj prefix is set, then extract filename and append to prefix
    fileName = `${destination}/${path.posix.basename(filename)}`;
  }
  const file: File = new File(new Bucket(new Storage(), 'foo'), fileName);

  return Promise.resolve([file, { name: fileName }]);
}
