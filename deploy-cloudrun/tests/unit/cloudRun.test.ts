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
import 'mocha';

import { CloudRun } from '../../src/cloudRun';
import { Service } from '../../src/service';
import { JWT } from 'google-auth-library';

const credentials = process.env.TEST_DEPLOY_CLOUDRUN_CREDENTIALS;
const project = process.env.TEST_DEPLOY_CLOUDRUN_PROJECT;
const region = 'us-central1';
const image = 'gcr.io/cloudrun/hello';
const name = `test-${Math.round(Math.random() * 100000)}`; // Cloud Run currently has name length restrictions
const service = new Service({ image, name });

describe('CloudRun', function() {
  it('initializes with JSON creds', function() {
    const client = new CloudRun(region, {
      credentials: `{"foo":"bar"}`,
      projectId: 'test',
    });
    expect(client.auth.jsonContent).eql({ foo: 'bar' });
  });

  it('initializes with ADC', async function() {
    const client = new CloudRun(region);
    expect(client.auth.jsonContent).eql(null);
    const auth = (await client.getAuthClient()) as JWT;
    expect(auth.key).to.not.eql(undefined);
  });

  it('can deploy service', async function() {
    if (!credentials) {
      this.skip();
    }
    const client = new CloudRun(region, {
      credentials: credentials,
      projectId: project,
    });
    const result = await client.deploy(service);
    expect(result).to.not.eql(null);
    await client.delete(service);
  });
});
