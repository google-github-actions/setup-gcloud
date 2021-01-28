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
import { UploadHelper } from './upload-helper';
import { Storage, UploadResponse } from '@google-cloud/storage';

/**
 * Available options to create the client.
 *
 * @param credentials GCP JSON credentials (default uses ADC).
 */

type ClientOptions = {
  credentials?: string;
};

/**
 * Handles credential lookup, registration and wraps interactions with the GCS
 * Helper.
 *
 * @param opts List of ClientOptions.
 */
export class Client {
  readonly storage: Storage;
  constructor(opts?: ClientOptions) {
    if (opts?.credentials) {
      // If the credentials are not JSON, they are probably base64-encoded. Even
      // though we don't instruct users to provide base64-encoded credentials,
      // sometimes they still do.
      if (!opts.credentials.trim().startsWith('{')) {
        const creds = opts.credentials;
        opts.credentials = Buffer.from(creds, 'base64').toString('utf8');
      }
      const creds = JSON.parse(opts.credentials);
      this.storage = new Storage({ credentials: creds });
    } else {
      this.storage = new Storage();
    }
  }
  /**
   * Invokes GCS Helper for uploading file or directory.
   * @param bucketName Name of bucket to upload file/dir.
   * @param path Path of the file/dir to upload.
   * @param prefix Optional prefix when uploading to GCS.
   * @returns List of uploaded file(s).
   */
  async upload(destination: string, path: string): Promise<UploadResponse[]> {
    let bucketName = destination;
    let prefix = '';
    // If destination of the form my-bucket/subfolder get bucket and prefix.
    const idx = destination.indexOf('/');
    if (idx > -1) {
      bucketName = destination.substring(0, idx);
      prefix = destination.substring(idx + 1);
    }

    const stat = await fs.promises.stat(path);
    const uploader = new UploadHelper(this.storage);
    if (stat.isFile()) {
      const uploadedFile = await uploader.uploadFile(bucketName, path, prefix);
      return [uploadedFile];
    } else {
      const uploadedFiles = await uploader.uploadDirectory(
        bucketName,
        path,
        prefix,
      );
      return uploadedFiles;
    }
  }
}
