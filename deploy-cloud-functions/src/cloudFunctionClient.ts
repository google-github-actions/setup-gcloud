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
import { GaxiosResponse } from 'gaxios';
import { CloudFunction } from './cloudFunction';
import { uploadSource, zipDir, deleteZipFile } from './util';
import { google, cloudfunctions_v1 } from 'googleapis';
import {
  GoogleAuth,
  JWT,
  Compute,
  UserRefreshClient,
} from 'google-auth-library';

/**
 * Available options to create the client.
 *
 * @param credentials GCP JSON credentials (default uses ADC).
 * @param endpoint GCP endpoint (useful for testing).
 */
type ClientOptions = {
  credentials?: string;
  projectId?: string;
};

/**
 * Wraps interactions with the Google Cloud Functions API.
 *
 * @param region Region of the GCP resource.
 * @param opts list of ClientOptions.
 * @returns CloudFunction client.
 */
export class CloudFunctionClient {
  readonly methodOptions = {
    userAgentDirectives: [
      {
        product: 'github-actions-deploy-cloud-functions',
        version: '0.1.0',
      },
    ],
  };
  private gcf = google.cloudfunctions('v1');
  readonly auth: GoogleAuth;
  readonly parent: string;
  authClient: JWT | Compute | UserRefreshClient | undefined;

  constructor(region: string, opts?: ClientOptions) {
    let projectId = opts?.projectId;
    if (
      !opts?.credentials &&
      (!process.env.GCLOUD_PROJECT ||
        !process.env.GOOGLE_APPLICATION_CREDENTIALS)
    ) {
      throw new Error(
        'No method for authentication. Set credentials in this action or export credentials from the setup-gcloud action',
      );
    }
    // Instantiate Auth Client
    // This method looks for the GCLOUD_PROJECT and GOOGLE_APPLICATION_CREDENTIALS
    // environment variables.
    this.auth = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    // Set credentials, if any.
    let jsonContent;
    if (opts?.credentials) {
      let creds = opts?.credentials;
      if (!opts?.credentials.trim().startsWith('{')) {
        creds = Buffer.from(creds, 'base64').toString('utf8');
      }
      jsonContent = JSON.parse(creds);
      this.auth.jsonContent = jsonContent;
    }
    // Set project Id
    if (!projectId && jsonContent && jsonContent.project_id) {
      projectId = jsonContent.project_id;
      core.info('Setting project Id from credentials');
    } else if (!projectId && process.env.GCLOUD_PROJECT) {
      projectId = process.env.GCLOUD_PROJECT;
      core.info('Setting project Id from $GCLOUD_PROJECT');
    } else if (!projectId) {
      throw new Error('No project Id found. Set project Id in this action.');
    }

    this.parent = `projects/${projectId}/locations/${region}`;
  }
  /**
   * Retrieves the auth client for authenticating requests.
   *
   * @returns JWT | Compute | UserRefreshClient.
   */
  async getAuthClient(): Promise<JWT | Compute | UserRefreshClient> {
    if (!this.authClient) {
      this.authClient = await this.auth.getClient();
    }
    return this.authClient;
  }

  /**
   * Generates full resource name.
   *
   * @param cloudFunction cloudFunction name.
   * @returns full resource name.
   */
  getResource(cloudFunction: string): string {
    return `${this.parent}/functions/${cloudFunction}`;
  }

  /**
   * Retrieves a Cloud Function.
   *
   * @param functionPath Cloud Function name
   * @returns a Cloud Function object.
   */
  async getFunction(
    functionPath: string,
  ): Promise<cloudfunctions_v1.Schema$CloudFunction> {
    const authClient = await this.getAuthClient();
    const getRequest: cloudfunctions_v1.Params$Resource$Projects$Locations$Functions$Get = {
      name: functionPath,
      auth: authClient,
    };
    const currentFunctionResponse: GaxiosResponse<cloudfunctions_v1.Schema$CloudFunction> = await this.gcf.projects.locations.functions.get(
      getRequest,
      this.methodOptions,
    );
    return currentFunctionResponse.data;
  }

  /**
   * Retrieves a list of currently deployed Cloud Functions.
   *
   * @returns list of Cloud Functions.
   */
  async listFunctions(): Promise<string[]> {
    const authClient = await this.getAuthClient();
    const getRequest: cloudfunctions_v1.Params$Resource$Projects$Locations$Functions$List = {
      parent: this.parent,
      auth: authClient,
    };
    const currentFunctionsResponse: GaxiosResponse<cloudfunctions_v1.Schema$ListFunctionsResponse> = await this.gcf.projects.locations.functions.list(
      getRequest,
      this.methodOptions,
    );
    const currentFunctions: cloudfunctions_v1.Schema$ListFunctionsResponse =
      currentFunctionsResponse.data;
    let currentFunctionsNames: string[] = [];
    if (currentFunctions.functions?.length !== undefined) {
      currentFunctionsNames = currentFunctions.functions?.map(
        (currentFunction) => currentFunction.name as string,
      );
    }
    return currentFunctionsNames;
  }

  /**
   * Returns a signed URL to upload source code.
   *
   * @returns signed url.
   */
  async getUploadUrl(): Promise<
    cloudfunctions_v1.Schema$GenerateUploadUrlResponse
  > {
    const authClient = await this.getAuthClient();
    const getRequest: cloudfunctions_v1.Params$Resource$Projects$Locations$Functions$Generateuploadurl = {
      parent: this.parent,
      auth: authClient,
    };
    const uploadUrlResponse: GaxiosResponse<cloudfunctions_v1.Schema$GenerateUploadUrlResponse> = await this.gcf.projects.locations.functions.generateUploadUrl(
      getRequest,
      this.methodOptions,
    );
    return uploadUrlResponse.data;
  }

  /**
   * Deploy a CloudFunction.
   *
   * @param cf Cloud Function.
   * @returns CloudFunction deployment response.
   */
  async deploy(cf: CloudFunction): Promise<cloudfunctions_v1.Schema$Operation> {
    const authClient = await this.getAuthClient();
    const deployedFunctions = await this.listFunctions();
    const zipPath = await zipDir(cf.sourceDir);
    const uploadUrl = await this.getUploadUrl();
    if (!uploadUrl.uploadUrl) {
      throw new Error('Unable to generate signed Url');
    }
    // Upload source code
    await uploadSource(uploadUrl.uploadUrl, zipPath);
    // Delete temp zip file after upload
    await deleteZipFile(zipPath);
    cf.setSourceUrl(uploadUrl.uploadUrl);
    // If CF already exists, create a revision else create new deployment
    if (deployedFunctions.includes(cf.functionPath)) {
      core.info('Creating a function revision');
      // fieldMasks are used if we are overwriting only specific fields of the resource
      // In the case we assume we will always need to replace sourceUploadUrl due to code change and along with it updates any inputs if changed
      const updateMasks = [
        'sourceUploadUrl',
        'name',
        'environmentVariables',
        'entryPoint',
        'runtime',
        'vpcConnector',
        'serviceAccountEmail',
        'timeout',
        'maxInstances',
        'eventTrigger.eventType',
        'eventTrigger.resource',
        'eventTrigger.service',
      ];
      const updateFunctionRequest: cloudfunctions_v1.Params$Resource$Projects$Locations$Functions$Patch = {
        updateMask: updateMasks.join(','),
        name: cf.functionPath,
        auth: authClient,
        requestBody: cf.request,
      };
      const updateFunctionResponse = await this.gcf.projects.locations.functions.patch(
        updateFunctionRequest,
        this.methodOptions,
      );
      const awaitUpdate = await this.pollOperation(
        updateFunctionResponse.data,
        'Updating function deployment',
      );
      core.info('Function deployment updated');
      return awaitUpdate;
    } else {
      core.info('Creating a new function deployment');
      const createFunctionRequest: cloudfunctions_v1.Params$Resource$Projects$Locations$Functions$Create = {
        location: this.parent,
        auth: authClient,
        requestBody: cf.request,
      };
      const createFunctionResponse = await this.gcf.projects.locations.functions.create(
        createFunctionRequest,
        this.methodOptions,
      );
      const awaitCreate = await this.pollOperation(
        createFunctionResponse.data,
        'Creating function deployment',
      );
      core.info('Function deployment created');
      return awaitCreate;
    }
  }
  /**
   * Delete a Cloud Function.
   *
   * @param functionPath Cloud Function name.
   * @returns CloudFunction delete response.
   */
  async delete(
    functionPath: string,
  ): Promise<cloudfunctions_v1.Schema$Operation> {
    const authClient = await this.getAuthClient();
    const deleteFunctionRequest: cloudfunctions_v1.Params$Resource$Projects$Locations$Functions$Delete = {
      name: functionPath,
      auth: authClient,
    };
    const deleteFunctionResponse = await this.gcf.projects.locations.functions.delete(
      deleteFunctionRequest,
      this.methodOptions,
    );
    const awaitDelete = await this.pollOperation(
      deleteFunctionResponse.data,
      'Deleting function deployment',
    );
    return awaitDelete;
  }

  /**
   * Polls an operation to completion.
   * Throws an error if failed to complete within maxRetries.
   *
   * @param op Operation id to poll.
   * @param displayMessage Message to display while polling.
   * @param interval Interval between polls.
   * @param maxRetries Max number of times to poll.
   * @returns Completed (success/failure) operation
   */
  async pollOperation(
    op: cloudfunctions_v1.Schema$Operation,
    displayMessage: string,
    interval = 2,
    maxRetries = 100,
  ): Promise<cloudfunctions_v1.Schema$Operation> {
    const pollInterval: number = interval * 1000;
    let currentTry = 0;
    let response: cloudfunctions_v1.Schema$Operation;
    while (currentTry < maxRetries) {
      core.info(displayMessage);
      response = await this.checkOperation(op);
      if (response.done || response.error) {
        return response;
      } else {
        currentTry += 1;
        await new Promise((resolve) => setTimeout(resolve, pollInterval));
      }
    }
    throw new Error('Function deployment timed out');
  }

  /**
   * Check status of an operation.
   *
   * @param op Operation id to query.
   * @returns operation
   */
  async checkOperation(
    op: cloudfunctions_v1.Schema$Operation,
  ): Promise<cloudfunctions_v1.Schema$Operation> {
    if (!op.name) {
      throw new Error('Invalid operation');
    }
    const authClient = await this.getAuthClient();
    const checkOperationRequest: cloudfunctions_v1.Params$Resource$Operations$Get = {
      name: op.name,
      auth: authClient,
    };
    const checkOperationResponse = await this.gcf.operations.get(
      checkOperationRequest,
      this.methodOptions,
    );
    return checkOperationResponse.data;
  }
}
