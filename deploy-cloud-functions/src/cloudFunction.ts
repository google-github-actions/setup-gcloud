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

import { cloudfunctions_v1 } from 'googleapis';

export type EnvVar = {
  [key: string]: string;
};

/**
 * Available options to create the cloudFunction.
 *
 * @param name Name of the Cloud Function.
 * @param description Description for the Cloud Function.
 * @param sourceDir Path to function deployment directory within the source repo.
 * @param envVars List of key-value pairs to set as environment variables.
 * @param entryPoint Name of function to execute.
 * @param runtime Runtime to use for the function.
 * @param vpcConnector The VPC Access connector that the function can connect to.
 * @param parent Parent of the form projects/${projectId}/locations/${region}.
 * @param serviceAccountEmail The email address of the IAM service account associated with the function at runtime.
 * @param timeout The function execution timeout.
 * @param maxInstances Sets the maximum number of instances for the function.
 * @param eventTriggerType Specifies which action should trigger the function.
 * @param eventTriggerResource Specifies which resource from eventTrigger is observed.
 * @param eventTriggerService The hostname of the service that should be observed.
 */

export type CloudFunctionOptions = {
  name: string;
  description?: string;
  sourceDir?: string;
  envVars?: string;
  entryPoint?: string;
  runtime: string;
  vpcConnector?: string;
  parent: string;
  serviceAccountEmail?: string;
  timeout?: string;
  maxInstances?: number;
  eventTriggerType?: string;
  eventTriggerResource?: string;
  eventTriggerService?: string;
};

/**
 * Construct a Cloud Function.
 *
 * @param opts CloudFunctionOptions.
 * @returns CloudFunction.
 */
export class CloudFunction {
  readonly request: cloudfunctions_v1.Schema$CloudFunction;
  readonly name: string;
  readonly sourceDir: string;
  readonly functionPath: string;
  constructor(opts: CloudFunctionOptions) {
    this.functionPath = `${opts.parent}/functions/${opts.name}`;

    const request: cloudfunctions_v1.Schema$CloudFunction = {
      name: this.functionPath,
      description: opts.description,
      entryPoint: opts.entryPoint,
      runtime: opts.runtime,
    };

    // Check if event trigger else set to http trigger
    if (opts.eventTriggerType && opts.eventTriggerResource) {
      request.eventTrigger = {};
      request.eventTrigger.eventType = opts.eventTriggerType;
      request.eventTrigger.resource = opts.eventTriggerResource;
      request.eventTrigger.service = opts.eventTriggerService;
    } else if (
      opts.eventTriggerType ||
      opts.eventTriggerResource ||
      opts.eventTriggerService
    ) {
      throw new TypeError(
        'For event triggered function, eventTriggerType and eventTriggerResource are required.',
      );
    } else {
      request.httpsTrigger = {};
    }

    // Set optionals
    request.serviceAccountEmail = opts?.serviceAccountEmail
      ? opts.serviceAccountEmail
      : null;
    request.vpcConnector = opts?.vpcConnector ? opts.vpcConnector : null;
    request.timeout = opts?.timeout ? `${opts.timeout}s` : null;
    request.maxInstances = opts?.maxInstances ? opts.maxInstances : null;

    // Parse env vars
    let envVars;
    if (opts?.envVars) {
      envVars = this.parseEnvVars(opts.envVars);
      request.environmentVariables = envVars;
    }

    this.request = request;
    this.name = opts.name;
    this.sourceDir = opts.sourceDir ? opts.sourceDir : './';
  }

  /**
   * Set GCS Bucket URL.
   *
   * @param sourceUrl GCS URL where the source code was uploaded.
   */
  setSourceUrl(sourceUrl: string): void {
    this.request.sourceUploadUrl = sourceUrl;
  }

  /**
   * Parses a string of the format `KEY1=VALUE1`.
   *
   * @param envVarInput Env var string to parse.
   * @returns map of type {KEY1:VALUE1}
   */
  protected parseEnvVars(envVarInput: string): EnvVar {
    const envVarList = envVarInput.split(',');
    const envVars: EnvVar = {};
    envVarList.forEach((envVar) => {
      if (!envVar.includes('=')) {
        throw new TypeError(
          `Env Vars must be in "KEY1=VALUE1,KEY2=VALUE2" format, received ${envVar}`,
        );
      }
      const keyValue = envVar.split('=');
      envVars[keyValue[0]] = keyValue[1];
    });
    return envVars;
  }
}
