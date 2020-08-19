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
import { writeFile } from './util';
import { ClusterClient } from './gkeClient';

async function run(): Promise<void> {
  try {
    // Get inputs
    const name = core.getInput('cluster_name', { required: true });
    const location = core.getInput('location', { required: true });
    const credentials = core.getInput('credentials');
    const projectId = core.getInput('project_id');
    const authProvider = core.getInput('use_auth_provider');
    const useInternalIp = core.getInput('use_internal_ip');

    // Create Container Cluster client
    const client = new ClusterClient(location, { projectId, credentials });

    // Get Cluster object
    const cluster = await client.getCluster(name);

    // Create KubeConfig
    const kubeConfig = await client.createKubeConfig(
      authProvider,
      useInternalIp,
      cluster,
    );

    // Write kubeconfig to disk
    const kubeConfigPath = await writeFile(kubeConfig);

    // Export KUBECONFIG env var with path to kubeconfig
    core.exportVariable('KUBECONFIG', kubeConfigPath);
    core.info('Successfully created and exported "KUBECONFIG"');
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
