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
  parseServiceAccountKey,
  runCmdWithJsonFormat,
  setProject,
} from '@google-github-actions/setup-cloud-sdk';
import { writeSecureFile } from './utils';
import path from 'path';
import crypto from 'crypto';

export const GCLOUD_METRICS_ENV_VAR = 'CLOUDSDK_METRICS_ENVIRONMENT';
export const GCLOUD_METRICS_LABEL = 'github-actions-setup-gcloud';

export async function run(): Promise<void> {
  core.exportVariable(GCLOUD_METRICS_ENV_VAR, GCLOUD_METRICS_LABEL);
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
      await installComponent(
        components.split(',').map((comp) => comp.trim()),
        false,
      );
    }

    // Set the project ID, if given.
    const projectId = core.getInput('project_id');
    if (projectId) {
      await setProject(projectId);
      core.info('Successfully set default project');
    }

    const serviceAccountKey = core.getInput('service_account_key');
    // If a service account key is provided, add warning to use google-github-actions/auth
    if (serviceAccountKey) {
      core.warning(
        '"service_account_key" has been deprecated. ' +
          'Please switch to using google-github-actions/auth which supports both Workload Identity Federation and Service Account Key JSON authentication. ' +
          'For more details, see https://github.com/google-github-actions/setup-gcloud#authorization',
      );
    }

    // Either serviceAccountKey or GOOGLE_GHA_CREDS_PATH env var required
    if (serviceAccountKey || process.env.GOOGLE_GHA_CREDS_PATH) {
      await authenticateGcloudSDK(serviceAccountKey);
    } else {
      core.info('No credentials detected, skipping authentication');
    }

    // Export credentials if requested - these credentials are exported in the
    // shared temp directory, so the filesystem is available among all steps.
    const exportCreds = core.getBooleanInput('export_default_credentials');
    if (exportCreds) {
      let credsPath = core.getInput('credentials_file_path');
      if (!credsPath) {
        // Note: We explicitly and intentionally export to GITHUB_WORKSPACE
        // instead of RUNNER_TEMP, because RUNNER_TEMP is not shared with
        // Docker-based actions on the filesystem. Exporting to GITHUB_WORKSPACE
        // ensures that the exported credentials are automatically available to
        // Docker-based actions without user modification.
        //
        // This has the unintended side-effect of leaking credentials over time,
        // because GITHUB_WORKSPACE is not automatically cleaned up on
        // self-hosted runners. To mitigate this issue, this action defines a
        // post step to remove any created credentials.
        const githubWorkspace = process.env.GITHUB_WORKSPACE;
        if (!githubWorkspace) {
          throw new Error('$GITHUB_WORKSPACE is not set');
        }

        // Generate a random filename to store the credential. 12 bytes is 24
        // characters in hex. It's not the ideal entropy, but we have to be under
        // the 255 character limit for Windows filenames (which includes their
        // entire leading path).
        const uniqueName = crypto.randomBytes(12).toString('hex');
        credsPath = path.join(githubWorkspace, uniqueName);
      }

      const serviceAccountKeyObj = parseServiceAccountKey(serviceAccountKey);
      await writeSecureFile(
        credsPath,
        JSON.stringify(serviceAccountKeyObj, null, 2), // Print to file as string w/ indents
      );

      // If projectId is set export it, else export projectId from SA
      core.exportVariable(
        'GCLOUD_PROJECT',
        projectId ? projectId : serviceAccountKeyObj.project_id,
      );
      core.exportVariable('GOOGLE_APPLICATION_CREDENTIALS', credsPath);
      core.exportVariable('GOOGLE_GHA_CREDS_PATH', credsPath);
      core.info('Successfully exported Default Application Credentials');
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : error;
    core.setFailed(`google-github-actions/setup-gcloud failed with: ${msg}`);
  }
}
