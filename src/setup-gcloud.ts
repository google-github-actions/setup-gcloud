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
  setProject,
} from '@google-github-actions/setup-cloud-sdk';
import { writeSecureFile } from './utils';
import path from 'path';
import crypto from 'crypto';

export const GCLOUD_METRICS_ENV_VAR = 'CLOUDSDK_METRICS_ENVIRONMENT';
export const GCLOUD_METRICS_LABEL = 'github-actions-setup-gcloud';

const actionRef = process.env.GITHUB_ACTION_REF;

export async function run(): Promise<void> {
  if (actionRef == 'main' || actionRef == 'master') {
    core.warning(
      `google-github-actions/setup-gcloud is pinned at HEAD. We strongly ` +
        `advise against pinning to "@master" as it may be unstable. Please ` +
        `update your GitHub Action YAML from:\n\n` +
        `    uses: 'google-github-actions/setup-gcloud@master'\n\n` +
        `to:\n\n` +
        `    uses: 'google-github-actions/setup-gcloud@v0'\n\n` +
        `Alternatively, you can pin to any git tag or git SHA in the ` +
        `repository.`,
    );
  }

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
      await installComponent(components.split(',').map((comp) => comp.trim()));
    }

    // Set the project ID, if given.
    let projectId = core.getInput('project_id');
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
      let saProjectID = '';

      // If explicit SA input, parse it, write to disk and set GCLOUD_PROJECT.
      if (serviceAccountKey) {
        const serviceAccountKeyObj = parseServiceAccountKey(serviceAccountKey);
        await writeSecureFile(
          credsPath,
          JSON.stringify(serviceAccountKeyObj, null, 2), // Print to file as string w/ indents
        );
        saProjectID = serviceAccountKeyObj.project_id;
      } else if (process.env.GOOGLE_GHA_CREDS_PATH) {
        // No explicit SA input but process.env.GOOGLE_GHA_CREDS_PATH is set.
        // process.env.GOOGLE_GHA_CREDS_PATH already contains credentials written to disk,
        // so set credsPath to the existing cred filepath.
        credsPath = process.env.GOOGLE_GHA_CREDS_PATH;
        // User is likely using google-github-actions/auth for auth followed by setup-gcloud with export_default_credentials.
        // This is unnecessary as auth already exports credentials.
        core.warning(
          'Credentials detected and possibly exported using google-github-actions/auth. ' +
            'google-github-actions/auth exports credentials by default. ' +
            'This will be an error in a future release.',
        );
      } else {
        throw new Error('No credentials provided to export');
      }

      // If both explicit project id and sa key project id, warn user if they are different
      if (projectId && saProjectID && saProjectID != projectId) {
        core.warning(
          `Service Account project id ${saProjectID} and` +
            ` input project_id ${projectId} differ. Input project_id ${projectId} will be exported.`,
        );
      } else if (!projectId && saProjectID) {
        // no explicit project id, use sa key project id if set
        projectId = saProjectID;
      }
      if (projectId) {
        core.exportVariable('GCLOUD_PROJECT', projectId);
        core.info(`Successfully exported GCLOUD_PROJECT ${projectId}`);
      }

      core.exportVariable('GOOGLE_APPLICATION_CREDENTIALS', credsPath);
      core.exportVariable('GOOGLE_GHA_CREDS_PATH', credsPath);
      core.info('Successfully exported Default Application Credentials');
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : error;
    core.setFailed(`google-github-actions/setup-gcloud failed with: ${msg}`);
  }
}
