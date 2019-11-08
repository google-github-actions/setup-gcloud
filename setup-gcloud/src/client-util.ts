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
 * Contains REST client utility functions.
 */
import * as rest from 'typed-rest-client/RestClient';

interface IStorageObjects {
  kind: string;
  items: IStorageObject[];
}

interface IStorageObject {
  name: string;
  generation: string;
  mediaLink: string;
}

/**
 * Represents the data for a gcloud SDK release.
 */
export interface IGcloudSDKRelease {
  name: string;
  url: string;
  version: string;
}

/**
 * Queries for a gcloud SDK release.
 *
 * @param os The OS of the release.
 * @param arch The architecutre of the release
 * @param version The version of the release.
 * @returns The matching release data or else null if not found.
 */
export async function queryGcloudSDKRelease(
  os: string,
  arch: string,
  version: string,
): Promise<IGcloudSDKRelease | null> {
  // massage the arch to match gcloud sdk conventions
  if (arch == 'x64') {
    arch = 'x86_64';
  }

  const client = getClient();
  const storageObjects = (await client.get<IStorageObjects>(
    formatReleaseURL(os, arch, version),
  )).result;
  // If no response was returned this indicates an error.
  if (!storageObjects) {
    throw new Error('Unable to retreieve cloud sdk version list');
  }
  // If an empty response was returned, this indicates no matches found.
  if (!storageObjects.items) {
    return null;
  }

  // Get the latest generation that matches the version spec.
  const release: IStorageObject | null | undefined = storageObjects.items.sort(
    (a, b) => {
      if (a.generation > b.generation) {
        return 1;
      }
      return -1;
    },
  )[0];

  if (release) {
    return {
      name: release.name,
      url: release.mediaLink,
      version: version,
    };
  }
  return null;
}

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

  return encodeURI(
    `https://www.googleapis.com/storage/v1/b/cloud-sdk-release/o?prefix=${objectName}`,
  );
}

function getClient(): rest.RestClient {
  return new rest.RestClient('github-actions-setup-gcloud');
}
