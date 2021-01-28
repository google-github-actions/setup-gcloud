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
import { KubeConfig, CoreV1Api } from '@kubernetes/client-node';

describe('E2E tests', function () {
  before(function () {
    if (!process.env.KUBECONFIG) {
      throw Error('KUBECONFIG not found.');
    }
  });
  it('can connect to cluster', async function () {
    const config = new KubeConfig();
    config.loadFromDefault();
    const client = config.makeApiClient(CoreV1Api);
    const pods = await client.listNamespacedPod('default');
    expect(pods.body.items.length).to.eq(0);
  });
});
