const core = require('@actions/core');
const jwt = require('jsonwebtoken');


/** Parse the given credentials into an object.
 *
 * If the credentials are not JSON, they are probably base64-encoded. Even
 * though we don't instruct users to provide base64-encoded credentials,
 * sometimes they still do.
 *
 * @param {object} credentials - the credentials object. Either JSON or
 *   base64-encoded JSON.
 * @return {object} The parsed credentials object.
 */
function parseCredentials(credentials) {
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
  const iat = Math.floor(Date.now() / 1000)
  const exp = iat + tokenDuration
  const payload = {
    'iss': serviceAccount,
    'aud': 'https://oauth2.googleapis.com/token',
    'iat': iat,
    'exp': exp,
    'target_audience': IAPOAuthClientID
  }
  const token = jwt.sign(payload, privateKey, {
    algorithm: 'RS256'
  });
  console.log(token);
  core.setOutput('token', time);
} catch (error) {
  core.setFailed(error.message);
}