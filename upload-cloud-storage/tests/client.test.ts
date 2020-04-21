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
import { Client } from '../src/client';
import { UploadHelper } from '../src/upload-helper';
import { FAKE_FILE, FAKE_METADATA } from './constants.test';

/**
 * Unit Test upload method in Client.
 */
describe('Unit Test Client', function() {
  afterEach(function() {
    sinon.restore();
  });

  it('initializes with JSON creds', function() {
    const client = new Client({
      credentials: `{"foo":"bar"}`,
    });
    expect(client.storage.authClient.jsonContent).eql({ foo: 'bar' });
  });

  it('initializes with ADC', function() {
    const client = new Client();
    expect(client.storage.authClient.jsonContent).eql(null);
  });

  it('calls uploadFile', async function() {
    const uploadFileStub = sinon
      .stub(UploadHelper.prototype, 'uploadFile')
      .callsFake(() => {
        return Promise.resolve([FAKE_FILE, FAKE_METADATA]);
      });
    const client = new Client();
    const path = './tests/testdata/test1.txt';
    const bucketName = 'foo';
    const prefix = 'test-prefix';
    await client.upload(`${bucketName}/${prefix}`, path);
    expect(uploadFileStub.calledOnce);
    expect(uploadFileStub.firstCall.args[0]).to.equal(bucketName);
    expect(uploadFileStub.firstCall.args[1]).to.equal(path);
    expect(uploadFileStub.firstCall.args[2]).to.equal(prefix);
  });

  it('calls uploadDirectory', async function() {
    sinon.stub(UploadHelper.prototype, 'uploadFile').callsFake(() => {
      return Promise.resolve([FAKE_FILE, FAKE_METADATA]);
    });
    const uploadDirSpy = sinon.spy(UploadHelper.prototype, 'uploadDirectory');
    const client = new Client();
    const path = './tests/testdata';
    const bucketName = 'foo';
    await client.upload(bucketName, path);
    expect(uploadDirSpy.calledOnce);
    expect(uploadDirSpy.firstCall.args[0]).to.equal(bucketName);
    expect(uploadDirSpy.firstCall.args[1]).to.equal(path);
    expect(uploadDirSpy.firstCall.args[2]).to.equal('');
  });
});
