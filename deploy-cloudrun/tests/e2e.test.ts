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
import { GoogleAuth } from 'google-auth-library';
import { CloudRun } from '../src/cloudRun';
import { parseEnvVars } from '../src/service';
import * as _ from 'lodash';
import 'mocha';
import { run_v1 } from 'googleapis';

describe('E2E tests', function() {
  const { PARAMS, ANNOTATIONS, LABELS, ENV, SERVICE } = process.env;

  let URL: string;
  let service: run_v1.Schema$Service;
  before(async function() {
    if (process.env.URL) {
      URL = process.env.URL;
    } else {
      throw Error('URL not found.');
    }

    if (SERVICE) {
      const client = new CloudRun('us-central1');
      service = await client.getService(SERVICE);
      if (!service) console.log('no service found');
    }
  });

  it('can make a request', async function() {
    // Requires ADC to be set
    const auth = new GoogleAuth();
    const client = await auth.getIdTokenClient(URL);
    const response = await client.request({ url: URL });
    expect(response.status).to.be.equal(200);
    expect(response.data).to.include('Congrat');
  });

  it('it has the correct env vars', function() {
    if (ENV && service) {
      const expected = parseEnvVars(ENV);
      const containers = _.get(service, 'spec.template.spec.containers');
      const actual = containers[0]?.env;
      expect(actual).to.have.lengthOf(expected.length);
      actual.forEach((envVar: run_v1.Schema$EnvVar) => {
        const found = expected.find((expectedEnvVar) =>
          _.isEqual(envVar, expectedEnvVar),
        );
        expect(found).to.not.equal(undefined);
      });
    }
  });

  it('it has the correct params', function() {
    if (PARAMS && service) {
      const expected = JSON.parse(PARAMS);
      const actual = _.get(service, 'spec.template.spec');

      if (expected.containerConncurrency) {
        expect(actual.containerConncurrency).to.equal(
          expected.containerConncurrency,
        );
      }
      if (expected.timeoutSeconds) {
        expect(actual.timeoutSeconds).to.equal(expected.timeoutSeconds);
      }
      const actualResources = actual.containers[0].resources;
      if (expected.cpu) {
        expect(actualResources.limits.cpu).to.equal(expected.cpu.toString());
      }
      if (expected.memory) {
        expect(actualResources.limits.memory).to.equal(expected.memory);
      }
    }
  });

  it('it has the correct annotations', function() {
    if (ANNOTATIONS && service) {
      const expected = JSON.parse(ANNOTATIONS);
      const actual = _.get(service, 'spec.template.metadata.annotations');

      Object.entries(expected).forEach((annot: object) => {
        const found = Object.entries(actual).find((actualAnnot: object) =>
          _.isEqual(annot, actualAnnot),
        );
        expect(found).to.not.equal(undefined);
      });
    }
  });

  it('it has the correct labels', function() {
    if (LABELS && service) {
      const expected = JSON.parse(LABELS);
      const actual = _.get(service, 'spec.template.metadata.labels');

      Object.entries(expected).forEach((label: object) => {
        const found = Object.entries(actual).find((actualLabel: object) =>
          _.isEqual(label, actualLabel),
        );
        expect(found).to.not.equal(undefined);
      });
    }
  });
});
