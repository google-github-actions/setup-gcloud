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
import * as toolCache from '@actions/tool-cache';
import {
  authenticateGcloudSDK,
  getLatestGcloudSDKVersion,
  installComponent,
  installGcloudSDK,
  isInstalled,
  setProject,
} from '@google-github-actions/setup-cloud-sdk';
import {
  errorMessage,
  isPinnedToHead,
  pinnedToHeadWarning,
} from '@google-github-actions/actions-utils';
import path from 'path';

// Do not listen to the linter - this can NOT be rewritten as an ES6 import
// statement.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { version: appVersion } = require('../package.json');

export async function run(): Promise<void> {
  // Note: unlike the other actions, we actually want to export this as a
  // persistent variable for future steps. Other actions should set process.env
  // or use stubEnv to only set metrics for the duration of the step.
  core.exportVariable('CLOUDSDK_METRICS_ENVIRONMENT', 'github-actions-setup-gcloud');
  core.exportVariable('CLOUDSDK_METRICS_ENVIRONMENT_VERSION', appVersion);

  // Warn if pinned to HEAD
  if (isPinnedToHead()) {
    core.warning(pinnedToHeadWarning('v1'));
  }

  try {
    let version = core.getInput('version');
    if (!version || version == 'latest') {
      version = await getLatestGcloudSDKVersion();
    }

    // Install the gcloud if not already present
    if (!isInstalled(version)) {
      await installGcloudSDK(version);
    } else {
      const toolPath = toolCache.find('gcloud', version);
      core.addPath(path.join(toolPath, 'bin'));
    }

    // Install additional components
    const components = core.getInput('install_components');
    if (components) {
      await installComponent(components.split(',').map((comp) => comp.trim()));
    }

    // Authenticate - this comes from google-github-actions/auth
    const credFile = process.env.GOOGLE_GHA_CREDS_PATH;
    if (credFile) {
      await authenticateGcloudSDK(credFile);
      core.info('Successfully authenticated');
    } else {
      core.warning(
        'No authentication found for gcloud, authenticate with `google-github-actions/auth`.',
      );
    }

    // Set the project ID, if given.
    const projectId = core.getInput('project_id');
    if (projectId) {
      await setProject(projectId);
      core.info('Successfully set default project');
    }
  } catch (err) {
    const msg = errorMessage(err);
    core.setFailed(`google-github-actions/setup-gcloud failed with: ${msg}`);
  }
}

if (require.main === module) {
  run();
}
