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

import { expect } from 'chai';
import { CloudFunctionClient } from '../../src/cloudFunctionClient';

describe('CloudFunction', function () {
  it('integration test clean up', async function () {
    let CF_NAME: string;
    let projectId: string;
    let credentials: string;
    if (
      process.env.CF_NAME &&
      process.env.GCLOUD_PROJECT &&
      process.env.DEPLOY_CF_SA_KEY_JSON
    ) {
      CF_NAME = process.env.CF_NAME;
      projectId = process.env.GCLOUD_PROJECT;
      credentials = process.env.DEPLOY_CF_SA_KEY_JSON;
    } else {
      throw Error(
        'Cloud Function name, project id and credentials are required.',
      );
    }
    const client = new CloudFunctionClient('us-central1', {
      projectId,
      credentials,
    });
    const deleteF = await client.delete(CF_NAME);
    expect(deleteF.done).to.eq(true);
  });
});
