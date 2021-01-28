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

import { Storage, UploadResponse } from '@google-cloud/storage';
import * as path from 'path';
import { getFiles } from './util';

/**
 * Wraps interactions with the the GCS library.
 *
 * @param storage The GCS Storage client.
 */
export class UploadHelper {
  readonly storage: Storage;
  /**
   * Create an UploadHelper.
   *
   * @param storage The GCS Storage client.
   */
  constructor(storage: Storage) {
    this.storage = storage;
  }

  /**
   * Uploads a file to a bucket. Based on
   * https://github.com/googleapis/nodejs-storage/blob/master/samples/uploadFile.js
   *
   * @param bucketName The name of the bucket.
   * @param filename The file path.
   * @param destination The destination prefix.
   * @returns The UploadResponse which contains the file and metadata.
   */
  async uploadFile(
    bucketName: string,
    filename: string,
    destination?: string,
  ): Promise<UploadResponse> {
    interface UploadOptions {
      gzip: boolean;
      destination?: string;
    }
    const options: UploadOptions = { gzip: true };
    if (destination) {
      // If obj prefix is set, then extract filename and append to prefix.
      options.destination = `${destination}/${path.posix.basename(filename)}`;
    }
    const uploadedFile = await this.storage
      .bucket(bucketName)
      .upload(filename, options);
    return uploadedFile;
  }

  /**
   * Uploads a specified directory to a GCS bucket. Based on
   * https://github.com/googleapis/nodejs-storage/blob/master/samples/uploadDirectory.js
   *
   * @param bucketName The name of the bucket.
   * @param directoryPath The path of the directory to upload.
   * @param objectKeyPrefix Optional Prefix for in the GCS bucket.
   * @param clearExistingFilesFirst Clean files in the prefix before uploading.
   * @returns The list of UploadResponses which contains the file and metadata.
   */
  async uploadDirectory(
    bucketName: string,
    directoryPath: string,
    prefix = '',
  ): Promise<UploadResponse[]> {
    const pathDirName = path.posix.dirname(directoryPath);
    // Get list of files in the directory.
    const filesList = await getFiles(directoryPath);

    const resp = await Promise.all(
      filesList.map(async (filePath) => {
        // Get relative path from directoryPath.
        let destination = `${path.posix.dirname(
          path.posix.relative(pathDirName, filePath),
        )}`;
        // If prefix is set, prepend.
        if (prefix) {
          destination = `${prefix}/${destination}`;
        }

        const uploadResp = await this.uploadFile(
          bucketName,
          filePath,
          destination,
        );
        return uploadResp;
      }),
    );
    return resp;
  }
}
