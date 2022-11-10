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

import 'mocha';
import { expect } from 'chai';

import { getExecOutput, ExecOptions } from '@actions/exec';

const { TEST_ACCOUNT, TEST_PROJECT_ID, TEST_COMPONENTS } = process.env;

describe('#run', function () {
  it('has the correct account', async function () {
    if (!TEST_ACCOUNT) this.skip();

    const raw = await gcloudRun([
      '--quiet',
      'auth',
      'list',
      '--filter',
      'status:ACTIVE',
      '--format',
      'json',
    ]);
    const parsed = JSON.parse(raw)[0]?.['account'] || '(unset)';
    expect(parsed).to.eql(TEST_ACCOUNT.trim());
  });

  it('has the correct project_id', async function () {
    if (!TEST_PROJECT_ID) this.skip();

    const raw = await gcloudRun(['--quiet', 'config', 'list', 'core/project', '--format', 'json']);
    const parsed = JSON.parse(raw)['core']?.['project'] || '(unset)';

    expect(parsed.trim()).to.eql(TEST_PROJECT_ID.trim());
  });

  it('includes the given components', async function () {
    if (!TEST_COMPONENTS) this.skip();

    const raw = await gcloudRun([
      '--quiet',
      'components',
      'list',
      '--only-local-state',
      '--format',
      'json',
    ]);
    const parsed = JSON.parse(raw).map((entry: Record<string, any>) => entry['id']);

    const members = TEST_COMPONENTS.split(',').map((component) => component.trim());
    expect(parsed).to.include.all.members(members);
  });
});

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
