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

import { promises as fs } from 'fs';
import * as setupGcloud from '@google-github-actions/setup-cloud-sdk';
import * as core from '@actions/core';
import * as toolCache from '@actions/tool-cache';

import { run } from '../src/main';

// These are mock data for github actions inputs, where camel case is expected.
const fakeInputs: { [key: string]: string } = {
  version: '999',
  project_id: 'test',
};

function getInputMock(name: string): string {
  return fakeInputs[name];
}

describe('#run', function () {
  beforeEach(async function () {
    this.stubs = {
      getInput: sinon.stub(core, 'getInput').callsFake(getInputMock),
      getBooleanInput: sinon.stub(core, 'getBooleanInput').returns(false),
      exportVariable: sinon.stub(core, 'exportVariable'),
      setFailed: sinon.stub(core, 'setFailed'),
      warning: sinon.stub(core, 'warning'),
      authenticateGcloudSDK: sinon.stub(setupGcloud, 'authenticateGcloudSDK'),
      installGcloudSDK: sinon.stub(setupGcloud, 'installGcloudSDK'),
      isInstalled: sinon.stub(setupGcloud, 'isInstalled').returns(false),
      setProject: sinon.stub(setupGcloud, 'setProject'),
      installComponent: sinon.stub(setupGcloud, 'installComponent'),
      toolCacheFind: sinon.stub(toolCache, 'find').returns('/'),
      writeFile: sinon.stub(fs, 'writeFile'),
      env: sinon.stub(process, 'env').value({ GITHUB_PATH: '/' }),
    };
  });

  afterEach(function () {
    Object.keys(this.stubs).forEach((k) => this.stubs[k].restore());
  });

  it('downloads the latest gcloud SDK if version is not provided', async function () {
    this.stubs.getInput.withArgs('version').returns('');
    await run();
    // getLatestGcloudSDKVersion is implemented as a getter on on exports and so stubbing doesn't work.
    // Instead, make sure that installGcloudSDK was called with an expected version string.
    expect(this.stubs.installGcloudSDK.withArgs(sinon.match(/\d+\.\d+\.\d+/)).callCount).to.eq(1);
  });

  it('downloads the latest gcloud SDK if version is "latest"', async function () {
    this.stubs.getInput.withArgs('version').returns('latest');
    await run();
    expect(this.stubs.installGcloudSDK.withArgs(sinon.match(/\d+\.\d+\.\d+/)).callCount).to.eq(1);
  });

  it('does not download the SDK if version is provided', async function () {
    this.stubs.getInput.withArgs('version').returns('999');
    await run();
    expect(this.stubs.installGcloudSDK.withArgs('999').callCount).to.eq(1);
  });

  it('installs the gcloud SDK if it is not already installed', async function () {
    this.stubs.isInstalled.returns(false);
    this.stubs.getInput.withArgs('version').returns('888');
    await run();
    expect(this.stubs.installGcloudSDK.withArgs('888').callCount).to.eq(1);
  });

  it('uses the cached gcloud SDK if it was already installed', async function () {
    this.stubs.isInstalled.returns(true);
    this.stubs.getInput.withArgs('version').returns('777');
    await run();
    expect(this.stubs.toolCacheFind.withArgs('gcloud', '777').callCount).to.eq(1);
  });

  it('installs 1 additional component', async function () {
    this.stubs.getInput.withArgs('install_components').returns('beta');
    await run();
    expect(this.stubs.installComponent.callCount).to.eq(1);
  });

  it('installs additional components', async function () {
    this.stubs.getInput.withArgs('install_components').returns('beta, alpha');
    await run();
    expect(this.stubs.installComponent.callCount).to.eq(1);
  });

  it('authenticates if GOOGLE_GHA_CREDS is set', async function () {
    this.stubs.env.value({ GOOGLE_GHA_CREDS_PATH: 'foo/bar/path.json' }).returns('{}');
    await run();
    expect(this.stubs.authenticateGcloudSDK.callCount).to.eq(1);
  });

  it('sets the project ID if provided', async function () {
    this.stubs.getInput.withArgs('project_id').returns('test');
    await run();
    expect(this.stubs.setProject.withArgs('test').callCount).to.eq(1);
  });

  it('does not set the project ID if not provided', async function () {
    this.stubs.getInput.withArgs('project_id').returns('');
    await run();
    expect(this.stubs.setProject.callCount).to.eq(0);
  });
});
