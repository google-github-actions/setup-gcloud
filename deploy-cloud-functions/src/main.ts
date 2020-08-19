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
import { CloudFunctionClient } from './cloudFunctionClient';
import { CloudFunction } from './cloudFunction';

async function run(): Promise<void> {
  try {
    // Get inputs
    const name = core.getInput('name', { required: true });
    const runtime = core.getInput('runtime', { required: true });
    const credentials = core.getInput('credentials');
    const projectId = core.getInput('project_id');
    const region = core.getInput('region') || 'us-central1';
    const envVars = core.getInput('env_vars');
    const entryPoint = core.getInput('entry_point');
    const sourceDir = core.getInput('source_dir');
    const vpcConnector = core.getInput('vpc_connector');
    const serviceAccountEmail = core.getInput('service_account_email');
    const timeout = core.getInput('timeout');
    const maxInstances = core.getInput('max_instances');
    const eventTriggerType = core.getInput('event_trigger_type');
    const eventTriggerResource = core.getInput('event_trigger_resource');
    const eventTriggerService = core.getInput('event_trigger_service');

    // Create Cloud Functions client
    const client = new CloudFunctionClient(region, { projectId, credentials });

    // Create Function definition
    const newFunc = new CloudFunction({
      name: name,
      parent: client.parent,
      sourceDir: sourceDir,
      runtime: runtime,
      entryPoint: entryPoint,
      envVars: envVars,
      timeout: timeout,
      maxInstances: +maxInstances,
      eventTriggerType: eventTriggerType,
      eventTriggerResource: eventTriggerResource,
      eventTriggerService: eventTriggerService,
      vpcConnector: vpcConnector,
      serviceAccountEmail: serviceAccountEmail,
    });

    // Deploy function
    const deployFunctionResponse = await client.deploy(newFunc);

    // Set Cloud Function name and URL as output
    core.setOutput('name', newFunc.fqn);
    // Set url if httpTrigger
    core.setOutput('url', deployFunctionResponse.response?.httpsTrigger?.url);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();