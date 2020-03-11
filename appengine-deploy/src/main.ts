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

import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as toolCache from '@actions/tool-cache';
// import { execSync } from 'child_process';
import * as tmp from 'tmp';
import {Base64} from 'js-base64';
import { installGcloudSDK } from '../../setup-gcloud/src/setup-gcloud';
import {promises as fs} from 'fs';
/**
 * Executes the main action. It includes the main business logic and is the
 * primary entry point. It is documented inline.
 */
async function run(): Promise<void> {
  try {
    // Get action inputs.
    const projectId = core.getInput('project_id', { required: true });
    const deliverables = core.getInput('deliverables');
    const imageUrl = core.getInput('image-url');
    const version = core.getInput('version');
    const promote = core.getInput('promote');

    // Get credentials, if any.
    // const credentials = core.getInput('credentials');

// COPY AND PAST ------------------------------------
    tmp.setGracefulCleanup();
    // Install gcloud.
    let toolPath = toolCache.find('gcloud', `282.0.0`);
    if (!toolPath) {
      toolPath = await installGcloudSDK('282.0.0');
    }

    const serviceAccountKey = core.getInput('credentials');

    // Handle base64-encoded credentials
    let serviceAccountJSON = serviceAccountKey;
    if (!serviceAccountKey.trim().startsWith('{')) {
      serviceAccountJSON = Base64.decode(serviceAccountKey);
    }

    // write the service account key to a temporary file
    //
    // TODO: if actions/toolkit#164 is fixed, pass the key in on stdin and avoid
    // writing a file to disk.
    const tmpKeyFilePath = await new Promise<string>((resolve, reject) => {
      tmp.file((err, path, fd, cleanupCallback) => {
        if (err) {
          reject(err);
        }
        resolve(path);
      });
    });
    await fs.writeFile(tmpKeyFilePath, serviceAccountJSON);

    // A workaround for https://github.com/actions/toolkit/issues/229
    // Currently exec on windows runs as cmd shell.
    let toolCommand = 'gcloud';
    if (process.platform == 'win32') {
      toolCommand = 'gcloud.cmd';
    }

    // authenticate as the specified service account
    await exec.exec(
      `${toolCommand} auth activate-service-account --key-file=${tmpKeyFilePath}`,
    );


// END -------------------

    // gcloud Flag set up.
    const addImageUrl = imageUrl ? `--image-url=${imageUrl}` : '';
    const addVersion = version ? `--version=${version}` : '';
    const addPromote = promote ? '--promote' : '--no-promote';

    // Get output of gcloud cmd.
    let myOutput = '';
    let myError = '';

    const options = {listeners: {}};
    options.listeners = {
      stdout: (data: Buffer) => {
        myOutput += data.toString();
      }
    };
    // Run gcloud.
    await exec.exec(
      'gcloud',
      ['app', 'deploy', '--quiet', deliverables, `--project=${projectId}`, addImageUrl, addVersion, addPromote],
      options);


    core.info(myOutput);
    // Set output url.
    // TODO update this!!!!
    core.setOutput('url', `https://${projectId}.appspot.com/`);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
