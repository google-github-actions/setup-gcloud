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
import fs from 'fs';
import YAML from 'yaml';

export type EnvVar = {
  name: string;
  value: string;
};

/**
 * Available options to create the Service.
 *
 * @param image Name of the container image to deploy
 * @param name Name of the Cloud Run service
 * @param envVars String list of envvars
 * @param yaml Path to YAML file
 */
export type ServiceOptions = {
  image?: string;
  name?: string;
  envVars?: string;
  yaml?: string;
};

/**
 * Construct a Cloud Run Service
 *

 * @param opts ServiceOptions
 * @returns Service
 */
export class Service {
  readonly request: run_v1.Schema$Service;
  readonly name: string;

  constructor(opts: ServiceOptions) {
    if ((!opts.name || !opts.image) && !opts.yaml) {
      throw new Error('Provide image and services names or a YAML file.');
    }

    let request: run_v1.Schema$Service = {
      apiVersion: 'serving.knative.dev/v1',
      kind: 'Service',
      metadata: {},
      spec: {},
    };

    // Parse Env Vars
    let envVars;
    if (opts?.envVars) {
      envVars = this.parseEnvVars(opts.envVars);
    }

    // Parse YAML
    if (opts.yaml) {
      const file = fs.readFileSync(opts.yaml, 'utf8');
      const yaml = YAML.parse(file);
      request = yaml as run_v1.Schema$Service;
    }

    // If name is provided, set or override
    if (opts.name) {
      if (request.metadata) {
        request.metadata.name = opts.name;
      } else {
        request.metadata = { name: opts.name };
      }
    }

    // If image is provided, set or override
    if (opts.image) {
      const container: run_v1.Schema$Container = { image: opts.image };
      if (request.spec?.template) {
        request.spec.template!.spec!.containers = [container];
      } else {
        request.spec = {
          template: {
            spec: {
              containers: [container],
            },
          },
        };
      }
    }

    // If Env Vars are provided, set or override
    if (envVars) {
      if (request.spec?.template?.spec?.containers) {
        request.spec!.template!.spec!.containers[0]!.env = envVars;
      }
    }

    this.request = request;
    this.name = request.metadata!.name!;
  }

  /**
   * Parses a string of the format `KEY1=VALUE1`.
   *
   * @param envVarInput Env var string to parse
   * @returns EnvVar[]
   */
  protected parseEnvVars(envVarInput: string): EnvVar[] {
    const envVarList = envVarInput.split(',');
    const envVars = envVarList.map((envVar) => {
      if (!envVar.includes('=')) {
        throw new TypeError(
          `Env Vars must be in "KEY1=VALUE1,KEY2=VALUE2" format, received ${envVar}`,
        );
      }
      const keyValue = envVar.split('=');
      return { name: keyValue[0], value: keyValue[1] };
    });
    return envVars;
  }
}
