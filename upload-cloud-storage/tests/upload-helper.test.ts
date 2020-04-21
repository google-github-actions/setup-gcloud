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
import * as sinon from 'sinon';
import { UploadHelper } from '../src/upload-helper';
import { Storage, Bucket } from '@google-cloud/storage';
import {
  EXAMPLE_BUCKET,
  EXAMPLE_FILE,
  EXAMPLE_DIR,
  FAKE_FILE,
  FILES_IN_DIR,
  FAKE_METADATA,
  EXAMPLE_PREFIX,
} from './constants.test';
/**
 * Unit Test uploadFile method in uploadHelper.
 */
describe('Unit Test uploadFile', function() {
  beforeEach(function() {
    // Before each call is made to uploadFile stub upload method in storage
    // library to return fake constant data.
    this.uploadStub = sinon.stub(Bucket.prototype, 'upload').callsFake(() => {
      return Promise.resolve([FAKE_FILE, FAKE_METADATA]);
    });
  });

  afterEach(function() {
    sinon.restore();
  });

  it('uploads a single file', async function() {
    const uploader = new UploadHelper(new Storage());
    await uploader.uploadFile(EXAMPLE_BUCKET, EXAMPLE_FILE);
    // Assert that upload method in storage library was called with right file.
    expect(this.uploadStub.firstCall.args[0]).eq(EXAMPLE_FILE);
  });

  it('uploads a single file with prefix', async function() {
    const uploader = new UploadHelper(new Storage());
    await uploader.uploadFile(EXAMPLE_BUCKET, EXAMPLE_FILE, EXAMPLE_PREFIX);
    // Assert that upload method in storage library was called with right file
    // and right prefix.
    expect(this.uploadStub.firstCall.args[0]).eq(EXAMPLE_FILE);
    expect(this.uploadStub.firstCall.args[1].destination.split('/')[0]).eq(
      EXAMPLE_PREFIX,
    );
  });
});

/**
 * Unit Test uploadDir method in uploadHelper.
 */
describe('Unit Test uploadDir', function() {
  beforeEach(function() {
    // Before each call is made to uploadDir stub uploadFile in UploadHelper to
    // return fake constant data.
    this.uploadFileStub = sinon
      .stub(UploadHelper.prototype, 'uploadFile')
      .callsFake(() => {
        return Promise.resolve([FAKE_FILE, FAKE_METADATA]);
      });
  });

  afterEach(function() {
    sinon.restore();
  });

  it('uploads a dir', async function() {
    const uploader = new UploadHelper(new Storage());
    await uploader.uploadDirectory(EXAMPLE_BUCKET, EXAMPLE_DIR);
    // Assert that uploadFile was called for each file in directory.
    expect(this.uploadFileStub.callCount).eq(FILES_IN_DIR.length);
    // Capture filename arguments passed to uploadFile.
    const uploadFileCalls = this.uploadFileStub.getCalls();
    const filenames = uploadFileCalls.map(
      (uploadFileCall: sinon.SinonSpyCall) => uploadFileCall.args[1],
    );
    // Assert uploadDir called uploadFile with right files.
    expect(filenames).to.have.members(FILES_IN_DIR);
  });

  it('uploads a dir with prefix', async function() {
    const uploader = new UploadHelper(new Storage());
    await uploader.uploadDirectory(EXAMPLE_BUCKET, EXAMPLE_DIR, EXAMPLE_PREFIX);
    // Assert that uploadFile was called for each file in directory.
    expect(this.uploadFileStub.callCount).eq(FILES_IN_DIR.length);
    // Capture filename arguments passed to uploadFile.
    const uploadFileCalls = this.uploadFileStub.getCalls();
    const filenames = uploadFileCalls.map(
      (uploadFileCall: sinon.SinonSpyCall) => uploadFileCall.args[1],
    );
    // Capture destination arguments passed to uploadFile.
    const destinations = uploadFileCalls.map(
      (uploadFileCall: sinon.SinonSpyCall) => uploadFileCall.args[2],
    );
    // Assert uploadDir called uploadFile with right files.
    expect(filenames).to.have.members(FILES_IN_DIR);
    // Assert uploadDir called uploadFile with prefixed destination.
    destinations.forEach((destination: string) => {
      expect(destination.split('/')[0]).eq(EXAMPLE_PREFIX);
    });
  });
});
