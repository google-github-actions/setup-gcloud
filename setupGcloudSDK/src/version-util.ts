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

/**
 * Contains version utility functions.
 */

import * as httpm from 'typed-rest-client/HttpClient';
import { retry } from '@lifeomic/attempt';
import { GCLOUD_METRICS_LABEL } from './install-util';

/**
 * @returns The latest stable version of the gcloud SDK.
 */
export async function getLatestGcloudSDKVersion(): Promise<string> {
  const queryUrl =
    'https://dl.google.com/dl/cloudsdk/channels/rapid/components-2.json';
  const client: httpm.HttpClient = new httpm.HttpClient(GCLOUD_METRICS_LABEL);
  return await retry(
    async () => {
      const res = await client.get(queryUrl);
      if (res.message.statusCode != 200) {
        throw new Error(
          `Failed to retrieve gcloud SDK version, HTTP error code: ${res.message.statusCode} url: ${queryUrl}`,
        );
      }

      const body = await res.readBody();
      const responseObject = JSON.parse(body);
      if (!responseObject.version) {
        throw new Error(
          `Failed to retrieve gcloud SDK version, invalid response body: ${body}`,
        );
      }
      return responseObject.version;
    },
    {
      delay: 200,
      factor: 2,
      maxAttempts: 4,
    },
  );
}
