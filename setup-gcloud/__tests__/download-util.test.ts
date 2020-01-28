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
 * Tests download-util.
 */
import fs from 'fs';
import * as io from '@actions/io';
import * as testUtil from '../src/test-util';
import * as os from 'os';
const toolDir = testUtil.setupTempDir('tools', 'RUNNER_TOOL_CACHE');
const tempDir = testUtil.setupTempDir('temp', 'RUNNER_TEMP');

// Import modules being tested after test setup as run.
import * as downloadUtil from '../src/download-util';

import {getReleaseURL} from '../src/format-url';
// Downloads can require a bit longer of a timeout.
const TEST_TIMEOUT_MILLIS = 20000;
const CLEANUP_TIMEOUT_MILLIS = 10000;

describe('downloadAndExtractTool tests', () => {
  beforeAll(async () => {
    await io.rmRF(toolDir);
    await io.rmRF(tempDir);
  });

  afterAll(async () => {
    await io.rmRF(toolDir);
    await io.rmRF(tempDir);
  }, CLEANUP_TIMEOUT_MILLIS);

  it(
    'Downloads and extracts linux version',
    async () => {
      // skip on windows until this issue is resolved: https://github.com/actions/toolkit/issues/194
      if (os.platform() == 'win32') {
        return;
      }

      const url = await getReleaseURL(
        'linux',
        'x86_64',
        testUtil.TEST_SDK_VERSION,
      );
      const extPath = await downloadUtil.downloadAndExtractTool(url);
      expect(extPath).toBeDefined();
      expect(fs.existsSync(extPath)).toBe(true);
    },
    TEST_TIMEOUT_MILLIS,
  );

  it(
    'Downloads and extracts windows version',
    async () => {
      // Use an older version of the Windows release, as the current release is 200MB+ and takes too long to download.

      const url = await getReleaseURL('win32', 'x86_64', '0.9.83');
      const extPath = await downloadUtil.downloadAndExtractTool(url);
      expect(extPath).toBeDefined();
      expect(fs.existsSync(extPath)).toBe(true);
    },
    TEST_TIMEOUT_MILLIS,
  );

  it(
    'Downloads and extracts darwin version',
    async () => {
      // skip on windows until this issue is resolved: https://github.com/actions/toolkit/issues/194
      if (os.platform() == 'win32') {
        return;
      }

      const url = await getReleaseURL(
        'darwin',
        'x86_64',
        testUtil.TEST_SDK_VERSION,
      );
      const extPath = await downloadUtil.downloadAndExtractTool(url);
      expect(extPath).toBeDefined();
      expect(fs.existsSync(extPath)).toBe(true);
    },
    TEST_TIMEOUT_MILLIS,
  );

  it(
    'Errors when download not found',
    async () => {
      await expect(
        downloadUtil.downloadAndExtractTool('fakeUrl'),
      ).rejects.toThrow(expect.anything());
    },
    TEST_TIMEOUT_MILLIS,
  );
});
