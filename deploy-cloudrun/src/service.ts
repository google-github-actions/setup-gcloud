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

import { run_v1 } from 'googleapis';

export class Service {
  readonly request: run_v1.Schema$Service;
  readonly name: string;
  readonly allowUnauthenticated: boolean;

  constructor(
    image: string,
    serviceName: string,
    authenticated?: string,
    metadata?: Metadata,
  ) {
    this.name = serviceName;

    if (authenticated) {
      this.allowUnauthenticated = authenticated === 'true';
    } else {
      this.allowUnauthenticated = false;
    }

    let envVars;
    if (metadata && metadata.envVars) {
      envVars = this.parseEnvVars(metadata.envVars);
    }
    // Specify the container
    const container: run_v1.Schema$Container = { image };
    if (envVars) {
      container.env = envVars;
    }

    // Construct new service
    const request: run_v1.Schema$Service = {
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
    this.request = request;
  }

  protected parseEnvVars(envVarInput: string): EnvVar[] {
    const envVarList = envVarInput.split(',');
    const envVars = envVarList.map((envVar) => {
      if (!envVar.includes('=')) {
        throw new Error(
          `Env Vars must be in "KEY1=VALUE1,KEY2=VALUE2" format, received ${envVar}`,
        );
      }
      const keyValue = envVar.split('=');
      return { name: keyValue[0], value: keyValue[1] };
    });
    return envVars;
  }
}

type EnvVar = {
  name: string;
  value: string;
};

type Metadata = {
  envVars?: string;
};
