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

import { describe, it } from 'node:test';
import assert from 'node:assert';

import { getExecOutput, ExecOptions } from '@actions/exec';

const skipIfMissingEnvs = (...keys: string[]): { skip: string } | undefined => {
  const missingKeys: string[] = [];

  for (const key of keys) {
    if (!(key in process.env)) {
      missingKeys.push(key);
    }
  }

  if (missingKeys.length > 0) {
    return { skip: `missing $${missingKeys.join(', $')}` };
  }
  return undefined;
};

describe(
  '#run',
  skipIfMissingEnvs('TEST_ACCOUNT', 'TEST_PROJECT_ID', 'TEST_COMPONENTS'),
  async () => {
    const testAccount = process.env.TEST_ACCOUNT!;
    const testProjectID = process.env.TEST_PROJECT_ID!;
    const testComponents = process.env.TEST_COMPONENTS!;

    it('has the correct account', async () => {
      const raw = await gcloudRun([
        '--quiet',
        'auth',
        'list',
        '--filter',
        'status:ACTIVE',
        '--format',
        'json',
      ]);
      const result = JSON.parse(raw)[0]?.['account'] || '(unset)';
      assert.deepStrictEqual(result, testAccount);
    });

    it('has the correct project_id', async () => {
      const raw = await gcloudRun([
        '--quiet',
        'config',
        'list',
        'core/project',
        '--format',
        'json',
      ]);
      const result = JSON.parse(raw)['core']?.['project'] || '(unset)';
      assert.deepStrictEqual(result, testProjectID);
    });

    it('includes the given components', async () => {
      const raw = await gcloudRun([
        '--quiet',
        'components',
        'list',
        '--only-local-state',
        '--format',
        'json',
      ]);
      const result = JSON.parse(raw).map((entry: Record<string, any>) => entry['id']);
      const members = testComponents.split(',').map((component) => component.trim());

      const intersection = members.filter((v) => result.includes(v));
      assert.deepStrictEqual(intersection, members);
    });
  },
);

async function gcloudRun(cmd: string[], options?: ExecOptions): Promise<string> {
  // A workaround for https://github.com/actions/toolkit/issues/229
  let toolCommand = 'gcloud';
  if (process.platform == 'win32') {
    toolCommand = 'gcloud.cmd';
  }

  const opts = Object.assign({}, { silent: true, ignoreReturnCode: true }, options);
  const commandString = `${toolCommand} ${cmd.join(' ')}`;

  const result = await getExecOutput(toolCommand, cmd, opts);
  if (result.exitCode !== 0) {
    const errMsg = result.stderr || `command exited ${result.exitCode}, but stderr had no output`;
    throw new Error(`failed to execute command \`${commandString}\`: ${errMsg}`);
  }
  return result.stdout;
}
