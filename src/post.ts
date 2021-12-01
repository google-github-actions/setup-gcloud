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

import { getBooleanInput, setFailed, info as logInfo } from '@actions/core';
import { removeExportedCredentials } from './utils';

/**
 * Executes the post action, documented inline.
 */
export async function run(): Promise<void> {
  try {
    const cleanupCredentials: boolean = getBooleanInput('cleanup_credentials');
    if (!cleanupCredentials) {
      return;
    }

    const exportedPath = await removeExportedCredentials();
    if (exportedPath) {
      logInfo(`Removed exported credentials at ${exportedPath}`);
    } else {
      logInfo('No exported credentials found');
    }
  } catch (err) {
    setFailed(`google-github-actions/setup-gcloud post failed with: ${err}`);
  }
}

run();
