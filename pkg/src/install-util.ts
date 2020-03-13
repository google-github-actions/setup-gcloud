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

/**
 * Contains installation utility functions.
 */
import * as toolCache from '@actions/tool-cache';
import * as core from '@actions/core';
import path from 'path';

export const GCLOUD_METRICS_ENV_VAR = 'CLOUDSDK_METRICS_ENVIRONMENT';
export const GCLOUD_METRICS_LABEL = 'github-actions-setup-gcloud';

/**
 * Installs the gcloud SDK into the actions environment.
 *
 * @param version The version being installed.
 * @param gcloudExtPath The extraction path for the gcloud SDK.
 * @returns The path of the installed tool.
 */
export async function installGcloudSDK(
  version: string,
  gcloudExtPath: string,
): Promise<string> {
  const toolRoot = path.join(gcloudExtPath, 'google-cloud-sdk');
  let toolPath = await toolCache.cacheDir(toolRoot, 'gcloud', version);
  toolPath = path.join(toolPath, 'bin');
  core.addPath(toolPath);
  core.exportVariable(GCLOUD_METRICS_ENV_VAR, GCLOUD_METRICS_LABEL);
  return toolPath;
}
