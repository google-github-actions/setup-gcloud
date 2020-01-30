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
 * Tests install-util.
 */
import fs from 'fs';
import path from 'path';
import os from 'os';
import * as io from '@actions/io';
import * as core from '@actions/core';
import * as toolCache from '@actions/tool-cache';
import * as testUtil from '../src/test-util';
const toolDir = testUtil.setupTempDir('tools', 'RUNNER_TOOL_CACHE');
const tempDir = testUtil.setupTempDir('temp', 'RUNNER_TEMP');

import {getReleaseURL} from '../src/format-url';
// Import modules being tested after test setup as run.
import * as installUtil from '../src/install-util';
import * as downloadUtil from '../src/download-util';

// Installation can require a bit longer of a timeout.
const TEST_TIMEOUT_MILLIS = 60000;

describe('installGcloudSDK tests', () => {
  beforeAll(async () => {
    await io.rmRF(toolDir);
    await io.rmRF(tempDir);
  });

  afterAll(async () => {
    await io.rmRF(toolDir);
    await io.rmRF(tempDir);
  }, TEST_TIMEOUT_MILLIS);

  it(
    'Installs gcloud for current env',
    async () => {
      const url = await getReleaseURL(
        os.platform(),
        os.arch(),
        testUtil.TEST_SDK_VERSION,
      );
      const extPath = await downloadUtil.downloadAndExtractTool(url);
      await installUtil.installGcloudSDK(testUtil.TEST_SDK_VERSION, extPath);
      const gcloudDir = path.join(
        toolDir,
        'gcloud',
        testUtil.TEST_SDK_VERSION,
        os.arch(),
      );
      expect(fs.existsSync(gcloudDir)).toBe(true);
      expect(fs.existsSync(path.join(gcloudDir, 'bin', 'gcloud'))).toBe(true);
    },
    TEST_TIMEOUT_MILLIS,
  );

  it(
    'Installs metrics tracking env var',
    async () => {
      const url = await getReleaseURL(
        os.platform(),
        os.arch(),
        testUtil.TEST_SDK_VERSION,
      );
      const extPath = await downloadUtil.downloadAndExtractTool(url);
      await installUtil.installGcloudSDK(testUtil.TEST_SDK_VERSION, extPath);
      expect(process.env[installUtil.GCLOUD_METRICS_ENV_VAR]).toBeDefined();
      expect(process.env[installUtil.GCLOUD_METRICS_ENV_VAR]).toBe(
        installUtil.GCLOUD_METRICS_LABEL,
      );
    },
    TEST_TIMEOUT_MILLIS,
  );
});
