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
import { mockUploadFile } from './mocks/mockUploadFile';
import { Storage } from '@google-cloud/storage';

describe('Upload Helper', function() {
  //stub for uploadFile
  beforeEach(function() {
    sinon.stub(UploadHelper.prototype, 'uploadFile').callsFake(mockUploadFile);
  });

  afterEach(function() {
    sinon.restore();
  });

  it('uploads a single file', async function() {
    const uploader = new UploadHelper(new Storage());
    const uploadResponse = await uploader.uploadFile(
      'foo',
      './tests/testdata/test1.txt',
    );
    expect(uploadResponse[0].name).eql('test1.txt');
  });

  it('uploads a single file with prefix', async function() {
    const uploader = new UploadHelper(new Storage());
    const uploadResponse = await uploader.uploadFile(
      'foo',
      './tests/testdata/test1.txt',
      'testprefix',
    );
    expect(uploadResponse[0].name).eql('testprefix/test1.txt');
  });

  it('uploads a dir', async function() {
    const uploader = new UploadHelper(new Storage());
    const uploadResponses = await uploader.uploadDirectory(
      'foo',
      './tests/testdata',
    );
    expect(uploadResponses.length).eql(6);
    const names = uploadResponses.map(
      (uploadResponse) => uploadResponse[0].name,
    );
    expect(names).to.have.members([
      'testdata/nested1/nested2/test3.txt',
      'testdata/nested1/test1.txt',
      'testdata/test2.txt',
      'testdata/test1.txt',
      'testdata/testfile',
      'testdata/🚀',
    ]);
  });

  it('uploads a dir with prefix', async function() {
    const uploader = new UploadHelper(new Storage());
    const uploadResponses = await uploader.uploadDirectory(
      'foo',
      './tests/testdata',
      'testprefix',
    );
    expect(uploadResponses.length).eql(6);
    const names = uploadResponses.map(
      (uploadResponse) => uploadResponse[0].name,
    );
    expect(names).to.have.members([
      'testprefix/testdata/nested1/nested2/test3.txt',
      'testprefix/testdata/nested1/test1.txt',
      'testprefix/testdata/test2.txt',
      'testprefix/testdata/test1.txt',
      'testprefix/testdata/testfile',
      'testprefix/testdata/🚀',
    ]);
  });
});
