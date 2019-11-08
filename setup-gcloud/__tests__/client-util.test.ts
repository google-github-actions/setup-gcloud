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
 * Tests client-util.
 */
import * as testUtil from '../src/test-util';
import * as util from '../src/client-util';

const TEST_TIMEOUT_MILLIS = 10000;

describe('queryGcloudSDKRelease tests', () => {
  it(
    'Finds matching version linux',
    async () => {
      const release: util.IGcloudSDKRelease | null = await util.queryGcloudSDKRelease(
        'linux',
        'x86_64',
        testUtil.TEST_SDK_VERSION,
      );
      expect(release).toBeDefined();
      expect(release!.name).toBe(
        `google-cloud-sdk-${testUtil.TEST_SDK_VERSION}-linux-x86_64.tar.gz`,
      );
      expect(release!.version).toBe(testUtil.TEST_SDK_VERSION);
      expect(release!.url).toEqual(
        expect.stringContaining(
          `https://www.googleapis.com/download/storage/v1/b/cloud-sdk-release/o/google-cloud-sdk-${testUtil.TEST_SDK_VERSION}-linux-x86_64.tar.gz`,
        ),
      );
    },
    TEST_TIMEOUT_MILLIS,
  );

  it(
    'Finds matching version windows',
    async () => {
      const release: util.IGcloudSDKRelease | null = await util.queryGcloudSDKRelease(
        'win32',
        'x86_64',
        testUtil.TEST_SDK_VERSION,
      );
      expect(release).toBeDefined();
      expect(release!.name).toBe(
        `google-cloud-sdk-${testUtil.TEST_SDK_VERSION}-windows-x86_64.zip`,
      );
      expect(release!.version).toBe(testUtil.TEST_SDK_VERSION);
      expect(release!.url).toEqual(
        expect.stringContaining(
          `https://www.googleapis.com/download/storage/v1/b/cloud-sdk-release/o/google-cloud-sdk-${testUtil.TEST_SDK_VERSION}-windows-x86_64.zip`,
        ),
      );
    },
    TEST_TIMEOUT_MILLIS,
  );

  it(
    'Finds matching version darwin',
    async () => {
      const release: util.IGcloudSDKRelease | null = await util.queryGcloudSDKRelease(
        'darwin',
        'x86_64',
        testUtil.TEST_SDK_VERSION,
      );
      expect(release).toBeDefined();
      expect(release!.name).toBe(
        `google-cloud-sdk-${testUtil.TEST_SDK_VERSION}-darwin-x86_64.tar.gz`,
      );
      expect(release!.version).toBe(testUtil.TEST_SDK_VERSION);
      expect(release!.url).toEqual(
        expect.stringContaining(
          `https://www.googleapis.com/download/storage/v1/b/cloud-sdk-release/o/google-cloud-sdk-${testUtil.TEST_SDK_VERSION}-darwin-x86_64.tar.gz`,
        ),
      );
    },
    TEST_TIMEOUT_MILLIS,
  );

  it('Errors on unsupported OS', async () => {
    await expect(
      util.queryGcloudSDKRelease('temple', 'x86_64', testUtil.TEST_SDK_VERSION),
    ).rejects.toThrow(expect.anything());
  });

  it('Returns null when no matches found', async () => {
    const release: util.IGcloudSDKRelease | null = await util.queryGcloudSDKRelease(
      'darwin',
      'MIPS',
      testUtil.TEST_SDK_VERSION,
    );
    expect(release).toBeNull();
  });
});
