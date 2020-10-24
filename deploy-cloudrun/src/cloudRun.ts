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
import { google, run_v1 } from 'googleapis';
import {
  GoogleAuth,
  JWT,
  Compute,
  UserRefreshClient,
} from 'google-auth-library';
import { Service } from './service';
import { MethodOptions } from 'googleapis-common';

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
 * Wraps interactions with the Google Cloud Run API.
 *
 * @param region Region of the GCP resource.
 * @param opts list of ClientOptions.
 * @returns CloudRun client.
 */
export class CloudRun {
  private methodOptions: MethodOptions;

  private userAgentDirectives = [
    {
      product: 'github-actions-deploy-cloudrun',
      version: '0.1.0',
    },
  ];

  private run = google.run('v1');
  readonly auth: GoogleAuth;
  private authClient: JWT | Compute | UserRefreshClient | undefined;
  readonly parent: string;
  readonly endpoint: string;

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
    // Instatiate Auth Client
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
      throw new Error('No project Id found. Set "project_id" input.');
    }

    // this.parent = `projects/${projectId}/locations/${region}`;
    this.parent = `namespaces/${projectId}`;
    this.endpoint = `https://${region}-run.googleapis.com`;
    this.methodOptions = { rootUrl: this.endpoint };
  }

  /**
   * Retrieves the auth client for authenticating requests.
   *
   * @returns JWT | Compute | UserRefreshClient.
   */
  async getAuthClient(): Promise<
    JWT | Compute | UserRefreshClient | undefined
  > {
    if (!this.authClient) {
      try {
        this.authClient = await this.auth.getClient();
      } catch (err) {
        core.error(`Unable to retrieve authenticated client: ${err}`);
      }
    }
    return this.authClient;
  }

  /**
   * Generates full resource name.
   *
   * @param serviceName name of Cloud Run service.
   * @returns full resource name.
   */
  getResource(serviceName: string): string {
    return `${this.parent}/services/${serviceName}`;
  }

  /**
   * Retrieves a Cloud Run services.
   *
   * @returns a Cloud Run service.
   */
  async getService(serviceName: string): Promise<run_v1.Schema$Service> {
    const authClient = await this.getAuthClient();
    const getRequest: run_v1.Params$Resource$Namespaces$Services$Get = {
      name: this.getResource(serviceName),
      auth: authClient,
    };
    const serviceResponse: GaxiosResponse<run_v1.Schema$Service> = await this.run.namespaces.services.get(
      getRequest,
      this.methodOptions,
    );
    return serviceResponse.data;
  }

  /**
   * Retrieves a list of Cloud Run services.
   *
   * @returns list of Cloud Run services.
   */
  async listServices(): Promise<string[]> {
    const authClient = await this.getAuthClient();
    const listRequest: run_v1.Params$Resource$Namespaces$Services$List = {
      parent: this.parent,
      auth: authClient,
    };
    const serviceListResponse: GaxiosResponse<run_v1.Schema$ListServicesResponse> = await this.run.namespaces.services.list(
      listRequest,
      this.methodOptions,
    );
    const serviceList: run_v1.Schema$ListServicesResponse =
      serviceListResponse.data;
    let serviceNames: string[] = [];
    if (serviceList.items) {
      serviceNames = serviceList.items.map((service: run_v1.Schema$Service) => {
        if (service.metadata) {
          return service.metadata.name as string;
        }
        return '';
      });
    }
    return serviceNames;
  }

  /**
   * Deploy a Cloud Run service.
   *
   * @param service Service object.
   * @returns Service object.
   */
  async deploy(service: Service): Promise<run_v1.Schema$Service> {
    const authClient = await this.getAuthClient();
    const serviceNames = await this.listServices();
    let serviceResponse: GaxiosResponse<run_v1.Schema$Service>;
    const methodOptions = this.methodOptions;
    methodOptions.userAgentDirectives = this.userAgentDirectives;
    if (serviceNames.includes(service.name)) {
      const prevService = await this.getService(service.name);
      service.merge(prevService);
      core.info('Creating a service revision...');
      // Replace service
      const createServiceRequest: run_v1.Params$Resource$Namespaces$Services$Replaceservice = {
        name: this.getResource(service.name),
        auth: authClient,
        requestBody: service.request,
      };
      serviceResponse = await this.run.namespaces.services.replaceService(
        createServiceRequest,
        this.methodOptions,
      );
    } else {
      core.info('Creating a new service...');
      // Create service
      const createServiceRequest: run_v1.Params$Resource$Namespaces$Services$Create = {
        parent: this.parent,
        auth: authClient,
        requestBody: service.request,
      };
      serviceResponse = await this.run.namespaces.services.create(
        createServiceRequest,
        this.methodOptions,
      );
    }
    core.info(`Service ${service.name} has been successfully deployed.`);
    return serviceResponse.data;
  }

  /**
   * Deletes a Cloud Run service.
   *
   * @param service Service object.
   */
  async delete(service: Service): Promise<void> {
    const authClient = await this.getAuthClient();
    try {
      const deleteServiceRequest: run_v1.Params$Resource$Namespaces$Services$Delete = {
        name: this.getResource(service.name),
        auth: authClient,
      };
      await this.run.namespaces.services.delete(
        deleteServiceRequest,
        this.methodOptions,
      );
      core.info(`Service ${service.name} has been successfully deleted.`);
    } catch (e) {
      core.info(`Error deleting Service ${service.name}: ` + e);
    }
  }

  /**
   * Set's IAM policy for service (Not Recommended).
   *
   * @param service Service object.
   */
  async allowUnauthenticatedRequests(service: Service): Promise<void> {
    const authClient = await this.getAuthClient();
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
    const setIamPolicyRequest: run_v1.Params$Resource$Projects$Locations$Services$Setiampolicy = {
      resource: this.getResource(service.name),
      auth: authClient,
      requestBody: iamPolicy,
    };
    await this.run.projects.locations.services.setIamPolicy(
      setIamPolicyRequest,
      this.methodOptions,
    );
  }
}
