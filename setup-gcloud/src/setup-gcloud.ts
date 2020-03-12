/*
 * Copyright 2019 Google LLC
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

import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as toolCache from '@actions/tool-cache';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as tmp from 'tmp';
import * as os from 'os';
import { getReleaseURL } from '../src/format-url';
import { getLatestGcloudSDKVersion } from '../src/version-util';
import * as downloadUtil from './download-util';
import * as installUtil from './install-util';

async function installGcloudSDK(version: string): Promise<string> {
  // retreive the release corresponding to the specified version and the current env
  const osPlat = os.platform();
  const osArch = os.arch();
  const url = await getReleaseURL(osPlat, osArch, version);

  // download and extract the release
  const extPath = await downloadUtil.downloadAndExtractTool(url);
  if (!extPath) {
    throw new Error(`Failed to download release, url: ${url}`);
  }

  // install the downloaded release into the github action env
  return await installUtil.installGcloudSDK(version, extPath);
}

async function run(): Promise<void> {
  try {
    tmp.setGracefulCleanup();

    let version = core.getInput('version');
    if (!version || version == 'latest') {
      version = await getLatestGcloudSDKVersion();
    }

    // install the gcloud if not already present
    let toolPath = toolCache.find('gcloud', version);
    if (!toolPath) {
      toolPath = await installGcloudSDK(version);
      core.info('Successfully installed gcloud Cloud SDK');
    }

    // A workaround for https://github.com/actions/toolkit/issues/229
    // Currently exec on windows runs as cmd shell.
    let toolCommand = 'gcloud';
    if (process.platform == 'win32') {
      toolCommand = 'gcloud.cmd';
    }

    // Set the project ID, if given.
    const projectId = core.getInput('project_id');
    if (projectId) {
      await exec.exec(toolCommand, [
        '--quiet',
        'config',
        'set',
        'core/project',
        projectId,
      ]);
      core.info('Successfully set default project');
    }

    const serviceAccountEmail = core.getInput('service_account_email') || '';
    const serviceAccountKey = core.getInput('service_account_key');

    // if a service account key isn't provided, log an un-authenticated notice
    if (!serviceAccountKey) {
      core.info('No credentials provided, skipping authentication');
      return;
    }

    // Handle base64-encoded credentials
    let serviceAccountJSON = serviceAccountKey;
    if (!serviceAccountKey.trim().startsWith('{')) {
      serviceAccountJSON = Buffer.from(serviceAccountKey, 'base64').toString();
    }

    // write the service account key to a temporary file
    //
    // TODO: if actions/toolkit#164 is fixed, pass the key in on stdin and avoid
    // writing a file to disk.
    const tmpKeyFilePath = await new Promise<string>((resolve, reject) => {
      tmp.file((err, path) => {
        if (err) {
          reject(err);
        }
        resolve(path);
      });
    });
    await fs.writeFile(tmpKeyFilePath, serviceAccountJSON);

    // Authenticate as the specified service account.
    await exec.exec(toolCommand, [
      '--quiet',
      'auth',
      'activate-service-account',
      serviceAccountEmail,
      '--key-file',
      tmpKeyFilePath,
    ]);

    // Export credentials if requested - these credentials must be exported in
    // the shared workspace directory, since the filesystem must be shared among
    // all steps.
    const exportCreds = core.getInput('export_default_credentials');
    if (String(exportCreds).toLowerCase() === 'true') {
      const workspace = process.env.GITHUB_WORKSPACE;
      if (!workspace) {
        throw new Error('Missing GITHUB_WORKSPACE!');
      }

      const credsPath = path.join(workspace, uuidv4());
      await fs.writeFile(credsPath, serviceAccountJSON);

      core.exportVariable('GOOGLE_APPLICATION_CREDENTIALS', credsPath);
      core.info('Successfully exported Default Application Credentials');
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
