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

import * as exec from '@actions/exec';
import * as toolCache from '@actions/tool-cache';
import * as os from 'os';
import * as tmp from 'tmp';
import { promises as fs } from 'fs';
import { getReleaseURL } from './format-url';
import * as downloadUtil from './download-util';
import * as installUtil from './install-util';
import { getLatestGcloudSDKVersion } from './version-util';

export { getLatestGcloudSDKVersion };

/**
 * Checks if gcloud is installed
 *
 * @param version (Optional) Cloud SDK version
 * @return true if gcloud is found in toolpath
 */
export function isInstalled(version?: string): boolean {
  let toolPath;
  if (version) {
    toolPath = toolCache.find('gcloud', version);
  } else {
    toolPath = toolCache.findAllVersions('gcloud');
  }
  return toolPath != undefined;
}

/**
 * Checks if gcloud is authenticated
 *
 * @returns true is gcloud is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  let output = '';
  const stdout = (data: Buffer): void => {
    output += data.toString();
  };
  const options = {
    listeners: {
      stdout,
    },
  };

  await exec.exec('gcloud', ['auth', 'list'], options);
  return !output.includes('No credentialed accounts.');
}

 /**
  * Installs the gcloud SDK into the actions environment.
  *
  * @param version The version being installed.
  * @param gcloudExtPath The extraction path for the gcloud SDK.
  * @returns The path of the installed tool.
  */
export async function installGcloudSDK(version: string): Promise<string> {
  // Retreive the release corresponding to the specified version and OS
  const osPlat = os.platform();
  const osArch = os.arch();
  const url = await getReleaseURL(osPlat, osArch, version);

  // Download and extract the release
  const extPath = await downloadUtil.downloadAndExtractTool(url);
  if (!extPath) {
    throw new Error(`Failed to download release, url: ${url}`);
  }

  // install the downloaded release into the github action env
  return await installUtil.installGcloudSDK(version, extPath);
}

/**
 * Authenticates the gcloud tool using a service account key
 *
 * @param serviceAccountKey The serive account key used for authentication.
 * @returns exit code
 */
export async function authenticateGcloudSDK(
  serviceAccountKey: string,
): Promise<number> {
  tmp.setGracefulCleanup();
  let serviceAccount = serviceAccountKey;
  // Handle base64-encoded credentials
  if (!serviceAccountKey.trim().startsWith('{')) {
    serviceAccount = Buffer.from(serviceAccountKey, 'base64').toString('utf8');
  }
  const serviceAccountJson = JSON.parse(serviceAccount);
  const serviceAccountEmail = serviceAccountJson.client_email;

  // A workaround for https://github.com/actions/toolkit/issues/229
  // Currently exec on windows runs as cmd shell.
  let toolCommand = 'gcloud';
  if (process.platform == 'win32') {
    toolCommand = 'gcloud.cmd';
  }

  // write the service account key  dto a temporary file
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
  await fs.writeFile(tmpKeyFilePath, serviceAccount);

  // Authenticate as the specified service account.
  return await exec.exec(toolCommand, [
    '--quiet',
    'auth',
    'activate-service-account',
    serviceAccountEmail,
    '--key-file',
    tmpKeyFilePath,
  ]);
}
