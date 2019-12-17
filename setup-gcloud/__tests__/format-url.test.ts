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
 * Tests format-url.
 */
import {TEST_SDK_VERSIONS} from '../src/test-util';
import {getReleaseURL} from '../src/format-url';
const TEST_TIMEOUT_MILLIS = 10000;

describe('getReleaseURL tests', () => {
  TEST_SDK_VERSIONS.forEach(TEST_SDK_VERSION => {
    const label = `[${TEST_SDK_VERSION}]`;
    it(
      `${label} Finds matching version linux`,
      async () => {
        const result = await resolveAsBoolean(
          getReleaseURL('linux', 'x86_64', TEST_SDK_VERSION),
        );
        expect(result).toBe(true);
      },
      TEST_TIMEOUT_MILLIS,
    );

    it(
      `${label} Finds matching version windows`,
      async () => {
        const result = await resolveAsBoolean(
          getReleaseURL('win32', 'x86_64', TEST_SDK_VERSION),
        );
        expect(result).toBe(true);
      },
      TEST_TIMEOUT_MILLIS,
    );

    it(
      `${label} Finds matching version darwin`,
      async () => {
        const result = await resolveAsBoolean(
          getReleaseURL('darwin', 'x86_64', TEST_SDK_VERSION),
        );
        expect(result).toBe(true);
      },
      TEST_TIMEOUT_MILLIS,
    );

    it(
      `${label} Errors on unsupported OS`,
      async () => {
        const result = await resolveAsBoolean(
          getReleaseURL('temple', 'x86_64', TEST_SDK_VERSION),
        );
        expect(result).toBe(false);
      },
      TEST_TIMEOUT_MILLIS,
    );
  });

  it(
    `Errors on unsupported version`,
    async () => {
      const result = await resolveAsBoolean(
        getReleaseURL('linux', 'x86_64', 'NONEXISTANT'),
      );
      expect(result).toBe(false);
    },
    TEST_TIMEOUT_MILLIS,
  );
});

function resolveAsBoolean(p: Promise<any>): Promise<boolean> {
  return p
    .then(() => Promise.resolve(true))
    .catch(() => Promise.resolve(false));
}
