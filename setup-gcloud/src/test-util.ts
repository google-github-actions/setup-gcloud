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

/**
 * A collection of utility functions for testing.
 */
import path from 'path';

/**
 * Sets up a temporary directory for testing within the `__tests_/runner`
 * directory.
 *
 * @param leafName The leaf directory name.
 * @param envName If specified, the name of the environment variable the
 * temporary directory path will be saved to.
 */
export function setupTempDir(leafName: string, envName?: string): string {
  const tempDirPath = path.join(
    __dirname,
    'runner',
    Math.random()
      .toString(36)
      .substring(8),
    leafName,
  );
  if (envName) {
    process.env[envName!] = tempDirPath;
  }
  return tempDirPath;
}

/**
 * The version of the gcloud SDK being tested against.
 */
export const TEST_SDK_VERSIONS = ['0.9.83', '270.0.0', '272.0.0', '275.0.0'];

export const TEST_SDK_VERSION = TEST_SDK_VERSIONS[TEST_SDK_VERSIONS.length - 1];
