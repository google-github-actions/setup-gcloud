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

* [Authenticate to Google Cloud](https://github.com/google-github-actions/auth)
* [Deploy a Cloud Run service](https://github.com/google-github-actions/deploy-cloudrun)
* [Deploy an App Engine app](https://github.com/google-github-actions/deploy-appengine)
* [Deploy a Cloud Function](https://github.com/google-github-actions/deploy-cloud-functions)
* [Access Secret Manager secrets](https://github.com/google-github-actions/get-secretmanager-secrets)
* [Upload to Cloud Storage](https://github.com/google-github-actions/upload-cloud-storage)
* [Configure GKE credentials](https://github.com/google-github-actions/get-gke-credentials)

## 📢 NOTICES

-   **Do not pin this action to `@master`, use `@v0` instead. We are going to
    rename the branch to `main` in 2022 and this _will break_ existing
    workflows. See [Versioning](#versioning) for more information.**

-   **Previously this repository contained the code for ALL of the GCP GithHub
    Actions. Now each action has it's own repo and this repo is only for
    `setup-gcloud`.**

    For `setup-gcloud`:

    ```diff
    steps:
    - id: gcloud
    -  uses: GoogleCloudPlatform/github-actions/setup-gcloud@master
    +  uses: google-github-actions/setup-gcloud@v0
    ```

    For other actions (example uses `deploy-cloudrun`):

    ```diff
    steps:
    - id: deploy
    -  uses: GoogleCloudPlatform/github-actions/deploy-cloudrun@master
    +  uses: google-github-actions/deploy-cloudrun@v0
    ```

## Usage

```yaml
jobs:
  job_id:
    # Add "id-token" with the intended permissions.
    permissions:
      contents: 'read'
      id-token: 'write'

    steps:
    - id: 'auth'
      uses: 'google-github-actions/auth@v0'
      with:
        workload_identity_provider: 'projects/123456789/locations/global/workloadIdentityPools/my-pool/providers/my-provider'
        service_account: 'my-service-account@my-project.iam.gserviceaccount.com'

    - name: 'Set up Cloud SDK'
      uses: 'google-github-actions/setup-gcloud@v0'

    - name: 'Use gcloud CLI'
      run: 'gcloud info'
```

## Inputs

| Name          | Requirement | Default | Description |
| ------------- | ----------- | ------- | ----------- |
| `version`     | _optional_  | `latest`| The version of the `gcloud` to be installed. Example: `290.0.1`|
| `project_id`  | _optional_  | | ID of the Google Cloud Platform project. If provided, this will configure `gcloud` to use this project ID by default for commands. Individual commands can still override the project using the `--project` flag which takes precedence. |
| `service_account_email` | _optional_  | | Service account email address to use for authentication. This is required for legacy .p12 keys but can be omitted for JSON keys. This is usually of the format `<name>@<project-id>.iam.gserviceaccount.com`. |
| `export_default_credentials`| _optional_  |`false`| Exports the path to [Default Application Credentials][dac] as the environment variable `GOOGLE_APPLICATION_CREDENTIALS` to be available in later steps. Google Cloud services automatically use this environment variable to find credentials. |
| `credentials_file_path`     | _optional_  | (temporary file) | Only valid when `export_default_credentials` is `true`. Sets the path at which the credentials should be written. |
| `cleanup_credentials` | _optional_ | `true` | If true, the action will remove any generated credentials from the filesystem upon completion. |
| `service_account_key`   | _optional_  | | (**Deprecated**) This input is deprecated. See [auth section](https://github.com/google-github-actions/setup-gcloud#authorization) for more details. The service account key which will be used for authentication credentials. This key should be [created](https://cloud.google.com/iam/docs/creating-managing-service-account-keys) and stored as a [secret](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/creating-and-using-encrypted-secrets). It can be encoded as a [Base64](https://en.wikipedia.org/wiki/Base64) string or as JSON. |


## Example Workflows

* [Google Kubernetes Engine](./example-workflows/gke/README.md): An example workflow that uses GitHub Actions to deploy a static website to an existing [Google Kubernetes Engine](https://cloud.google.com/kubernetes-engine/) cluster.

* [Cloud Run](./example-workflows/cloud-run/README.md): An example workflow that uses GitHub Actions to build and deploy a container to [Cloud Run](https://cloud.google.com/run/).

* [Google Compute Engine](./example-workflows/gce/README.md): An example workflow that uses GitHub Actions to deploy a container to an existing [Google Compute Engine](https://cloud.google.com/compute-engine/) (GCE) instance.

* [App Engine](./example-workflows/gae/README.md): An example workflow that uses GitHub Actions to deploy source
code to [App Engine](https://cloud.google.com/appengine), a fully managed serverless platform.

* [Cloud Build](./example-workflows/cloud-build/README.md): An example workflow that uses GitHub Actions to build a container image with [Cloud Build](https://cloud.google.com/cloud-build).


## Authorization

This action installs the Cloud SDK (`gcloud`). To configure its authentication to Google Cloud, use the [google-github-actions/auth](https://github.com/google-github-actions/auth) action. You can authenticate via:

### Workload Identity Federation (preferred)

```yaml
jobs:
  job_id:
    # Add "id-token" with the intended permissions.
    permissions:
      contents: 'read'
      id-token: 'write'

    steps:
    - id: 'auth'
      uses: 'google-github-actions/auth@v0'
      with:
        workload_identity_provider: 'projects/123456789/locations/global/workloadIdentityPools/my-pool/providers/my-provider'
        service_account: 'my-service-account@my-project.iam.gserviceaccount.com'

    - name: 'Set up Cloud SDK'
      uses: 'google-github-actions/setup-gcloud@v0'

    - name: 'Use gcloud CLI'
      run: 'gcloud info'
```

### Service Account Key JSON

```yaml
job:
  job_id:
    steps:
    - id: 'auth'
      uses: 'google-github-actions/auth@v0'
      with:
        credentials_json: '${{ secrets.GCP_CREDENTIALS }}'

    - name: 'Set up Cloud SDK'
      uses: 'google-github-actions/setup-gcloud@v0'

    - name: 'Use gcloud CLI'
      run: 'gcloud info'
```

### Application Default Credentials

If and only if you are using self-hosted runners that are hosted on Google Cloud Platform,
the Cloud SDK will automatically authenticate using the machine credentials:

```yaml
job:
  job_id:
    steps:
    - name: 'Set up Cloud SDK'
      uses: 'google-github-actions/setup-gcloud@v0'

    - name: 'Use gcloud CLI'
      run: 'gcloud info'
```


## Versioning

We recommend pinning to the latest available major version:

```yaml
- uses: 'google-github-actions/setup-gcloud@v0'
```

While this action attempts to follow semantic versioning, but we're ultimately
human and sometimes make mistakes. To prevent accidental breaking changes, you
can also pin to a specific version:

```yaml
- uses: 'google-github-actions/setup-gcloud@v0.1.1'
```

However, you will not get automatic security updates or new features without
explicitly updating your version number. Note that we only publish `MAJOR` and
`MAJOR.MINOR.PATCH` versions. There is **not** a floating alias for
`MAJOR.MINOR`.


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
[sa]: https://cloud.google.com/iam/docs/creating-managing-service-accounts
[wif]: https://cloud.google.com/iam/docs/workload-identity-federation
