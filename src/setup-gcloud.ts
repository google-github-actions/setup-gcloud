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
  getLatestGcloudSDKVersion,
  isInstalled,
  installGcloudSDK,
  setProject,
  authenticateGcloudSDK,
  parseServiceAccountKey,
} from '@google-github-actions/setup-cloud-sdk';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

export const GCLOUD_METRICS_ENV_VAR = 'CLOUDSDK_METRICS_ENVIRONMENT';
export const GCLOUD_METRICS_LABEL = 'github-actions-setup-gcloud';

/**
 * writeSecureFile writes a file to disk in a given directory with a
 * random name.
 *
 * @param outputPath Path in which to create random file in.
 * @param data Data to write to file.
 * @returns Path to written file.
 */
export async function writeSecureFile(
  outputPath: string,
  data: string,
): Promise<string> {
  // Write the file as 0640 so the owner has RW, group as R, and the file is
  // otherwise unreadable. Also write with EXCL to prevent a symlink attack.
  await fs.writeFile(outputPath, data, { mode: 0o640, flag: 'wx' });
  return outputPath;
}

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

    // Set the project ID, if given.
    const projectId = core.getInput('project_id');
    if (projectId) {
      await setProject(projectId);
      core.info('Successfully set default project');
    }

    const serviceAccountKey = core.getInput('service_account_key');
    // If a service account key isn't provided, log an un-authenticated notice
    if (!serviceAccountKey) {
      core.info('No credentials provided, skipping authentication');
      return;
    } else {
      await authenticateGcloudSDK(serviceAccountKey);
    }

    // Export credentials if requested - these credentials are exported in the
    // shared temp directory, so the filesystem is available among all steps.
    const exportCreds = core.getBooleanInput('export_default_credentials');
    if (exportCreds) {
      let credsPath = core.getInput('credentials_file_path');
      if (!credsPath) {
        const runnerTempDir = process.env.RUNNER_TEMP;
        if (!runnerTempDir) {
          throw new Error('$RUNNER_TEMP is not set');
        }

        // Generate a random filename to store the credential. 12 bytes is 24
        // characters in hex. It's not the ideal entropy, but we have to be under
        // the 255 character limit for Windows filenames (which includes their
        // entire leading path).
        const uniqueName = crypto.randomBytes(12).toString('hex');
        credsPath = path.join(runnerTempDir, uniqueName);
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
      core.info('Successfully exported Default Application Credentials');
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : error;
    core.setFailed(`google-github-actions/setup-gcloud failed with: ${msg}`);
  }
}
