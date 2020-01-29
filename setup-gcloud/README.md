<!--
 Copyright 2019 Google LLC

 Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in
 compliance with the License. You may obtain a copy of the License at

        https://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software distributed under the License
 is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
 implied. See the License for the specific language governing permissions and limitations under the
 License.
-->

# setup-gcloud

This action configures the [Google Cloud SDK](https://cloud.google.com/sdk/) in the environment for use in actions.
The [Google Cloud SDK](https://cloud.google.com/sdk/) includes both the [gcloud](https://cloud.google.com/sdk/gcloud/)
and [gsutil](https://cloud.google.com/storage/docs/gsutil) binaries.

It does the following:

1. Downloads a version of the [Google Cloud SDK](https://cloud.google.com/sdk/) according to the specified `version` input,
as well as the environment OS and architecture.

2. Installs and caches the downloaded version into the actions environment.

3. (If `service_account_key` is specified), authenticates the gcloud CLI tool using the
inputs: `service_account_email` and `service_account_key`. Further information on setting
up GCP service accounts can be found here: https://cloud.google.com/iam/docs/service-accounts

## Prerequisites

* This action requires [Python](https://www.python.org/) 2.7.9 or later to be installed on the environment.

* A pre-configured GCP service account. [More info](https://cloud.google.com/iam/docs/creating-managing-service-accounts)

## Usage

```yaml
steps:
- uses: actions/checkout@v1
- uses: GoogleCloudPlatform/github-actions/setup-gcloud@master
  with:
      version: '278.0.0'
      service_account_email: ${{ secrets.GCP_SA_EMAIL }}
      service_account_key: ${{ secrets.GCP_SA_KEY }}
- run: gcloud info
```

## Inputs

* `version`: (Optional) The version of the gcloud to be installed.  Example: `275.0.0`, Default: `latest`

* `service_account_email`: (Optional) The service account email which will be used for authentication.

* `service_account_key`: (Optional) The service account key which will be used for authentication. This key should be [created](https://cloud.google.com/iam/docs/creating-managing-service-account-keys), encoded as a [Base64](https://en.wikipedia.org/wiki/Base64) string (eg. `cat my-key.json | base64` on macOS), and stored as a [secret](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/creating-and-using-encrypted-secrets). 
