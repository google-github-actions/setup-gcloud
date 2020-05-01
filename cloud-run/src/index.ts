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

import { google, run_v1 } from 'googleapis';
import * as core from '@actions/core';
import { GaxiosResponse } from 'gaxios';

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
    let projectId = core.getInput('project_id');
    const region = core.getInput('service_region') || 'us-central1';

    const methodOptions = {
      userAgentDirectives: [
        {
          product: 'github-actions-cloud-run-deploy',
          version: '0.1.0',
        },
      ],
    };

    interface EnvVar {
      name: string;
      value: string;
    }
    // Parse env var input string
    let envVars: EnvVar[] = [];
    if (envVarInput) {
      const envVarList = envVarInput.split(',');
      envVars = envVarList.map((envVar) => {
        if (!envVar.includes('=')) {
          throw new Error(
            `Env Vars must be in "KEY1=VALUE1,KEY2=VALUE2" format, received ${envVar}`,
          );
        }
        const keyValue = envVar.split('=');
        return { name: keyValue[0], value: keyValue[1] };
      });
    }

    if (
      !credentials &&
      (!process.env.GCLOUD_PROJECT ||
        !process.env.GOOGLE_APPLICATION_CREDENTIALS)
    ) {
      throw new Error(
        'No method for authentication. Set credentials in this action or export credentials from the setup-gcloud action',
      );
    }

    // Instatiate Auth Client
    // This method looks for the GCLOUD_PROJECT and GOOGLE_APPLICATION_CREDENTIALS
    // environment variables.
    const auth = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    // Set credentials, if any.
    if (credentials) {
      let creds = credentials;
      if (!credentials.trim().startsWith('{')) {
        creds = Buffer.from(creds, 'base64').toString('utf8');
      }
      const jsonContent = JSON.parse(creds);
      auth.jsonContent = jsonContent;
      if (!projectId) {
        projectId = jsonContent.project_Id;
        core.info('Setting project Id from credentials');
      }
    } else if (!projectId) {
      projectId = process.env.GCLOUD_PROJECT!;
      core.info('Setting project Id from $GCLOUD_PROJECT');
    }

    const authClient = await auth.getClient();

    // Instatiate Cloud Run Client
    const run = google.run('v1');

    // Get full project path
    const parent = `projects/${projectId}/locations/${region}`;

    // Get list of services
    const listRequest: run_v1.Params$Resource$Projects$Locations$Services$List = {
      parent,
      auth: authClient,
    };

    const serviceListResponse: GaxiosResponse<run_v1.Schema$ListServicesResponse> = await run.projects.locations.services.list(
      listRequest,
      methodOptions,
    );
    const serviceList: run_v1.Schema$ListServicesResponse =
      serviceListResponse.data;
    const serviceNames = serviceList.items!.map(
      (service: run_v1.Schema$Service) => service.metadata!.name,
    );

    // Specify the container
    const container: run_v1.Schema$Container = {
      image,
    };
    if (envVars.length > 0) {
      container.env = envVars;
    }

    // Construct new service
    const serviceRequest: run_v1.Schema$Service = {
      apiVersion: 'serving.knative.dev/v1',
      kind: 'Service',
      metadata: {
        name: serviceName,
      },
      spec: {
        template: {
          spec: {
            containers: [container],
          },
        },
      },
    };

    let service: GaxiosResponse<run_v1.Schema$Service>;
    if (serviceNames!.includes(serviceName)) {
      // Replace service
      const createServiceRequest: run_v1.Params$Resource$Projects$Locations$Services$Replaceservice = {
        name: `${parent}/services/${serviceName}`,
        auth: authClient,
        requestBody: serviceRequest,
      };
      service = await run.projects.locations.services.replaceService(
        createServiceRequest,
        methodOptions,
      );
    } else {
      // Create service
      const createServiceRequest: run_v1.Params$Resource$Projects$Locations$Services$Create = {
        parent,
        auth: authClient,
        requestBody: serviceRequest,
      };
      service = await run.projects.locations.services.create(
        createServiceRequest,
        methodOptions,
      );
    }
    core.info(`Service ${serviceName} has been successfully deployed.`);
    // Set URL as output
    core.setOutput('url', service.data.status!.url);

    // Set IAM policy if needed
    if (allowUnauthenticated && allowUnauthenticated === 'true') {
      const bindings: run_v1.Schema$Binding[] = [
        {
          members: ['allUsers'],
          role: 'roles/run.invoker',
        },
      ];

      const iamPolicy: run_v1.Schema$SetIamPolicyRequest = {
        policy: {
          bindings,
        },
      };

      const resource = `projects/${projectId}/locations/${region}/services/${serviceName}`;
      const setIamPolicyRequest: run_v1.Params$Resource$Projects$Locations$Services$Setiampolicy = {
        resource,
        auth: authClient,
        requestBody: iamPolicy,
      };
      await run.projects.locations.services.setIamPolicy(
        setIamPolicyRequest,
        methodOptions,
      );
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
