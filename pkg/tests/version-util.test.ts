/*
 * Copyright 2020 Google LLC
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
 * Tests version-util.
 */
import 'mocha';
import { expect } from 'chai';

import { getLatestGcloudSDKVersion } from '../src/version-util';

describe('#getLatestGcloudSDKVersion', function() {
  it('retrieves latest', async function() {
    const semVerPattern = /^[0-9]+\.[0-9]+\.[0-9]+$/;
    const result = await getLatestGcloudSDKVersion();
    expect(result).to.be;
    expect(result).to.match(semVerPattern);
  });
});
