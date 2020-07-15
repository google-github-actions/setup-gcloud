import axios from 'axios';
import * as core from '@actions/core';
import * as jwt from 'jsonwebtoken';

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

try {
  // Get the input defined in action metadata file
  const IAPOAuthClientID = core.getInput('iap-oauth-client-id');
  const privateKey = parseCredentials(core.getInput('credentials')).private_key;
  const serviceAccount = core.getInput('service-account');
  const tokenDuration = Number(core.getInput('token-duration'));
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + tokenDuration;
  const payload = {
    iss: serviceAccount,
    aud: 'https://oauth2.googleapis.com/token',
    iat: iat,
    exp: exp,
    target_audience: IAPOAuthClientID,
  };
  const token = jwt.sign(payload, privateKey, {
    algorithm: 'RS256',
  });
  axios
    .post('https://oauth2.googleapis.com/token', {
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: token,
    })
    .then(function (response) {
      core.setOutput('token', response.data.id_token);
    })
    .catch(function (error) {
      console.log(error);
    });
} catch (error) {
  core.setFailed(error.message);
}
