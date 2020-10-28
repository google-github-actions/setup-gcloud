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

import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import 'mocha';
import * as sinon from 'sinon';

import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { writeFile } from '../src/util';
import os from 'os';

chai.use(chaiAsPromised);
const { expect } = chai;

describe('writeFile', function () {
  beforeEach(async function () {
    // stub fs writeFileSync method
    this.writeFileSyncStub = sinon.stub(fs, 'writeFileSync');
    // populate GITHUB_WORKSPACE with temp dir
    this.envStub = sinon.stub(process, 'env').value({
      GITHUB_WORKSPACE: fs.mkdtempSync(path.join(os.tmpdir(), uuidv4())),
    });
  });

  afterEach(async function () {
    sinon.restore();
  });

  it('writes to file', async function () {
    const filePath = await writeFile('test');
    // writeFileSync was called with correct path
    expect(filePath).to.be.contain(process.env.GITHUB_WORKSPACE);
    // writeFileSync was called once to write string`test`
    expect(this.writeFileSyncStub.callCount).eq(1);
    expect(this.writeFileSyncStub.getCalls()[0].args[1]).eql('test');
  });

  it('throws an error if GITHUB_WORKSPACE is not set', async function () {
    this.envStub.value({});
    expect(writeFile('test')).to.eventually.be.rejectedWith(
      'Missing GITHUB_WORKSPACE!',
    );
  });

  it('throws an error if unable to write to file', async function () {
    this.writeFileSyncStub.throws();
    expect(writeFile('test')).to.eventually.be.rejectedWith(
      /Unable to write kubeconfig to file:/,
    );
  });
});
