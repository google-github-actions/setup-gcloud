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
import { get } from 'lodash';
import fs from 'fs';
import YAML from 'yaml';

/**
 * Available options to create the Service.
 *
 * @param image Name of the container image to deploy.
 * @param name Name of the Cloud Run service.
 * @param envVars String list of envvars.
 * @param yaml Path to YAML file.
 */
export type ServiceOptions = {
  image?: string;
  name?: string;
  envVars?: string;
  yaml?: string;
};

/**
 * Parses a string of the format `KEY1=VALUE1`.
 *
 * @param envVarInput Env var string to parse.
 * @returns EnvVar[].
 */
export function parseEnvVars(envVarInput: string): run_v1.Schema$EnvVar[] {
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

/**
 * Construct a Cloud Run Service.
 *
 * @param opts ServiceOptions.
 * @returns Service.
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
      envVars = parseEnvVars(opts.envVars);
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

    // If image is provided, set or override YAML
    if (opts.image) {
      const container: run_v1.Schema$Container = { image: opts.image };
      if (get(request, 'spec.template.spec')) {
        request.spec!.template!.spec!.containers = [container];
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

    if (!get(request, 'spec.template.spec.containers'))
      throw new Error(
        'No container defined. Set image as an input or in YAML config.',
      );

    // If Env Vars are provided, set or override YAML
    if (envVars) {
      if (get(request, 'spec.template.spec.containers[0]')) {
        request.spec!.template!.spec!.containers![0].env = envVars;
      }
    }

    this.request = request;
    this.name = request.metadata!.name!;
  }

  /**
   * Merges old revision with new service.
   *
   * @param prevService the previous Cloud Run service revision
   */
  public merge(prevService: run_v1.Schema$Service): void {
    // Merge Revision Metadata
    const labels = {
      ...prevService.spec?.template?.metadata?.labels,
      ...this.request.spec?.template?.metadata?.labels,
    };
    const annotations = {
      ...prevService.spec?.template?.metadata?.annotations,
      ...this.request.spec?.template?.metadata?.annotations,
    };
    this.request.spec!.template!.metadata = {
      annotations,
      labels,
    };

    // Merge Revision Spec
    const prevContainer = prevService.spec!.template!.spec!.containers![0];
    const currentContainer = this.request.spec!.template!.spec!.containers![0];
    // Merge Container spec
    const container = { ...prevContainer, ...currentContainer };
    // Merge Spec
    const spec = {
      ...prevService.spec?.template?.spec,
      ...this.request.spec!.template!.spec,
    };
    if (!currentContainer.command) {
      // Remove entrypoint cmd and arguments if not specified
      delete container.command;
      delete container.args;
    }
    // Merge Env vars
    let env: run_v1.Schema$EnvVar[] = [];
    if (currentContainer.env) {
      env = currentContainer.env.map(
        (envVar) => envVar as run_v1.Schema$EnvVar,
      );
    }
    const keys = env?.map((envVar) => envVar.name);
    prevContainer.env?.forEach((envVar) => {
      if (!keys.includes(envVar.name)) {
        return env.push(envVar);
      }
    });
    container.env = env;
    spec.containers = [container];
    this.request.spec!.template!.spec = spec;
  }
}
