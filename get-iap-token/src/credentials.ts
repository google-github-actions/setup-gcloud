import * as core from '@actions/core';
import * as fs from 'fs';

// Ignore camelcase linting, as field names are defimed by GCP.
interface ServiceAccountCredentials {
  type: string;
  // eslint-disable-next-line camelcase
  project_id: string;
  // eslint-disable-next-line camelcase
  project_key_id: string;
  // eslint-disable-next-line camelcase
  private_key: string;
  // eslint-disable-next-line camelcase
  client_email: string;
  // eslint-disable-next-line camelcase
  client_id: string;
  // eslint-disable-next-line camelcase
  auth_uri: string;
  // eslint-disable-next-line camelcase
  token_uri: string;
  // eslint-disable-next-line camelcase
  auth_provider_x509_cert_url: string;
  // eslint-disable-next-line camelcase
  client_x509_cert_url: string;
}

/** Get service account credentials.
 *
 * Tries to load from action input (as defined in `../action.yml`), and if unavailable
 * tries to load from the `GOOGLE_APPLICATION_CREDENTIALS` environment variable, which is
 * the default name used by the `../../setup-gcloud` action to store service account keys
 * when the `export_default_credentials` option is used.
 *
 * @return {ServiceAccountCredentials} The parsed credentials object.
 */
export function getCredentials(): ServiceAccountCredentials {
  return parseCredentials(
    core.getInput('credentials') ||
      fs.readFileSync(
        String(process.env.GOOGLE_APPLICATION_CREDENTIALS),
        'utf8',
      ),
  );
}

/** Parse the given credentials into an object.
 *
 * If the credentials are not JSON, they are probably Base64 encoded.
 *
 * @param {object} credentials - the credentials string. Either JSON string or a
 *   Base64 encoded JSON string.
 * @return {ServiceAccountCredentials} The parsed credentials object.
 */
export function parseCredentials(
  credentials: string,
): ServiceAccountCredentials {
  if (!credentials.trim().startsWith('{')) {
    credentials = Buffer.from(credentials, 'base64').toString('utf8');
  }
  return JSON.parse(credentials);
}
