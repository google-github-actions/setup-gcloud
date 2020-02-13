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

import { GoogleAuth } from 'google-auth-library';

type ClientOptions = {
  credentials?: string,
  endpoint?: string,
}

export class Client {
  readonly defaultEndpoint: string = 'https://secretmanager.googleapis.com/v1beta1';
  readonly defaultScope: string = 'https://www.googleapis.com/auth/cloud-platform';
  readonly userAgent = 'github-action-google-secretmanager/0.1.0';

  readonly auth: GoogleAuth;
  readonly endpoint: string;

  constructor(opts?: ClientOptions) {
    this.endpoint = opts?.endpoint || this.defaultEndpoint;

    if (opts?.credentials) {
      // If the credentials are not JSON, they are probably base64-encoded. Even
      // though we don't instruct users to provide base64-encoded credentials,
      // sometimes they still do.
      if (!opts.credentials.trim().startsWith('{')) {
        const creds = opts.credentials;
        opts.credentials = Buffer.from(creds, 'base64').toString('utf8');
      }

      const creds = JSON.parse(opts.credentials);
      this.auth = new GoogleAuth({
        scopes: [this.defaultScope],
        credentials: creds,
      });
    } else {
      this.auth = new GoogleAuth({
        scopes: [this.defaultScope],
        projectId: 'unused-but-required',
      });
    }
  }

  async accessSecret(ref: string): Promise<string> {
    const client = await this.auth.getClient();

    const headers = await client.getRequestHeaders();
    headers['User-Agent'] = this.userAgent;

    const url = `${this.endpoint}/${ref}:access`;
    const resp = await client.request({
      url: url,
      headers: headers,
    }) as PayloadResponse;
    const b64data = resp.data.payload.data;
    const data = Buffer.from(b64data, 'base64');
    return data.toString();
  }
}

type PayloadResponse = {
  data: {
    name: string,
    payload: {
      data: string,
    },
  }
}
