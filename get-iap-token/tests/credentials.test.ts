import { expect } from 'chai';
import 'mocha';
import { parseCredentials } from '../src/credentials';

// Load test data from environment variables.
const credentialsJSON = String(process.env.SERVICE_ACCOUNT_KEY_JSON);
const credentialsJSONB64 = String(process.env.SERVICE_ACCOUNT_KEY_B64);
const expectedCredentials = {
  type: process.env.SERVICE_ACCOUNT_KEY_TYPE,
  project_id: process.env.SERVICE_ACCOUNT_KEY_PROJECT_ID,
  project_key_id: process.env.SERVICE_ACCOUNT_PROJECT_KEY_ID,
  private_key: String(process.env.SERVICE_ACCOUNT_PRIVATE_KEY).replace(
    /\\n/g,
    '\n',
  ),
  client_email: process.env.SERVICE_ACCOUNT_KEY_CLIENT_EMAIL,
  client_id: process.env.SERVICE_ACCOUNT_KEY_CLIENT_ID,
  auth_uri: process.env.SERVICE_ACCOUNT_KEY_AUTH_URI,
  token_uri: process.env.SERVICE_ACCOUNT_KEY_TOKEN_URI,
  auth_provider_x509_cert_url:
    process.env.SERVICE_ACCOUNT_KEY_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.SERVICE_ACCOUNT_KEY_CLIENT_X509_CERT_URL,
};

describe('Credentials', function () {
  it('Parse JSON credentials.', function () {
    const credentials = parseCredentials(credentialsJSON);
    expect(credentials).to.deep.equal(expectedCredentials);
  });
  it('Parse JSON Base64 encoded credentials.', function () {
    const credentials = parseCredentials(credentialsJSONB64);
    expect(credentials).to.deep.equal(expectedCredentials);
  });
});
