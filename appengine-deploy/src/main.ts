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
import { execSync } from 'child_process';
/**
 * Executes the main action. It includes the main business logic and is the
 * primary entry point. It is documented inline.
 */
async function run(): Promise<void> {
  try {
    // Get action inputs.
    const projectId = core.getInput('project_id', { required: true });
    const deliverables = core.getInput('deliverables');
    const imageUrl = core.getInput('image-url');
    const version = core.getInput('version');
    const promote = core.getInput('promote');

    // Get credentials, if any.
    const credentials = core.getInput('credentials');

    // gcloud Flag set up.
    const addImageUrl = imageUrl ? `--image-url=${imageUrl}` : '';
    const addVersion = version ? `--version=${version}` : '';
    const addPromote = promote ? '--promote' : '--no-promote';

    // Run gcloud
    execSync(`gcloud app deploy ${deliverables} --project=${projectId} \
                ${addImageUrl} \
                ${addVersion} \
                ${addPromote}`);

    // Set output url.
    // Note: Any implications of just setting this??
    core.setOutput('url', `https://${projectId}.appspot.com/`);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
