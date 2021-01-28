/*
 * Copyright 2019 Google LLC
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

/*
 * Tests setup-gcloud.
 */
import 'mocha';
import { expect } from 'chai';
import * as sinon from 'sinon';

import os from 'os';
import { promises as fs } from 'fs';
import * as setupGcloud from '../../setupGcloudSDK/dist/index';
import * as core from '@actions/core';
import * as toolCache from '@actions/tool-cache';

import { run } from '../src/setup-gcloud';

/* eslint-disable @typescript-eslint/camelcase */
// These are mock data for github actions inputs, where camel case is expected.
const fakeInputs: { [key: string]: string } = {
  version: '999',
  project_id: 'test',
  service_account_key: 'abc',
  export_default_credentials: 'false',
  credentials_file_path: '/creds',
};
/* eslint-enable @typescript-eslint/camelcase */

function getInputMock(name: string): string {
  return fakeInputs[name];
}

describe('#run', function() {
  beforeEach(async function() {
    this.stubs = {
      getInput: sinon.stub(core, 'getInput').callsFake(getInputMock),
      exportVariable: sinon.stub(core, 'exportVariable'),
      setFailed: sinon.stub(core, 'setFailed'),
      installGcloudSDK: sinon.stub(setupGcloud, 'installGcloudSDK'),
      authenticateGcloudSDK: sinon.stub(setupGcloud, 'authenticateGcloudSDK'),
      isInstalled: sinon.stub(setupGcloud, 'isInstalled').returns(false),
      setProject: sinon.stub(setupGcloud, 'setProject'),
      parseServiceAccountKey: sinon.stub(setupGcloud, 'parseServiceAccountKey'),
      toolCacheFind: sinon.stub(toolCache, 'find').returns('/'),
      writeFile: sinon.stub(fs, 'writeFile'),
      env: sinon.stub(process, 'env').value({ GITHUB_PATH: '/' }),
    };
  });

  afterEach(function() {
    Object.keys(this.stubs).forEach((k) => this.stubs[k].restore());
  });

  it('downloads the latest gcloud SDK if version is not provided', async function() {
    this.stubs.getInput.withArgs('version').returns('');
    await run();
    // getLatestGcloudSDKVersion is implemented as a getter on on exports and so stubbing doesn't work.
    // Instead, make sure that installGcloudSDK was called with an expected version string.
    expect(
      this.stubs.installGcloudSDK.withArgs(sinon.match(/\d+\.\d+\.\d+/))
        .callCount,
    ).to.eq(1);
  });

  it('downloads the latest gcloud SDK if version is "latest"', async function() {
    this.stubs.getInput.withArgs('version').returns('latest');
    await run();
    expect(
      this.stubs.installGcloudSDK.withArgs(sinon.match(/\d+\.\d+\.\d+/))
        .callCount,
    ).to.eq(1);
  });

  it('doesnt download the SDK if version is provided', async function() {
    this.stubs.getInput.withArgs('version').returns('999');
    await run();
    expect(this.stubs.installGcloudSDK.withArgs('999').callCount).to.eq(1);
  });

  it('installs the gcloud SDK if it is not already installed', async function() {
    this.stubs.isInstalled.returns(false);
    this.stubs.getInput.withArgs('version').returns('888');
    await run();
    expect(this.stubs.installGcloudSDK.withArgs('888').callCount).to.eq(1);
  });

  it('uses the cached gcloud SDK if it was already installed', async function() {
    this.stubs.isInstalled.returns(true);
    this.stubs.getInput.withArgs('version').returns('777');
    await run();
    expect(this.stubs.toolCacheFind.withArgs('gcloud', '777').callCount).to.eq(
      1,
    );
  });

  it('sets the project ID if provided', async function() {
    this.stubs.getInput.withArgs('project_id').returns('test');
    await run();
    expect(this.stubs.setProject.withArgs('test').callCount).to.eq(1);
  });

  it('does not set the project ID if not provided', async function() {
    this.stubs.getInput.withArgs('project_id').returns('');
    await run();
    expect(this.stubs.setProject.callCount).to.eq(0);
  });

  it('does not run any authentication functions if key not provided', async function() {
    this.stubs.getInput.withArgs('service_account_key').returns('');
    await run();
    expect(this.stubs.authenticateGcloudSDK.callCount).to.eq(0);
    // test early return
    expect(
      this.stubs.getInput.withArgs('export_default_credentials').callCount,
    ).to.eq(0);
  });

  it('authenticates if key is provided', async function() {
    this.stubs.getInput.withArgs('service_account_key').returns('key');
    await run();
    expect(this.stubs.authenticateGcloudSDK.withArgs('key').callCount).to.eq(1);
  });

  it('writes default credentials to disk and exports the path if export_default_credentials=true', async function() {
    this.stubs.env.value({ GITHUB_WORKSPACE: '/usr/workspace' });
    this.stubs.getInput.withArgs('export_default_credentials').returns('true');
    this.stubs.getInput.withArgs('credentials_file_path').returns('');
    this.stubs.getInput.withArgs('service_account_key').returns('key');
    this.stubs.parseServiceAccountKey.withArgs('key').returns({ json: true });

    await run();

    expect(this.stubs.parseServiceAccountKey.withArgs('key').callCount).to.eq(
      1,
    );

    let expectedPath;
    if (os.platform() === 'win32') {
      expectedPath = sinon.match('\\usr\\workspace');
    } else {
      expectedPath = sinon.match('/usr/workspace');
    }

    expect(
      this.stubs.writeFile.withArgs(expectedPath, sinon.match.string).callCount,
    ).to.eq(1);

    expect(
      this.stubs.exportVariable.withArgs(
        'GOOGLE_APPLICATION_CREDENTIALS',
        expectedPath,
      ).callCount,
    ).to.eq(1);
  });

  it('works if export_default_credentials is a boolean', async function() {
    this.stubs.getInput.withArgs('export_default_credentials').returns(true);
    this.stubs.getInput.withArgs('credentials_file_path').returns('/');
    this.stubs.getInput.withArgs('service_account_key').returns('key');

    await run();

    expect(this.stubs.writeFile.callCount).to.eq(1);
  });

  it('works if export_default_credentials is all caps', async function() {
    this.stubs.getInput.withArgs('export_default_credentials').returns('TRUE');
    this.stubs.getInput.withArgs('credentials_file_path').returns('/');
    this.stubs.getInput.withArgs('service_account_key').returns('key');

    await run();

    expect(this.stubs.writeFile.callCount).to.eq(1);
  });

  it('writes credentials to the given path if provided', async function() {
    this.stubs.getInput.withArgs('export_default_credentials').returns('true');
    this.stubs.getInput.withArgs('credentials_file_path').returns('/usr/creds');

    await run();

    expect(this.stubs.writeFile.withArgs('/usr/creds').callCount).to.eq(1);
    expect(
      this.stubs.exportVariable.withArgs(
        'GOOGLE_APPLICATION_CREDENTIALS',
        '/usr/creds',
      ).callCount,
    ).to.eq(1);
  });

  it('throws an error if credentials_file_path is not provided and GITHUB_WORKSPACE is not set', async function() {
    this.stubs.getInput.withArgs('export_default_credentials').returns('true');
    this.stubs.getInput.withArgs('credentials_file_path').returns('');
    await run();
    expect(this.stubs.setFailed.callCount).to.eq(1);
  });
});
