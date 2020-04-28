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

import { google } from 'googleapis';
import { run_v1 } from 'googleapis';
import * as core from '@actions/core';

/**
* Executes the main action. It includes the main business logic and is the
* primary entry point. It is documented inline.
*/
async function run(): Promise<void> {
  try {
    // Get inputs
    const image = core.getInput('image', { required: true });
    const serviceName = core.getInput('service_name', { required: true });
    const allowUnauthenticated = core.getInput('allow_unauthenticated');
    const envVarInput = core.getInput('env_vars');
    const credentials = core.getInput('credentials');
    const projectId = core.getInput('project_id');
    const region = core.getInput('service_region') || 'us-central1';

    interface EnvVar {
      name: string;
      value: string;
    }
    // Parse env var input string
    let envVars: EnvVar[] = [];
    if (envVarInput) {
      const envVarList = envVarInput.split(",");
      envVars = envVarList.map((envVar) => {
        if (!envVar.includes('=')) {
          throw new Error(`Env Vars must be in "KEY1=VALUE1,KEY2=VALUE2" format, received ${envVar}`);
        }
        const keyValue = envVar.split("=");
        return {name: keyValue[0], value: keyValue[1]};
      });
    }

    // Instatiate Auth Client
    // This method looks for the GCLOUD_PROJECT and GOOGLE_APPLICATION_CREDENTIALS
    // environment variables.
    let auth = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    // Set credentials, if any.
    if (credentials) {
      let creds = credentials;
      if (!credentials.trim().startsWith('{')) {
        creds = Buffer.from(creds, 'base64').toString('utf8');
      }
      auth.jsonContent = JSON.parse(creds);
    } 
    const authClient = await auth.getClient();

    // Instatiate Cloud Run Client
    const run = google.run('v1');

    // Get full project path
    const parent = `projects/${projectId}/locations/${region}`;

    // Get list of services
    const listRequest: run_v1.Params$Resource$Projects$Locations$Services$List = { parent, auth: authClient };
    let serviceNames: string[] = [];
    run.projects.locations.services.list(listRequest, (err: any, results: any) => {
      serviceNames = results.data.items.map((service: run_v1.Schema$Service) => service?.metadata?.name);
    });

    // Specify the container
    let container: run_v1.Schema$Container = {
      image,
    }
    if (envVars.length > 0) {
      container.env = envVars;
    }

    // Construct new service
    const serviceRequest: run_v1.Schema$Service = {
      apiVersion: 'serving.knative.dev/v1',
      kind: 'Service',
      metadata: {
        name: serviceName
      },
      spec: {
        template: {
          spec: {
            containers: [container],
          }
        }
      },
    };

    const createServiceRequest: run_v1.Params$Resource$Projects$Locations$Services$Create = { parent, auth: authClient, requestBody: serviceRequest }
    let service: run_v1.Schema$Service | undefined;
    if (serviceNames.includes(serviceName)) {
      // Replace service
      run.projects.locations.services.replaceService(createServiceRequest, (err: any, results: any) => {
        if (err) {
          throw new Error('Can not replace service: ' + err);
        } else {
          service = results;
        }
      });
    } else {
      // Create service
      run.projects.locations.services.create(createServiceRequest, (err: any, results: any) => {
        if (err) {
          throw new Error('Can not create service: ' + err);
        } else {
          service = results;
        }
      });
    }
    // Set URL as output
    core.setOutput('url', service?.status?.url);

    // Set IAM policy if needed
    if (allowUnauthenticated && allowUnauthenticated === 'true') {
      const bindings: run_v1.Schema$Binding[] = [{
        members: ['allUsers'],
        role: 'roles/run.invoker',
      }];

      let iamPolicy: run_v1.Schema$SetIamPolicyRequest = {
        policy: {
          bindings, 
        },
      };

      const resource = `projects/${projectId}/locations/${region}/services/${service}`;
      let setIamPolicyRequest: run_v1.Params$Resource$Projects$Locations$Services$Setiampolicy = { resource, auth: authClient, requestBody: iamPolicy };
      const policy = await run.projects.locations.services.setIamPolicy(setIamPolicyRequest);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
