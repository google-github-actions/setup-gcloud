/*
 * Copyright 2021 Google LLC
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

'use strict';

import 'mocha';
import { expect } from 'chai';

import { existsSync } from 'fs';
import { tmpdir } from 'os';
import crypto from 'crypto';
import path from 'path';

import { writeSecureFile } from '@google-github-actions/actions-utils';

import { removeExportedCredentials } from '../src/utils';

describe('post', () => {
  describe('#removeExportedCredentials', () => {
    it('does nothing when GOOGLE_GHA_CREDS_PATH is unset', async () => {
      delete process.env.GOOGLE_GHA_CREDS_PATH;
      const pth = await removeExportedCredentials();
      expect(pth).to.eq('');
    });

    it('deletes the file', async () => {
      const filePath = path.join(
        tmpdir(),
        crypto.randomBytes(12).toString('hex'),
      );
      await writeSecureFile(filePath, 'my data');
      process.env.GOOGLE_GHA_CREDS_PATH = filePath;
      const pth = await removeExportedCredentials();
      expect(existsSync(filePath)).to.be.false;
      expect(pth).to.eq(filePath);
    });

    it('does not fail if the file does not exist', async () => {
      const filePath = '/not/a/file';
      process.env.GOOGLE_GHA_CREDS_PATH = filePath;
      const pth = await removeExportedCredentials();
      expect(pth).to.eq('');
    });
  });
});
