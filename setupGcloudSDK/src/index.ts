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
import { getReleaseURL } from './format-url';
import * as downloadUtil from './download-util';
import * as installUtil from './install-util';
import { getLatestGcloudSDKVersion } from './version-util';

export { getLatestGcloudSDKVersion };

/**
 * Format of a GCloud configuration when using the GCloud CLI like this:
 * `gcloud config configurations describe $CONFIGURATION_NAME --format=json`
 */
export type GcloudJsonConfiguration = {
  is_active: boolean;
  name: string;
  properties: {
    core: {
      project: string;
    };
  };
};

/**
 * Checks if gcloud is installed.
 *
 * @param version (Optional) Cloud SDK version.
 * @return true if gcloud is found in toolpath.
 */
export function isInstalled(version?: string): boolean {
  let toolPath;
  if (version) {
    toolPath = toolCache.find('gcloud', version);
    return toolPath != undefined && toolPath !== '';
  } else {
    toolPath = toolCache.findAllVersions('gcloud');
    return toolPath.length > 0;
  }
}

/**
 * Returns the correct gcloud command for OS.
 *
 * @returns gcloud command.
 */
export function getToolCommand(): string {
  // A workaround for https://github.com/actions/toolkit/issues/229
  // Currently exec on windows runs as cmd shell.
  let toolCommand = 'gcloud';
  if (process.platform == 'win32') {
    toolCommand = 'gcloud.cmd';
  }
  return toolCommand;
}

/**
 * Checks if the project Id is set in the gcloud config.
 *
 * @returns true is project Id is set.
 */
export async function isProjectIdSet(): Promise<boolean> {
  // stdout captures project id
  let output = '';
  const stdout = (data: Buffer): void => {
    output += data.toString();
  };
  // stderr captures "(unset)"
  let errOutput = '';
  const stderr = (data: Buffer): void => {
    errOutput += data.toString();
  };
  const options = {
    listeners: {
      stdout,
      stderr,
    },
  };

  const toolCommand = getToolCommand();

  await exec.exec(toolCommand, ['config', 'get-value', 'project'], options);
  return !(output.includes('unset') || errOutput.includes('unset'));
}

/**
 * Checks if gcloud is authenticated.
 *
 * @returns true is gcloud is authenticated.
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

  const toolCommand = getToolCommand();

  await exec.exec(toolCommand, ['auth', 'list'], options);
  return !output.includes('No credentialed accounts.');
}

/**
 * Installs the gcloud SDK into the actions environment.
 *
 * @param version The version being installed.
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

  // Install the downloaded release into the github action env
  return await installUtil.installGcloudSDK(version, extPath);
}

/**
 * Parses the service account string into JSON.
 *
 * @param serviceAccountKey The service account key used for authentication.
 * @returns ServiceAccountKey as an object.
 */
export function parseServiceAccountKey(
  serviceAccountKey: string,
): ServiceAccountKey {
  let serviceAccount = serviceAccountKey;
  // Handle base64-encoded credentials
  if (!serviceAccountKey.trim().startsWith('{')) {
    serviceAccount = Buffer.from(serviceAccountKey, 'base64').toString('utf8');
  }
  return JSON.parse(serviceAccount);
}

/**
 * Fetches information about a configuration with the given name.
 * @param name Name of the configuration to be fetched.
 * @return undefined if a configuration with the given name does not (yet?) exist.
 */
export async function getConfiguration(
  name: string,
): Promise<GcloudJsonConfiguration | undefined> {
  const toolCommand = getToolCommand();

  let jsonOutput = '';

  const options = {
    listeners: {
      stdout: (data: Buffer): void => {
        jsonOutput += data.toString();
      },
    },
  };

  const returnCode = await exec.exec(
    toolCommand,
    ['config', 'configurations', 'describe', `--name=${name}`, '--format=json'],
    options,
  );
  if (returnCode !== 0) {
    return undefined;
  }
  return JSON.parse(jsonOutput) as GcloudJsonConfiguration;
}

/**
 * Checks if the configuration with the given name has been defined already.
 * @param name Name of the configuration to be checked for existence.
 * @return true if the configuration has already been defined.
 */
export async function hasConfiguration(name: string): Promise<boolean> {
  return (await getConfiguration(name)) !== undefined;
}

/**
 * Creates a new configuration with the given name.
 * @param name Name of the configuration to be created.
 * @param activate true if the configuration shall be activated after creation, false otherwise.
 */
export async function createConfiguration(
  name: string,
  activate = false,
): Promise<void> {
  const toolCommand = getToolCommand();
  const returnCode = await exec.exec(toolCommand, [
    'config',
    'configurations',
    'create',
    name,
    activate ? '--activate' : '--no-activate',
  ]);
  if (returnCode !== 0) {
    throw new Error(`Unable to create configuration "${name}"`);
  }
}

/**
 * Activates the configuration with the given name.
 * If the configuration does not (yet) exist, it can directly be created.
 * @param name Name of the configuration to be activated.
 * @param create true if the configuration shall be created if it does not yet exist prior to activating it.
 */
export async function activateConfiguration(
  name: string,
  create = true,
): Promise<void> {
  const exists = await hasConfiguration(name);
  if (!exists) {
    if (create) {
      await createConfiguration(name, true);
    } else {
      throw new Error(`Configuration ${name} does already exist.`);
    }
  } else {
    const toolCommand = getToolCommand();
    const returnCode = await exec.exec(toolCommand, [
      'config',
      'configurations',
      'activate',
      name,
    ]);
    if (returnCode !== 0) {
      throw new Error(`Unable to activate configuration "${name}"`);
    }
  }
}

/**
 * Authenticates the gcloud tool using a service account key.
 *
 * @param serviceAccountKey The service account key used for authentication.
 * @returns exit code.
 */
export async function authenticateGcloudSDK(
  serviceAccountKey: string,
): Promise<number> {
  tmp.setGracefulCleanup();
  const serviceAccountJson = parseServiceAccountKey(serviceAccountKey);
  const serviceAccountEmail = serviceAccountJson.client_email;

  const toolCommand = getToolCommand();
  // Authenticate as the specified service account.
  const options = { input: Buffer.from(JSON.stringify(serviceAccountJson)) };
  return await exec.exec(
    toolCommand,
    [
      '--quiet',
      'auth',
      'activate-service-account',
      serviceAccountEmail,
      '--key-file',
      '-',
    ],
    options,
  );
}

/**
 * Sets the GCP Project Id in the gcloud config.
 *
 * @param projectId The ID of the default project used in the current configuration.
 * @returns exit code.
 */
export async function setProject(projectId: string): Promise<number> {
  const toolCommand = getToolCommand();

  return await exec.exec(toolCommand, [
    '--quiet',
    'config',
    'set',
    'project',
    projectId,
  ]);
}

/**
 * Sets the GCP Project Id in the gcloud config.
 *
 * @param serviceAccountKey The service account key used for authentication.
 * @returns project ID.
 */
export async function setProjectWithKey(
  serviceAccountKey: string,
): Promise<string> {
  const serviceAccountJson = parseServiceAccountKey(serviceAccountKey);
  await setProject(serviceAccountJson.project_id);
  return serviceAccountJson.project_id;
}

interface ServiceAccountKey {
  type: string;
  project_id: string;
  project_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
}
