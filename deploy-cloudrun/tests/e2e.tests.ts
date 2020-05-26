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

import { got } from 'got';
import { expect } from 'chai';
import 'mocha';


describe('E2E tests', function () {
    let URL;
    before(function () {
        URL = process.env.URL;
        if (!URL) {
            throw Error('URL not found.');
        }
    })
    it('can make a request', async function () {
        const token = '';
        const response = await got(URL, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        expect(response.statusCode).to.be.equal('200');
        expect(response.body).to.include('Congrats');
    });
});
