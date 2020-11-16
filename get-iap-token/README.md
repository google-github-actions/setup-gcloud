# get-iap-token

This action gets an [OpenID Connect](https://developers.google.com/identity/protocols/OpenIDConnect) (OIDC) token and makes it available as an output variable. The token can then be used to [authenticate a service account](https://cloud.google.com/iap/docs/authentication-howto#authenticating_from_a_service_account) to an [Identity Aware Proxy](https://cloud.google.com/iap) secured resource.

## Prerequisites

* [Python](https://www.python.org/) 2.7.9 or later installed on the environment.
* A pre-configured GCP [service account](https://cloud.google.com/iam/docs/creating-managing-service-accounts).
* `actions/checkout@v2` if using [`setup-gcloud`](../setup-gcloud/README.md) with `export_default_credentials`.

## Inputs

### `iap_oauth_client_id`

**Required.** The client ID for the IAP OAuth client.

### `credentials`

**Optional.** The [service account key](https://cloud.google.com/iam/docs/creating-managing-service-account-keys) to use for authentication. This key should be either in JSON format or as a [Base64](https://en.wikipedia.org/wiki/Base64) string (eg. `cat my-key.json | base64` on macOS). It should be stored as a [GitHub secret](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/creating-and-using-encrypted-secrets). It can be ommited if using [`setup-gcloud`](../setup-gcloud/README.md) with `export_default_credentials`.

## Outputs

### `token`

A string with the OIDC token. The token can then be included as a [`Bearer authentication`](https://swagger.io/docs/specification/authentication/bearer-authentication/) header to authenticate the service account to an IAP-secured resource.

## Example usage

Providing credentials in JSON format:

```yaml
steps:
  - uses: actions/checkout@v2
  - id: iap-token
    name: get IAP token
    uses: ./get-iap-token
    with:
      credentials: ${{ secrets.SERVICE_ACCOUNT_KEY_JSON }}
      iap-oauth-client-id: ${{ secrets.IAP_OAUTH_CLIENT_ID }}
  - name: get output
    run: echo '${{ steps.iap-token.outputs.token }}'
```

Providing credentials as a [Base64](https://en.wikipedia.org/wiki/Base64) string (eg. `cat my-key.json | base64` on macOS):

```yaml
steps:
  - uses: actions/checkout@v2
  - id: iap-token
    name: get IAP token
    uses: ./get-iap-token
    with:
      credentials: ${{ secrets.SERVICE_ACCOUNT_KEY_B64 }}
      iap-oauth-client-id: ${{ secrets.IAP_OAUTH_CLIENT_ID }}
  - name: get output
    run: echo '${{ steps.iap-token.outputs.token }}'
```

Using the [`setup-gcloud`](../setup-gcloud/README.md) action with `export_default_credentials`:

```yaml
steps:
  - uses: actions/checkout@v2
  - uses: ./setup-gcloud
    with:
      service_account_key: ${{ secrets.SERVICE_ACCOUNT_KEY_B64 }}
      export_default_credentials: true
  - id: iap-token
    name: get IAP token
    uses: ./get-iap-token
    with:
      iap-oauth-client-id: ${{ secrets.IAP_OAUTH_CLIENT_ID }}
  - name: get output
    run: echo '${{ steps.iap-token.outputs.token }}'
```
