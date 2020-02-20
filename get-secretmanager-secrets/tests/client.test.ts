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

import { Client } from '../src/client';

const secretRef =
  process.env.GITHUB_ACTIONS_GET_SECRETMANAGER_SECRET_SECRET_REF;

describe('Client', () => {
  it('initializes with JSON creds', () => {
    const client = new Client({
      credentials: `{"foo":"bar"}`,
    });
    expect(client.auth.jsonContent).eql({ foo: 'bar' });
  });

  it('initializes with ADC', () => {
    const client = new Client();
    expect(client.auth.jsonContent).eql(null);
  });

  it('accesses secrets', async function() {
    if (!secretRef) {
      this.skip();
    }

    const client = new Client();
    const result = await client.accessSecret(secretRef);
    expect(result).to.not.eql(null);
  });

  it('fails to access secrets with bad creds', () => {
    const fn = async (): Promise<string> => {
      const client = new Client({ credentials: `{"definitely":"bad"}` });
      return await client.accessSecret(secretRef);
    };
    expect(fn).to.throw(TypeError);
  });
});
