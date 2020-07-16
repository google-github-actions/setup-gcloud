import * as core from '@actions/core';
import * as fs from 'fs';
import { GoogleToken } from 'gtoken';

/** Parse the given credentials into an object.
 *
 * If the credentials are not JSON, they are probably base64-encoded.
 *
 * @param {object} credentials - the credentials object. Either JSON or
 *   base64-encoded JSON.
 * @return {object} The parsed credentials object.
 */
function parseCredentials(credentials: string) {
  if (!credentials.trim().startsWith('{')) {
    credentials = Buffer.from(credentials, 'base64').toString('utf8');
  }
  return JSON.parse(credentials);
}

// Get the input defined in action metadata file
const IAPOAuthClientID = core.getInput('iap_oauth_client_id');
const credentials = parseCredentials(
  core.getInput('service_account_key') ||
    fs.readFileSync(String(process.env.GOOGLE_APPLICATION_CREDENTIALS), 'utf8'),
);
const privateKey = credentials.private_key;
const serviceAccount = credentials.client_email;
const gtoken = new GoogleToken({
  iss: serviceAccount,
  scope: [IAPOAuthClientID],
  key: privateKey,
});
gtoken
  .getToken()
  .then(function (tokens) {
    core.setOutput('token', tokens.id_token);
  })
  .catch(function (error) {
    core.setFailed(error.message);
  });
