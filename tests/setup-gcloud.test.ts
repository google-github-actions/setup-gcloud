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

import { promises as fs, writeFileSync } from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as setupGcloud from '@google-github-actions/setup-cloud-sdk';
import { TestToolCache } from '@google-github-actions/setup-cloud-sdk';
import * as core from '@actions/core';
import * as toolCache from '@actions/tool-cache';

import { parseVersionFile, run } from '../src/main';

/**
 * writeTempVersionFile writes contents to a uniquely-named file in the OS temp
 * directory and returns its path. It uses the synchronous fs API so it is
 * unaffected by the mocked promise-based fs.writeFile in the test suite.
 */
const writeTempVersionFile = (name: string, contents: string): string => {
  const tmp = path.join(os.tmpdir(), `setup-gcloud-${process.hrtime.bigint()}-${name}`);
  writeFileSync(tmp, contents);
  return tmp;
};

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

  await suite.test('resolves the version from a .tool-versions version_file', async (t) => {
    const versionFile = writeTempVersionFile('.tool-versions', 'nodejs 20.0.0\ngcloud 5.6.7\n');
    const mocks = defaultMocks(t.mock, {
      version: '',
      version_file: versionFile,
    });
    await run();

    assert.deepStrictEqual(mocks.installGcloudSDK.mock.calls?.at(0)?.arguments?.at(0), '5.6.7');
  });

  await suite.test('resolves the version from a plain version_file', async (t) => {
    const versionFile = writeTempVersionFile('version', '5.6.7\n');
    const mocks = defaultMocks(t.mock, {
      version: '',
      version_file: versionFile,
    });
    await run();

    assert.deepStrictEqual(mocks.installGcloudSDK.mock.calls?.at(0)?.arguments?.at(0), '5.6.7');
  });

  await suite.test('prefers an explicit version over version_file', async (t) => {
    const versionFile = writeTempVersionFile('version', '5.6.7\n');
    const mocks = defaultMocks(t.mock, {
      version: '9.9.9',
      version_file: versionFile,
    });
    await run();

    assert.deepStrictEqual(mocks.installGcloudSDK.mock.calls?.at(0)?.arguments?.at(0), '9.9.9');
  });
});

test('#parseVersionFile', { concurrency: true }, async (suite) => {
  await suite.test('extracts the gcloud entry from a .tool-versions file', async () => {
    assert.deepStrictEqual(parseVersionFile('nodejs 20.0.0\ngcloud 416.0.0\n'), '416.0.0');
  });

  await suite.test('reads a plain version file', async () => {
    assert.deepStrictEqual(parseVersionFile('416.0.0\n'), '416.0.0');
  });

  await suite.test('ignores comments and blank lines', async () => {
    assert.deepStrictEqual(parseVersionFile('# comment\n\ngcloud 416.0.0\n'), '416.0.0');
  });

  await suite.test('preserves a version constraint', async () => {
    assert.deepStrictEqual(parseVersionFile('>= 416.0.0\n'), '>= 416.0.0');
  });

  await suite.test('returns an empty string for an empty file', async () => {
    assert.deepStrictEqual(parseVersionFile('\n# only a comment\n'), '');
  });
});

/**
 * installFakeGcloud puts a fake gcloud version into the temporary toolcache.
 * It's not actually gcloud and not actually executable.
 */
const installFakeGcloud = async (version: string): Promise<string> => {
  return await toolCache.cacheFile('action.yml', 'action.yml', 'gcloud', version);
};
