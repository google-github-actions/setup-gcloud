const core = require('@actions/core');
const github = require('@actions/github');
const jwt = require('jsonwebtoken');

try {
  // Get the input defined in action metadata file
  const IAPOAuthClientID = code.getInput('iap-oauth-client-id');
  const privateKey = core.getInput('private-key');
  const serviceAccount = code.getInput('service-account');
  const tokenDuration = Number(code.getInput('token-duration'));
  const iat = Math.floor(Date.now() / 1000)
  const exp = iat + tokenDuration

  const payload = {
    "iss": serviceAccount,
    "aud": "https://oauth2.googleapis.com/token",
    "iat": iat,
    "exp": exp,
    "target_audience": IAPOAuthClientID
  }
  jwt.sign(payload, privateKey, {
    algorithm: 'RS256'
  }, function (err, token) {
    console.log(token);
  });
  const time = (new Date()).toTimeString();
  core.setOutput("time", time);
  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2)
  console.log(`The event payload: ${payload}`);
} catch (error) {
  core.setFailed(error.message);
}̦