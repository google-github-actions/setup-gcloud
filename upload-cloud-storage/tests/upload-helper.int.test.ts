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

import { expect } from 'chai';
import 'mocha';
import { UploadHelper } from '../src/upload-helper';
import { Storage } from '@google-cloud/storage';

const testBucket = process.env.UPLOAD_CLOUD_STORAGE_TEST_BUCKET;

describe('Integration Upload Helper', function() {
  it('uploads a single file', async function() {
    if (!testBucket) {
      this.skip();
    }

    const uploader = new UploadHelper(new Storage());
    const uploadResponse = await uploader.uploadFile(
      testBucket,
      './tests/testdata/test1.txt',
    );
    expect(uploadResponse[0].name).eql('test1.txt');
  });

  it('uploads a single file with prefix', async function() {
    if (!testBucket) {
      this.skip();
    }

    const uploader = new UploadHelper(new Storage());
    const uploadResponse = await uploader.uploadFile(
      testBucket,
      './tests/testdata/test1.txt',
      'testprefix',
    );
    expect(uploadResponse[0].name).eql('testprefix/test1.txt');
  });

  it('uploads a single file without extension', async function() {
    if (!testBucket) {
      this.skip();
    }

    const uploader = new UploadHelper(new Storage());
    const uploadResponse = await uploader.uploadFile(
      testBucket,
      './tests/testdata/testfile',
      'testprefix',
    );
    expect(uploadResponse[0].name).eql('testprefix/testfile');
  });

  it('uploads a single file with non ascii filename 🚀', async function() {
    if (!testBucket) {
      this.skip();
    }

    const uploader = new UploadHelper(new Storage());
    const uploadResponse = await uploader.uploadFile(
      testBucket,
      './tests/testdata/🚀',
      'testprefix',
    );
    expect(uploadResponse[0].name).eql('testprefix/🚀');
  });
});
