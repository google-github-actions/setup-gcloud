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

export class CloudRun {
    readonly methodOptions = {
        userAgentDirectives: [
            {
                product: 'github-actions-deploy-cloudrun',
                version: '0.1.0',
            },
        ],
    };

    private run = google.run('v1');
    private auth: GoogleAuth;
    private parent: string;

    constructor(projectId?: string, region?: string, credentials?: string) {
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
        this.auth = new google.auth.GoogleAuth({
            scopes: ['https://www.googleapis.com/auth/cloud-platform'],
        });
        // Set credentials, if any.
        if (credentials) {
            let creds = credentials;
            if (!credentials.trim().startsWith('{')) {
                creds = Buffer.from(creds, 'base64').toString('utf8');
            }
            const jsonContent = JSON.parse(creds);
            this.auth.jsonContent = jsonContent;

            if (!projectId) {
                projectId = jsonContent.project_Id;
                core.info('Setting project Id from credentials');
            }
        } else if (!projectId) {
            projectId = process.env.GCLOUD_PROJECT!;
            core.info('Setting project Id from $GCLOUD_PROJECT');
        }

        this.parent = `projects/${projectId}/locations/${region}`;
    }

    async getAuthClient(): Promise<JWT | Compute | UserRefreshClient> {
        return this.auth.getClient();
    }

    getResource(service: Service) {
        return `${this.parent}/services/${service.name}`;
    }

    // Get list of services
    async listServices(): Promise<string[]> {
        const authClient = await this.getAuthClient();
        const listRequest: run_v1.Params$Resource$Projects$Locations$Services$List = {
            parent: this.parent,
            auth: authClient,
        };
        const serviceListResponse: GaxiosResponse<run_v1.Schema$ListServicesResponse> = await this.run.projects.locations.services.list(
            listRequest,
            this.methodOptions,
        );
        const serviceList: run_v1.Schema$ListServicesResponse =
            serviceListResponse.data;
        const serviceNames = serviceList.items!.map(
            (service: run_v1.Schema$Service) => service.metadata!.name as string,
        );
        return serviceNames;
    }

    async deploy(service: Service): Promise<run_v1.Schema$Service> {
        const authClient = await this.getAuthClient();
        const serviceNames = await this.listServices();
        let serviceResponse: GaxiosResponse<run_v1.Schema$Service>;
        if (serviceNames!.includes(service.name)) {
            // Replace service
            const createServiceRequest: run_v1.Params$Resource$Projects$Locations$Services$Replaceservice = {
                name: this.getResource(service),
                auth: authClient,
                requestBody: service.request,
            };
            serviceResponse = await this.run.projects.locations.services.replaceService(
                createServiceRequest,
                this.methodOptions,
            );
        } else {
            // Create service
            const createServiceRequest: run_v1.Params$Resource$Projects$Locations$Services$Create = {
                parent: this.parent,
                auth: authClient,
                requestBody: service.request,
            };
            serviceResponse = await this.run.projects.locations.services.create(
                createServiceRequest,
                this.methodOptions,
            );
        }
        core.info(`Service ${service.name} has been successfully deployed.`);
        return serviceResponse.data;
    }

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
            resource: this.getResource(service),
            auth: authClient,
            requestBody: iamPolicy,
        };
        await this.run.projects.locations.services.setIamPolicy(
            setIamPolicyRequest,
            this.methodOptions,
        );
    }
}
