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

This action configures the [Google Cloud SDK][sdk] in the environment for use in
actions. The Google Cloud SDK includes both the [gcloud][gcloud] and
[gsutil][gsutil] binaries.

It does the following:

1.  Downloads a version of the [Google Cloud SDK][sdk] according to the
    specified `version` input, as well as the environment OS and architecture.

1.  Installs and caches the downloaded version into the actions environment.

1.  If `project_id` is specified, gcloud will use this project ID as the default
    project ID for all future invocations. You can override this on a
    per-invocation basis using the `--project` flag.

1.  If `service_account_key` is specified, authenticates the gcloud CLI tool
    using the inputs: `service_account_email` and `service_account_key`. Please
    see the [Service Account documentation][sa-iam-docs] for more information.

1.  If `export_default_credentials` is specified, exports the path to the
    credentials in the environment variable `GOOGLE_APPLICATION_CREDENTIALS` to
    be available in later steps. Google Cloud technologies automatically use
    this environment variable to find credentials.

## Prerequisites

* This action requires [Python](https://www.python.org/) 2.7.9 or later to be installed on the environment.

* A pre-configured GCP service account. [More info](https://cloud.google.com/iam/docs/creating-managing-service-accounts)

## Usage

```yaml
steps:
- uses: actions/checkout@v2
- uses: GoogleCloudPlatform/github-actions/setup-gcloud@master
  with:
    version: '285.0.0'
    project_id: ${{ secrets.GCP_PROJECT_ID }}
    service_account_email: ${{ secrets.GCP_SA_EMAIL }}
    service_account_key: ${{ secrets.GCP_SA_KEY }}
    export_default_credentials: true
- run: gcloud info
```

## Inputs

* `version`: (Optional) The version of the gcloud to be installed.  Example: `285.0.0`, Default: `latest`

* `service_account_email`: (Optional) The service account email which will be used for authentication.

* `service_account_key`: (Optional) The service account key which will be used for authentication. This key should be [created](https://cloud.google.com/iam/docs/creating-managing-service-account-keys), encoded as a [Base64](https://en.wikipedia.org/wiki/Base64) string (eg. `cat my-key.json | base64` on macOS), and stored as a [secret](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/creating-and-using-encrypted-secrets).

* `export_default_credentials`: (Optional) Export the provided credentials as [Google Default Application Credentials][dac]. This will make the credentials available to later steps. Future steps that consume Default Application Credentials will automatically detect and use these credentials. Every time the action is run, this will generate a temporary file in the root of the repository with a random name, to hold the exported credentials.

* `project_id`: (Optional) ID of the Google Cloud project. If provided, this will configure gcloud to use this project ID by default for commands. Individual commands can still override the project using the --project flag which takes precedence.

[dac]: https://cloud.google.com/docs/authentication/production
[sdk]: https://cloud.google.com/sdk/
[gcloud]: https://cloud.google.com/sdk/gcloud/
[gsutil]: https://cloud.google.com/storage/docs/gsutil
[sa-iam-docs]: https://cloud.google.com/iam/docs/service-accounts
