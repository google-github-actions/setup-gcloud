const core = require('@actions/core');
const jwt = require('jsonwebtoken');

try {
  // Get the input defined in action metadata file
  const IAPOAuthClientID = core.getInput('iap-oauth-client-id');
  const privateKey = core.getInput('private-key');
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