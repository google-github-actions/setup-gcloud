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
// Get the supposed release URL (no checks are performed)
function formatReleaseURL(os: string, arch: string, version: string): string {
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

  return encodeURI( `https://dl.google.com/dl/cloudsdk/channels/rapid/downloads/${objectName}`);
}

// Get the release URL, first validating that the data exists 
export function getReleaseURL(os: string, arch: string, version: string):Promise<string> {
  try {
    const url = formatReleaseURL(os, arch, version);
    const client: httpm.HttpClient = new httpm.HttpClient('github-actions-setup-gcloud');
    return client.get(url)
      .then(res => res.message.statusCode === 200 
        ? Promise.resolve(url)
        : Promise.reject(`error code: ${res.message.statusCode}`))
  } catch (err) {
    return Promise.reject("error trying to get release url!");
  }
}