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
import {
  GoogleAuth,
  JWT,
  Compute,
  UserRefreshClient,
} from 'google-auth-library';
import YAML from 'yaml';

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
 * Wraps interactions with the Google Cloud Cluster API.
 *
 * @param location Location of the GCP resource.
 * @param opts list of ClientOptions.
 * @returns Cluster client.
 */
export class ClusterClient {
  readonly defaultEndpoint = 'https://container.googleapis.com/v1';
  readonly userAgent = 'github-actions-get-gke-credentials/0.1.0';
  readonly auth: GoogleAuth;
  readonly parent: string;
  authClient: JWT | Compute | UserRefreshClient | undefined;

  constructor(location: string, opts?: ClientOptions) {
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
    this.auth = new GoogleAuth({
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

    this.parent = `projects/${projectId}/locations/${location}`;
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
   * Retrieves the auth client for authenticating requests.
   *
   * @returns JWT | Compute | UserRefreshClient.
   */
  async getToken(): Promise<string> {
    const authClient = await this.getAuthClient();
    const tokenResponse = await authClient.getAccessToken();
    if (!tokenResponse.token) {
      throw new Error('Unable to generate token.');
    }
    return tokenResponse.token;
  }

  /**
   * Generates full resource name.
   *
   * @param cluster cluster name.
   * @returns full resource name.
   */
  getResource(cluster: string): string {
    return `${this.parent}/clusters/${cluster}`;
  }

  /**
   * Retrieves a Cluster.
   *
   * @param fqn Cluster name
   * @returns a Cluster object.
   */
  async getCluster(clusterName: string): Promise<ClusterResponse> {
    const authClient = await this.getAuthClient();
    const headers = await authClient.getRequestHeaders();
    headers['User-Agent'] = this.userAgent;
    const url = `${this.defaultEndpoint}/${this.getResource(clusterName)}`;
    const resp = (await authClient.request({
      url: url,
      headers: headers,
    })) as ClusterResponse;
    return resp;
  }

  /**
   * Create kubeconfig for cluster.
   *
   * @param authProvider boolean to use short lived OIDC token or GCP auth plugin in kubectl.
   * @param useInternalIp boolean to use the internal IP address of the cluster endpoint.
   * @returns kubeconfig
   */
  async createKubeConfig(
    authProvider: string,
    useInternalIp: string,
    cluster: ClusterResponse,
  ): Promise<string> {
    const endpoint =
      String(useInternalIp).toLowerCase() === 'true'
        ? cluster.data.privateClusterConfig.privateEndpoint
        : cluster.data.endpoint;
    const auth =
      String(authProvider).toLowerCase() === 'true'
        ? { user: { 'auth-provider': { name: 'gcp' } } }
        : { user: { token: await this.getToken() } };
    const kubeConfig: KubeConfig = {
      'apiVersion': 'v1',
      'clusters': [
        {
          cluster: {
            'certificate-authority-data':
              cluster.data.masterAuth?.clusterCaCertificate,
            'server': `https://${endpoint}`,
          },
          name: cluster.data.name,
        },
      ],
      'contexts': [
        {
          context: {
            cluster: cluster.data.name,
            user: cluster.data.name,
          },
          name: cluster.data.name,
        },
      ],
      'kind': 'Config',
      'current-context': cluster.data.name,
      'users': [{ ...{ name: cluster.data.name }, ...auth }],
    };
    return YAML.stringify(kubeConfig);
  }
}

type cluster = {
  cluster: {
    'certificate-authority-data': string;
    'server': string;
  };
  name: string;
};

type context = {
  context: {
    cluster: string;
    user: string;
  };
  name: string;
};

export type KubeConfig = {
  'apiVersion': string;
  'clusters': cluster[];
  'contexts': context[];
  'current-context': string;
  'kind': string;
  'users': [
    {
      name: string;
      user: {
        'token'?: string;
        'auth-provider'?: { name: string };
      };
    },
  ];
};

export type ClusterResponse = {
  data: {
    name: string;
    endpoint: string;
    masterAuth: {
      clusterCaCertificate: string;
    };
    privateClusterConfig: {
      privateEndpoint: string;
    };
  };
};
