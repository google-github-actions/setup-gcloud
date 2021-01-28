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
 * Creates an overridden runner cache and tool path. This is slightly
 * complicated by the fact that the runner initializes its cache path exactly
 * once at startup, so this must be imported and called BEFORE the toolcache is
 * used.
 */
export class TestToolCache {
  private static paths: [string, string];

  /**
   * Creates temporary directories for the runner cache and temp, and configures
   * the Action's runner to use said directories.
   *
   * @returns two strings - first is overridden toolsPath, second is tempPath.
   */
  public static override(): [string, string] {
    if (this.paths?.length > 0) {
      return this.paths;
    }

    const rootPath = path.join(__dirname, 'runner', this.randomStr());

    const toolsPath = path.join(rootPath, 'tools');
    process.env.RUNNER_TOOL_CACHE = toolsPath;

    const tempPath = path.join(rootPath, 'temp');
    process.env.RUNNER_TEMP = tempPath;

    this.paths = [toolsPath, tempPath];
    return this.paths;
  }

  private static randomStr(): string {
    return Math.random()
      .toString(36)
      .substring(8);
  }
}

/**
 * The version of the gcloud SDK being tested against.
 */
export const TEST_SDK_VERSIONS = ['0.9.83', '270.0.0', '272.0.0', '275.0.0'];

export const TEST_SDK_VERSION = TEST_SDK_VERSIONS[TEST_SDK_VERSIONS.length - 1];
