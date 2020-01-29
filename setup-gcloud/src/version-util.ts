/*
 * Copyright 2019 Google LLC
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

/**
 * Contains version utility functions.
 */

import * as httpm from 'typed-rest-client/HttpClient';

/**
 * @returns The latest stable version of the gcloud SDK.
 */
export async function getLatestGcloudSDKVersion(): Promise<string> {
  const client: httpm.HttpClient = new httpm.HttpClient(
    'github-actions-setup-gcloud',
  );
  return client
    .get('https://dl.google.com/dl/cloudsdk/channels/rapid/components-2.json')
    .then(res => {
      if (res.message.statusCode != 200) {
        return Promise.reject(
          `Failed to retrieve gcloud SDK version, HTTP error code ${res.message.statusCode}`,
        );
      }

      return res.readBody().then(body => {
        const responseObject = JSON.parse(body);
        if (!responseObject.version) {
          return Promise.reject(
            `Failed to retrieve gcloud SDK version, invalid response body: ${body}`,
          );
        }
        return Promise.resolve(responseObject.version);
      });
    });
}
