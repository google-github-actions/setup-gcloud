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
import 'mocha';
import { expect } from 'chai';

import fs from 'fs';
import path from 'path';
import os from 'os';
import * as io from '@actions/io';

import { TestToolCache, TEST_SDK_VERSION } from '../src/test-util';
const [toolDir, tempDir] = TestToolCache.override();

import { getReleaseURL } from '../src/format-url';

import {
  GCLOUD_METRICS_ENV_VAR,
  GCLOUD_METRICS_LABEL,
  installGcloudSDK,
} from '../src/install-util';

import { downloadAndExtractTool } from '../src/download-util';

describe('#installGcloudSDK', () => {
  before(async function() {
    await io.rmRF(toolDir);
    await io.rmRF(tempDir);
  });

  after(async function() {
    await io.rmRF(toolDir);
    await io.rmRF(tempDir);
  });

  it('installs gcloud for current env', async function() {
    const url = await getReleaseURL(os.platform(), os.arch(), TEST_SDK_VERSION);
    const extPath = await downloadAndExtractTool(url);
    await installGcloudSDK(TEST_SDK_VERSION, extPath);
    const gcloudDir = path.join(toolDir, 'gcloud', TEST_SDK_VERSION, os.arch());

    expect(fs.existsSync(gcloudDir)).to.be.true;
    expect(fs.existsSync(path.join(gcloudDir, 'bin', 'gcloud'))).to.be.true;
  });

  it('installs metrics tracking env var', async function() {
    const url = await getReleaseURL(os.platform(), os.arch(), TEST_SDK_VERSION);
    const extPath = await downloadAndExtractTool(url);
    await installGcloudSDK(TEST_SDK_VERSION, extPath);
    expect(process.env[GCLOUD_METRICS_ENV_VAR]).to.equal(GCLOUD_METRICS_LABEL);
  });
});
