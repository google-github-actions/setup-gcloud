/*
 * Copyright 2021 Google LLC
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

'use strict';

import { promises as fs } from 'fs';

/**
 * writeSecureFile writes a file to disk in a given directory with a
 * random name.
 *
 * @param outputPath Path in which to create random file in.
 * @param data Data to write to file.
 * @returns Path to written file.
 */
export async function writeSecureFile(
  outputPath: string,
  data: string,
): Promise<string> {
  // Write the file as 0640 so the owner has RW, group as R, and the file is
  // otherwise unreadable. Also write with EXCL to prevent a symlink attack.
  await fs.writeFile(outputPath, data, { mode: 0o640, flag: 'wx' });
  return outputPath;
}

/**
 * removeExportedCredentials removes any exported credentials file. If the file
 * does not exist, it does nothing.
 *
 * @returns Path of the file that was removed.
 */
export async function removeExportedCredentials(): Promise<string> {
  // Look up the credentials path, if one exists. Note that we only check the
  // environment variable set by our action, since we don't want to
  // accidentially clean up if someone set GOOGLE_APPLICATION_CREDENTIALS or
  // another environment variable manually.
  const credentialsPath = process.env['GOOGLE_GHA_CREDS_PATH'];
  if (!credentialsPath) {
    return '';
  }

  // Delete the file.
  try {
    await fs.unlink(credentialsPath);
    return credentialsPath;
  } catch (err) {
    if (err instanceof Error)
      if (err && err.message && err.message.includes('ENOENT')) {
        return '';
      }

    throw new Error(`failed to remove exported credentials: ${err}`);
  }
}
