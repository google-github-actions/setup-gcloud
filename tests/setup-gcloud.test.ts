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
import { TestToolCache } from '@google-github-actions/setup-cloud-sdk';
import * as core from '@actions/core';
import * as toolCache from '@actions/tool-cache';
import { clearEnv } from '@google-github-actions/actions-utils';

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
      authenticateGcloudSDK: sinon.stub(setupGcloud, 'authenticateGcloudSDK'),
      installGcloudSDK: sinon.stub(setupGcloud, 'installGcloudSDK'),
      setProject: sinon.stub(setupGcloud, 'setProject'),
      installComponent: sinon.stub(setupGcloud, 'installComponent'),
      writeFile: sinon.stub(fs, 'writeFile'),
    };

    process.env.GITHUB_PATH = '/';

    sinon.stub(core, 'setFailed').throwsArg(0); // make setFailed throw exceptions
    sinon.stub(core, 'addPath').callsFake(sinon.fake());
    sinon.stub(core, 'debug').callsFake(sinon.fake());
    sinon.stub(core, 'endGroup').callsFake(sinon.fake());
    sinon.stub(core, 'info').callsFake(sinon.fake());
    sinon.stub(core, 'startGroup').callsFake(sinon.fake());
    sinon.stub(core, 'warning').callsFake(sinon.fake());

    await TestToolCache.start();
  });

  afterEach(async function () {
    Object.keys(this.stubs).forEach((k) => this.stubs[k].restore());
    sinon.restore();
    clearEnv((key: string) => key.startsWith(`GITHUB_`));

    await TestToolCache.stop();
  });

  describe('download', () => {
    it('downloads when no version is provided', async function () {
      this.stubs.getInput.withArgs('version').returns('');
      await run();

      const call = this.stubs.installGcloudSDK.firstCall;
      expect(call.firstArg).to.match(/\d+\.\d+\.\d+/);
    });

    it('downloads when version is "latest"', async function () {
      this.stubs.getInput.withArgs('version').returns('latest');
      await run();

      const call = this.stubs.installGcloudSDK.firstCall;
      expect(call.firstArg).to.match(/\d+\.\d+\.\d+/);
    });

    it('downloads when version is not installed', async function () {
      this.stubs.getInput.withArgs('version').returns('5.6.7');
      await run();

      const call = this.stubs.installGcloudSDK.firstCall;
      expect(call.firstArg).to.eql('5.6.7');
    });

    it('downloads when version constraint is not satisfied', async function () {
      this.stubs.getInput.withArgs('version').returns('>= 10.0.0');
      await run();

      const call = this.stubs.installGcloudSDK.firstCall;
      expect(call.firstArg).to.eql('>= 10.0.0');
    });

    it('downloads when a version is installed but the version constraint is not satisfied', async function () {
      this.stubs.getInput.withArgs('version').returns('>= 10.0.0');
      await installFakeGcloud('9.8.7');
      await run();

      const call = this.stubs.installGcloudSDK.firstCall;
      expect(call.firstArg).to.eql('>= 10.0.0');
    });

    it('does not download when version is installed', async function () {
      this.stubs.getInput.withArgs('version').returns('1.2.3');
      await installFakeGcloud('1.2.3');

      await run();
      expect(this.stubs.installGcloudSDK.callCount).to.eq(0);
    });

    it('does not download when a version constraint is satisfied', async function () {
      this.stubs.getInput.withArgs('version').returns('>= 0.0.0');
      await installFakeGcloud('1.2.3');

      await run();
      expect(this.stubs.installGcloudSDK.callCount).to.eq(0);
    });
  });

  describe('component installation', () => {
    it('installs 1 additional component', async function () {
      this.stubs.getInput.withArgs('install_components').returns('beta');
      await run();

      const call = this.stubs.installComponent.firstCall;
      expect(call.firstArg).to.eql(['beta']);
    });

    it('installs additional components', async function () {
      this.stubs.getInput.withArgs('install_components').returns('beta, alpha');
      await run();

      const call = this.stubs.installComponent.firstCall;
      expect(call.firstArg).to.eql(['beta', 'alpha']);
    });
  });

  describe('authentication', () => {
    it('authenticates if GOOGLE_GHA_CREDS is set', async function () {
      process.env.GOOGLE_GHA_CREDS_PATH = '/foo/bar/path.json';
      await run();
      expect(this.stubs.authenticateGcloudSDK.callCount).to.eq(1);
    });
  });

  describe('configuration', () => {
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
});

/**
 * installFakeGcloud puts a fake gcloud version into the temporary toolcache.
 * It's not actually gcloud and not actually executable.
 */
async function installFakeGcloud(version: string): Promise<string> {
  return await toolCache.cacheFile('action.yml', 'action.yml', 'gcloud', version);
}
