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
import * as setupGcloud from '../../setupGcloudSDK/dist/index';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export const GCLOUD_METRICS_ENV_VAR = 'CLOUDSDK_METRICS_ENVIRONMENT';
export const GCLOUD_METRICS_LABEL = 'github-actions-setup-gcloud';

export async function run(): Promise<void> {
  core.exportVariable(GCLOUD_METRICS_ENV_VAR, GCLOUD_METRICS_LABEL);
  try {
    let version = core.getInput('version');
    if (!version || version == 'latest') {
      version = await setupGcloud.getLatestGcloudSDKVersion();
    }

    // Install the gcloud if not already present
    if (!setupGcloud.isInstalled(version)) {
      await setupGcloud.installGcloudSDK(version);
    } else {
      const toolPath = toolCache.find('gcloud', version);
      core.addPath(path.join(toolPath, 'bin'));
    }

    // Set the project ID, if given.
    const projectId = core.getInput('project_id');
    if (projectId) {
      await setupGcloud.setProject(projectId);
      core.info('Successfully set default project');
    }

    const serviceAccountKey = core.getInput('service_account_key');
    // If a service account key isn't provided, log an un-authenticated notice
    if (!serviceAccountKey) {
      core.info('No credentials provided, skipping authentication');
      return;
    } else {
      await setupGcloud.authenticateGcloudSDK(serviceAccountKey);
    }

    // Export credentials if requested - these credentials must be exported in
    // the shared workspace directory, since the filesystem must be shared among
    // all steps.
    const exportCreds = core.getInput('export_default_credentials');
    if (String(exportCreds).toLowerCase() === 'true') {
      let credsPath = core.getInput('credentials_file_path');

      if (!credsPath) {
        const credsDir = process.env.GITHUB_WORKSPACE;
        if (!credsDir) {
          throw new Error(
            'No path for credentials. Set credentials_file_path or process.env.GITHUB_WORKSPACE',
          );
        }

        credsPath = path.join(credsDir, uuidv4());
      }

      const serviceAccountKeyObj = setupGcloud.parseServiceAccountKey(
        serviceAccountKey,
      );

      await fs.writeFile(
        credsPath,
        JSON.stringify(serviceAccountKeyObj, null, 2), // Print to file as string w/ indents
      );
      core.exportVariable(
        'GCLOUD_PROJECT',
        projectId ? projectId : serviceAccountKeyObj.project_id,
      ); // If projectId is set export it, else export projectId from SA
      core.exportVariable('GOOGLE_APPLICATION_CREDENTIALS', credsPath);
      core.info('Successfully exported Default Application Credentials');
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}
