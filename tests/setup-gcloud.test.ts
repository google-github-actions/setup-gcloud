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

import { mock, test } from 'node:test';
import assert from 'node:assert';

import { promises as fs } from 'fs';
import * as setupGcloud from '@google-github-actions/setup-cloud-sdk';
import { TestToolCache } from '@google-github-actions/setup-cloud-sdk';
import * as core from '@actions/core';
import * as toolCache from '@actions/tool-cache';

import { run } from '../src/main';

// These are mock data for github actions inputs, where camel case is expected.
const fakeInputs: { [key: string]: string } = {
  version: '999',
  project_id: 'test',
};

const defaultMocks = (
  m: typeof mock,
  overrideInputs?: Record<string, string>,
): Record<string, any> => {
  const inputs = Object.assign({}, fakeInputs, overrideInputs);
  return {
    startGroup: m.method(core, 'startGroup', () => {}),
    endGroup: m.method(core, 'endGroup', () => {}),
    group: m.method(core, 'group', () => {}),
    logDebug: m.method(core, 'debug', () => {}),
    logError: m.method(core, 'error', () => {}),
    logInfo: m.method(core, 'info', () => {}),
    logNotice: m.method(core, 'notice', () => {}),
    logWarning: m.method(core, 'warning', () => {}),
    exportVariable: m.method(core, 'exportVariable', () => {}),
    setSecret: m.method(core, 'setSecret', () => {}),
    addPath: m.method(core, 'addPath', () => {}),
    setOutput: m.method(core, 'setOutput', () => {}),
    setFailed: m.method(core, 'setFailed', (msg: string) => {
      throw new Error(msg);
    }),
    getBooleanInput: m.method(core, 'getBooleanInput', (name: string) => {
      return !!inputs[name];
    }),
    getMultilineInput: m.method(core, 'getMultilineInput', (name: string) => {
      return inputs[name];
    }),
    getInput: m.method(core, 'getInput', (name: string) => {
      return inputs[name];
    }),

    authenticateGcloudSDK: m.method(setupGcloud, 'authenticateGcloudSDK', () => {}),
    isAuthenticated: m.method(setupGcloud, 'isAuthenticated', () => {}),
    isInstalled: m.method(setupGcloud, 'isInstalled', () => {
      return true;
    }),
    installGcloudSDK: m.method(setupGcloud, 'installGcloudSDK', async () => {
      return '1.2.3';
    }),
    installComponent: m.method(setupGcloud, 'installComponent', () => {}),
    setProject: m.method(setupGcloud, 'setProject', () => {}),
    getLatestGcloudSDKVersion: m.method(setupGcloud, 'getLatestGcloudSDKVersion', () => {
      return '1.2.3';
    }),

    writeFile: m.method(fs, 'writeFile', () => {}),
  };
};

test('#run', { concurrency: true }, async (suite) => {
  const originalEnv = Object.assign({}, process.env);

  suite.beforeEach(async () => {
    await TestToolCache.start();
  });

  suite.afterEach(async () => {
    process.env = originalEnv;
    await TestToolCache.stop();
  });

  await suite.test('downloads when no version is provided', async (t) => {
    const mocks = defaultMocks(t.mock, {
      version: '',
    });
    await run();

    assert.match(mocks.installGcloudSDK.mock.calls?.at(0)?.arguments?.at(0), /\d+\.\d+\.\d+/);
  });

  await suite.test('downloads when version is "latest"', async (t) => {
    const mocks = defaultMocks(t.mock, {
      version: '',
    });
    await run();

    assert.match(mocks.installGcloudSDK.mock.calls?.at(0)?.arguments?.at(0), /\d+\.\d+\.\d+/);
  });

  await suite.test('downloads when version is not installed', async (t) => {
    const mocks = defaultMocks(t.mock, {
      version: '5.6.7',
    });
    await run();

    assert.deepStrictEqual(mocks.installGcloudSDK.mock.calls?.at(0)?.arguments?.at(0), '5.6.7');
  });

  await suite.test('downloads when version constraint is not satisfied', async (t) => {
    const mocks = defaultMocks(t.mock, {
      version: '>= 10.0.0',
    });
    await run();

    assert.deepStrictEqual(mocks.installGcloudSDK.mock.calls?.at(0)?.arguments?.at(0), '>= 10.0.0');
  });

  await suite.test(
    'downloads when a version is installed but the version constraint is not satisfied',
    async (t) => {
      const mocks = defaultMocks(t.mock, {
        version: '>= 10.0.0',
      });
      await installFakeGcloud('9.8.7');
      await run();

      assert.deepStrictEqual(
        mocks.installGcloudSDK.mock.calls?.at(0)?.arguments?.at(0),
        '>= 10.0.0',
      );
    },
  );

  await suite.test('does not download when version is installed', async (t) => {
    const mocks = defaultMocks(t.mock, {
      version: '1.2.3',
    });
    await installFakeGcloud('1.2.3');
    await run();

    assert.deepStrictEqual(mocks.installGcloudSDK.mock.callCount(), 0);
  });

  await suite.test('does not download when a version constraint is satisfied', async (t) => {
    const mocks = defaultMocks(t.mock, {
      version: '>= 1.0.0',
    });
    await installFakeGcloud('1.2.3');
    await run();

    assert.deepStrictEqual(mocks.installGcloudSDK.mock.callCount(), 0);
  });

  await suite.test('installs 1 additional component', async (t) => {
    const mocks = defaultMocks(t.mock, {
      install_components: 'beta',
    });
    await run();

    assert.deepStrictEqual(mocks.installComponent.mock.calls?.at(0)?.arguments?.at(0), ['beta']);
  });

  await suite.test('installs additional components', async (t) => {
    const mocks = defaultMocks(t.mock, {
      install_components: 'alpha, beta',
    });
    await run();

    assert.deepStrictEqual(mocks.installComponent.mock.calls?.at(0)?.arguments?.at(0), [
      'alpha',
      'beta',
    ]);
  });

  await suite.test('authenticates if GOOGLE_GHA_CREDS is set', async (t) => {
    const mocks = defaultMocks(t.mock, {
      install_components: 'alpha, beta',
    });

    process.env.GOOGLE_GHA_CREDS_PATH = '/foo/bar/path.json';

    await run();

    assert.deepStrictEqual(mocks.authenticateGcloudSDK.mock.callCount(), 1);
  });

  await suite.test('sets the project ID if provided', async (t) => {
    const mocks = defaultMocks(t.mock, {
      project_id: 'test',
    });
    await run();

    assert.deepStrictEqual(mocks.setProject.mock.calls?.at(0)?.arguments?.at(0), 'test');
  });

  await suite.test('does not set the project ID if not provided', async (t) => {
    const mocks = defaultMocks(t.mock, {
      project_id: '',
    });
    await run();

    assert.deepStrictEqual(mocks.setProject.mock.callCount(), 0);
  });
});

/**
 * installFakeGcloud puts a fake gcloud version into the temporary toolcache.
 * It's not actually gcloud and not actually executable.
 */
const installFakeGcloud = async (version: string): Promise<string> => {
  return await toolCache.cacheFile('action.yml', 'action.yml', 'gcloud', version);
};
