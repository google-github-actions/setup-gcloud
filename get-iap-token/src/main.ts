import * as core from '@actions/core';
import { GoogleToken } from 'gtoken';
import { getCredentials } from './credentials';

/**
 * Executes the main action. It includes the main business logic and is the
 * primary entry point. It is documented inline.
 */
async function run(): Promise<void> {
  try {
    // Retrieve input.
    const IAPOAuthClientID = core.getInput('iap_oauth_client_id');
    const credentials = getCredentials();
    const privateKey = credentials.private_key;
    const serviceAccount = credentials.client_email;

    // Create a new OIDC token.
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
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
