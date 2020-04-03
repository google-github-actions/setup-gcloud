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
import * as setupGcloud from '../../setupGloudSDK/dist/index';

async function run(): Promise<void> {
  try {
    // Get action inputs.
    const projectId = core.getInput('project_id');
    const deliverables = core.getInput('deliverables');
    const imageUrl = core.getInput('image-url');
    const version = core.getInput('version');
    const promote = core.getInput('promote');

    if (!setupGcloud.isInstalled()) {
      const gcloudVersion = await setupGcloud.getLatestGcloudSDKVersion();
      await setupGcloud.installGcloudSDK(gcloudVersion);
    }

    // Get credentials and authenticate Cloud SDK.
    const serviceAccountKey = core.getInput('credentials');
    if (serviceAccountKey) {
      await setupGcloud.authenticateGcloudSDK(serviceAccountKey);
    }
    if (!setupGcloud.isAuthenticated()) {
      core.setFailed('Error authenticating the Cloud SDK.');
    }

    // A workaround for https://github.com/actions/toolkit/issues/229
    // Currently exec on windows runs as cmd shell.
    let toolCommand = 'gcloud';
    if (process.platform == 'win32') {
      toolCommand = 'gcloud.cmd';
    }

    // Create gcloud cmd.
    const appDeployCmd = ['app', 'deploy', '--quiet', deliverables];

    // Add gcloud flags.
    if (projectId) {
      appDeployCmd.push('--project', projectId);
    }
    if (imageUrl) {
      appDeployCmd.push('--image-url', imageUrl);
    }
    if (version) {
      appDeployCmd.push('--version', version);
    }
    if (promote) {
      appDeployCmd.push('--promote');
    } else {
      appDeployCmd.push('--no-promote');
    }

    // Get output of gcloud cmd.
    let output = '';
    const stdout = (data: Buffer): void => {
      output += data.toString();
    };

    const options = {
      listeners: {
        stdout,
      },
    };

    // Run gcloud cmd.
    await exec.exec(toolCommand, appDeployCmd, options);

    // Set url as output.
    const urlMatch = output.match(
      /https:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.com/,
    );
    if (urlMatch) {
      const url = urlMatch[0];
      core.setOutput('url', url);
    } else {
      // gcloud config list --format='value(core.project)'
      core.setOutput('url', `https://${projectId}.appspot.com/`);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
