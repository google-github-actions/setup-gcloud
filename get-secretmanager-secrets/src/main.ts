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

import * as core from "@actions/core";
import { Client } from "./client";
import { Reference } from "./reference";

async function run() {
  try {
    // Fetch the list of secrets provided by the user.
    const secretsInput = core.getInput('secrets', { required: true });

    // Get credentials, if any.
    const credentials = core.getInput('credentials');

    // Create an API client.
    const client = new Client({
      credentials: credentials,
    });

    // Parse all the provided secrets into references.
    const secretsRefs = parseSecretsRefs(secretsInput);

    // Access and export each secret.
    for (let ref of secretsRefs) {
      const value = await client.accessSecret(ref.selfLink());
      core.setSecret(value);
      core.setOutput(ref.output, value);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

// parseSecretsRefs accepts the given input string "secretsInput" as a list of
// secrets from actions input. Secrets can be comma-delimited or newline
// delimited. Whitespace around secret entires is removed.
function parseSecretsRefs(secretsInput: string): Reference[] {
  const secrets = new Array<Reference>();
  for (let line of secretsInput.split("\n")) {
    for (let piece of line.split(",")) {
      secrets.push(new Reference(piece.trim()));
    }
  }
  return secrets;
}

run();
