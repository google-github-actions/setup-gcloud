/*
 * Copyright 2022 Google LLC
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

import { test } from 'node:test';
import assert from 'node:assert';

import { gcloudRunJSON } from '@google-github-actions/setup-cloud-sdk';
import { skipIfMissingEnv } from '@google-github-actions/actions-utils';

test(
  '#run',
  {
    concurrency: true,
    skip: skipIfMissingEnv('TEST_ACCOUNT', 'TEST_PROJECT_ID', 'TEST_COMPONENTS'),
  },
  async (suite) => {
    const testAccount = process.env.TEST_ACCOUNT!;
    const testProjectID = process.env.TEST_PROJECT_ID!;
    const testComponents = process.env.TEST_COMPONENTS!;

    await suite.test('has the correct account', async () => {
      const raw = await gcloudRunJSON(['--quiet', 'auth', 'list', '--filter', 'status:ACTIVE']);
      const result = raw?.at(0)?.acccount || '(unset)';
      assert.deepStrictEqual(result, testAccount);
    });

    await suite.test('has the correct project_id', async () => {
      const raw = await gcloudRunJSON(['--quiet', 'config', 'list', 'core/project']);
      const result = raw?.core?.project || '(unset)';
      assert.deepStrictEqual(result, testProjectID);
    });

    await suite.test('includes the given components', async () => {
      const raw = await gcloudRunJSON(['--quiet', 'components', 'list', '--only-local-state']);
      const result = raw.map((entry: Record<string, any>) => entry.id);
      const members = testComponents.split(',').map((component) => component.trim());

      const intersection = members.filter((v) => result.includes(v));
      assert.deepStrictEqual(intersection, members);
    });
  },
);
