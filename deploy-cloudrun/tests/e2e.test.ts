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
import { GoogleAuth } from 'google-auth-library';

describe('E2E tests', function() {
  let URL: string;
  before(function() {
    if (process.env.URL) {
      URL = process.env.URL;
    } else {
      throw Error('URL not found.');
    }
  });
  it('can make a request', async function() {
    // Requires ADC to be set
    const auth = new GoogleAuth();
    const client = await auth.getIdTokenClient(URL);
    const response = await client.request({ url: URL });
    expect(response.status).to.be.equal(200);
    console.log(response);
    expect(response.data).to.include('Congrats');
  });
});
