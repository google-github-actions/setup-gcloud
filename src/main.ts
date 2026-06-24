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
  bestVersion,
  installComponent,
  installGcloudSDK,
  isAuthenticated,
  setProject,
} from '@google-github-actions/setup-cloud-sdk';
import {
  errorMessage,
  isPinnedToHead,
  pinnedToHeadWarning,
  parseBoolean,
  presence,
} from '@google-github-actions/actions-utils';
import { promises as fs } from 'fs';
import path from 'path';

// Do not listen to the linter - this can NOT be rewritten as an ES6 import
// statement.
const { version: appVersion } = require('../package.json');

/**
 * parseVersionFile extracts a gcloud version or version constraint from the
 * contents of a version file. It supports asdf/mise-style ".tool-versions"
 * files (a "gcloud <version>" line) as well as plain version files containing
 * just a version string. Blank lines and "#" comments are ignored.
 *
 * @param contents The raw contents of the version file.
 * @returns The resolved version string, or an empty string if none was found.
 */
export function parseVersionFile(contents: string): string {
  const lines = contents.split(/\r?\n/);

  // First, look for an asdf/mise ".tool-versions" entry ("gcloud <version>"),
  // which may appear on any line. asdf uses the first token as the version.
  for (const line of lines) {
    const toolVersionsMatch = line.trim().match(/^gcloud\s+(\S+)/i);
    if (toolVersionsMatch) {
      return toolVersionsMatch[1];
    }
  }

  // Otherwise treat the file as a plain version file and return the first
  // non-comment, non-blank line, so that a version constraint such as
  // ">= 416.0.0" is preserved.
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      return trimmed;
    }
  }

  return '';
}

export async function run(): Promise<void> {
  // Note: unlike the other actions, we actually want to export this as a
  // persistent variable for future steps. Other actions should set process.env
  // or use stubEnv to only set metrics for the duration of the step.
  core.exportVariable('CLOUDSDK_METRICS_ENVIRONMENT', 'github-actions-setup-gcloud');
  core.exportVariable('CLOUDSDK_METRICS_ENVIRONMENT_VERSION', appVersion);

  process.env.CLOUDSDK_CORE_DISABLE_PROMPTS = '1';

  // Warn if pinned to HEAD
  if (isPinnedToHead()) {
    core.warning(pinnedToHeadWarning('v3'));
  }

  try {
    const skipInstall = parseBoolean(core.getInput('skip_install'));
    let version = presence(core.getInput('version'));
    const components = core.getInput('install_components');
    const projectId = core.getInput('project_id');
    const cache = parseBoolean(core.getInput('cache'));

    if (skipInstall) {
      core.info(`Skipping installation ("skip_install" was true)`);
      if (version && version !== 'latest') {
        core.warning(`Ignoring "version" because "skip_install" was true!`);
      }

      if (components) {
        core.warning(
          `Installing custom components with the system-provided gcloud may fail. ` +
            `Set "skip_install" to false to install a managed version.`,
        );
      }
    } else {
      // If a version file was provided, resolve the version from it. An
      // explicitly-provided "version" (anything other than the default
      // "latest") takes precedence over the file.
      const versionFile = presence(core.getInput('version_file'));
      if (versionFile) {
        if (version && version !== 'latest') {
          core.warning(
            `Both "version" ("${version}") and "version_file" were specified; ` +
              `using "version" and ignoring "version_file".`,
          );
        } else {
          const contents = await fs.readFile(versionFile, 'utf8');
          version = presence(parseVersionFile(contents));
          if (!version) {
            throw new Error(
              `Failed to resolve a gcloud version from version_file "${versionFile}"`,
            );
          }
          core.debug(`resolved version "${version}" from version_file "${versionFile}"`);
        }
      }

      // Compute the version information. If the version was not specified,
      // accept any installed version. If the version was specified as "latest",
      // compute the latest version. Otherwise, accept the version/version
      // constraint as-is.
      if (!version) {
        core.debug(`version was unset, defaulting to any version`);
        version = '> 0.0.0';
      }
      if (version === 'latest') {
        core.debug(`resolving latest version`);
        version = await bestVersion('> 0.0.0');
        core.debug(`resolved latest version to ${version}`);
      }

      // Install the gcloud if not already present
      const toolPath = toolCache.find('gcloud', version);
      if (toolPath !== '') {
        core.addPath(path.join(toolPath, 'bin'));
      } else {
        core.debug(`no version of gcloud matching "${version}" is installed`);
        await installGcloudSDK(version, cache);
      }
    }

    // Install additional components
    if (components) {
      await installComponent(components.split(',').map((comp) => comp.trim()));
    }

    // Authenticate - this comes from google-github-actions/auth
    const credFile = process.env.GOOGLE_GHA_CREDS_PATH;
    if (credFile) {
      await authenticateGcloudSDK(credFile);
      core.info('Successfully authenticated');
    } else {
      let authed;
      try {
        authed = await isAuthenticated();
      } catch {
        authed = false;
      }

      if (!authed) {
        core.warning(
          `The gcloud CLI is not authenticated (or it is not installed). ` +
            `Authenticate by adding the "google-github-actions/auth" step ` +
            `prior this one.`,
        );
      }
    }

    // Set the project ID, if given.
    if (projectId) {
      await setProject(projectId);
      core.info('Successfully set default project');
    }

    core.setOutput('version', version);
  } catch (err) {
    const msg = errorMessage(err);
    core.setFailed(`google-github-actions/setup-gcloud failed with: ${msg}`);
  }
}

if (require.main === module) {
  run();
}
