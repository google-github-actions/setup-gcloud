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

# `setup-gcloud` GitHub Action

Configures the [Google Cloud SDK][sdk] in the GitHub Actions environment. The Google Cloud SDK includes both the [gcloud][gcloud] and
[gsutil][gsutil] binaries.

Or integrate natively with other Google Cloud GitHub Actions:

* [Deploy a Cloud Run service](https://github.com/google-github-actions/deploy-cloudrun)
* [Deploy an App Engine app](https://github.com/google-github-actions/deploy-appengine)
* [Deploy a Cloud Function](https://github.com/google-github-actions/deploy-cloud-functions)
* [Access Secret Manager secrets](https://github.com/google-github-actions/get-secretmanager-secrets)
* [Upload to Cloud Storage](https://github.com/google-github-actions/upload-cloud-storage)
* [Configure GKE credentials](https://github.com/google-github-actions/get-gke-credentials)

**This repository also contains deprecated GCP GitHub Actions from previous mono-repo format.**

## Table of Contents

* [Usage](#usage)
* [Inputs](#inputs)
* [Example Workflows](#example-workflows)

## Usage

```yaml
- name: Set up Cloud SDK
  uses: google-github-actions/setup-gcloud@master
  with:
    project_id: ${{ secrets.GCP_PROJECT_ID }}
    service_account_key: ${{ secrets.GCP_SA_KEY }}
    export_default_credentials: true

- name: Use gcloud CLI
  run: gcloud info
```

## Inputs

| Name          | Requirement | Default | Description |
| ------------- | ----------- | ------- | ----------- |
| `version`     | _optional_  | `latest`| The version of the `gcloud` to be installed. Example: `290.0.1`|
| `project_id`  | _optional_  | | ID of the Google Cloud Platform project. If provided, this will configure `gcloud` to use this project ID by default for commands. Individual commands can still override the project using the `--project` flag which takes precedence. |
| `service_account_key`   | _optional_  | | The service account key which will be used for authentication credentials. This key should be [created](https://cloud.google.com/iam/docs/creating-managing-service-account-keys) and stored as a [secret](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/creating-and-using-encrypted-secrets). It can be encoded as a [Base64](https://en.wikipedia.org/wiki/Base64) string or as JSON. |
| `service_account_email` | _optional_  | | Service account email address to use for authentication. This is required for legacy .p12 keys but can be omitted for JSON keys. This is usually of the format `<name>@<project-id>.iam.gserviceaccount.com`. |
| `export_default_credentials`| _optional_  |`false`| Exports the path to [Default Application Credentials][dac] as the environment variable `GOOGLE_APPLICATION_CREDENTIALS` to be available in later steps. Google Cloud services automatically use this environment variable to find credentials. |
| `credentials_file_path`     | _optional_  | `GITHUB_WORKSPACE` | Only valid when `export_default_credentials` is `true`. Sets the path at which the credentials should be written. |


## Example Workflows

* [Google Kubernetes Engine](./example-workflows/gke/README.md): An example workflow that uses GitHub Actions to deploy a static website to an existing [Google Kubernetes Engine](https://cloud.google.com/kubernetes-engine/) cluster.

* [Cloud Run](./example-workflows/cloud-run/README.md): An example workflow that uses GitHub Actions to build and deploy a container to [Cloud Run](https://cloud.google.com/run/).

* [Google Compute Engine](./example-workflows/gce/README.md): An example workflow that uses GitHub Actions to deploy a container to an existing [Google Compute Engine](https://cloud.google.com/compute-engine/) (GCE) instance.

* [App Engine](./example-workflows/gae/README.md): An example workflow that uses GitHub Actions to deploy source
code to [App Engine](https://cloud.google.com/appengine), a fully managed serverless platform.

* [Cloud Build](./example-workflows/cloud-build/README.md): An example workflow that uses GitHub Actions to build a container image with [Cloud Build](https://cloud.google.com/cloud-build).

## Contributing

See [CONTRIBUTING](CONTRIBUTING.md).

## License

See [LICENSE](LICENSE).


[github-action]:https://help.github.com/en/categories/automating-your-workflow-with-github-actions
[dac]: https://cloud.google.com/docs/authentication/production
[sdk]: https://cloud.google.com/sdk/
[gcloud]: https://cloud.google.com/sdk/gcloud/
[gsutil]: https://cloud.google.com/storage/docs/gsutil
[sa-iam-docs]: https://cloud.google.com/iam/docs/service-accounts
