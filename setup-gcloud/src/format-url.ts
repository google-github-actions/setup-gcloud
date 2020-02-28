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

import * as httpm from 'typed-rest-client/HttpClient';
import { retry } from '@lifeomic/attempt';
import { GCLOUD_METRICS_LABEL } from './install-util';

/**
 * Formats the gcloud SDK release URL according to the specified arguments.
 *
 * @param os The OS of the requested release.
 * @param arch The system architecture of the requested release.
 * @param version The version of the requested release.
 * @returns The formatted gcloud SDK release URL.
 */
function formatReleaseURL(os: string, arch: string, version: string): string {
  // massage the arch to match gcloud sdk conventions
  if (arch == 'x64') {
    arch = 'x86_64';
  }

  let objectName: string;
  switch (os) {
    case 'linux':
      objectName = `google-cloud-sdk-${version}-linux-${arch}.tar.gz`;
      break;
    case 'darwin':
      objectName = `google-cloud-sdk-${version}-darwin-${arch}.tar.gz`;
      break;
    case 'win32':
      objectName = `google-cloud-sdk-${version}-windows-${arch}.zip`;
      break;
    default:
      throw new Error(`Unexpected OS '${os}'`);
  }

  return encodeURI(
    `https://dl.google.com/dl/cloudsdk/channels/rapid/downloads/${objectName}`,
  );
}

/**
 * Creates the gcloud SDK release URL for the specified arguments, verifying
 * its existence.
 *
 * @param os The OS of the requested release.
 * @param arch The system architecture of the requested release.
 * @param version The version of the requested release.
 * @returns The verified gcloud SDK release URL.
 */
export async function getReleaseURL(
  os: string,
  arch: string,
  version: string,
): Promise<string> {
  try {
    const url = formatReleaseURL(os, arch, version);
    const client = new httpm.HttpClient(GCLOUD_METRICS_LABEL);
    return retry(
      async () => {
        const res = await client.head(url);
        if (res.message.statusCode === 200) {
          return url;
        } else {
          throw new Error(`error code: ${res.message.statusCode}`);
        }
      },
      {
        delay: 200,
        factor: 2,
        maxAttempts: 4,
      },
    );
  } catch (err) {
    throw new Error(
      `Error trying to get gcloud SDK release URL: os: ${os} arch: ${arch} version: ${version}, err: ${err}`,
    );
  }
}
