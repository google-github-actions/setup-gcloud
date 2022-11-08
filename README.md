# `setup-gcloud` GitHub Action

Configures the [Google Cloud SDK][sdk] in the GitHub Actions environment. The Google Cloud SDK includes both the [gcloud][gcloud] and
[gsutil][gsutil] binaries.

Or integrate natively with other Google Cloud GitHub Actions:

* [Authenticate to Google Cloud][auth]
* [Deploy a Cloud Run service](https://github.com/google-github-actions/deploy-cloudrun)
* [Deploy an App Engine app](https://github.com/google-github-actions/deploy-appengine)
* [Deploy a Cloud Function](https://github.com/google-github-actions/deploy-cloud-functions)
* [Access Secret Manager secrets](https://github.com/google-github-actions/get-secretmanager-secrets)
* [Upload to Cloud Storage](https://github.com/google-github-actions/upload-cloud-storage)
* [Configure GKE credentials](https://github.com/google-github-actions/get-gke-credentials)

## Prerequisites

-   This action requires Google Cloud credentials to execute gcloud commands.
    See [Authorization](#Authorization) for more details.

-   This action runs using Node 16. If you are using self-hosted GitHub Actions
    runners, you must use runner version [2.285.0](https://github.com/actions/virtual-environments)
    or newer.

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
      uses: 'google-github-actions/auth@v1'
      with:
        workload_identity_provider: 'projects/123456789/locations/global/workloadIdentityPools/my-pool/providers/my-provider'
        service_account: 'my-service-account@my-project.iam.gserviceaccount.com'

    - name: 'Set up Cloud SDK'
      uses: 'google-github-actions/setup-gcloud@v1'

    - name: 'Use gcloud CLI'
      run: 'gcloud info'
```

## Inputs

### Cloud SDK inputs

-   `version`: (Optional) A string representing the version of the Cloud SDK
    (`gcloud`) to install (e.g. `"290.0.1"`). The default value is "latest",
    which will install the latest available Cloud SDK version.

    **Warning!** Workload Identity Federation requires version
    [363.0.0](https://cloud.google.com/sdk/docs/release-notes#36300_2021-11-02)
    or newer.

-   `project_id`: (Optional) Project ID (**not** project _number_) of the Google
    Cloud project. If provided, this will configure the `gcloud` CLI to use that
    project ID for commands. Individual commands can still override the project
    with the `--project` flag. If unspecified, the action attempts to find the
    "best" project ID by looking at other inputs and environment variables.

-   `install_components`: (Optional) List of [Cloud SDK
    components](https://cloud.google.com/sdk/docs/components) to install
    specified as a comma-separated list of strings:

    ```yaml
    install_components: 'alpha,cloud-datastore-emulator'
    ```

## Example workflows

* [Google Kubernetes Engine](./example-workflows/gke/README.md): An example workflow that uses GitHub Actions to deploy a static website to an existing [Google Kubernetes Engine](https://cloud.google.com/kubernetes-engine/) cluster.

* [Cloud Run](./example-workflows/cloud-run/README.md): An example workflow that uses GitHub Actions to build and deploy a container to [Cloud Run](https://cloud.google.com/run/).

* [Google Compute Engine](./example-workflows/gce/README.md): An example workflow that uses GitHub Actions to deploy a container to an existing [Google Compute Engine](https://cloud.google.com/compute-engine/) (GCE) instance.

* [App Engine](./example-workflows/gae/README.md): An example workflow that uses GitHub Actions to deploy source
code to [App Engine](https://cloud.google.com/appengine), a fully managed serverless platform.

* [Cloud Build](./example-workflows/cloud-build/README.md): An example workflow that uses GitHub Actions to build a container image with [Cloud Build](https://cloud.google.com/cloud-build).


## Authorization

This action installs the Cloud SDK (`gcloud`). To configure its authentication
to Google Cloud, use the [google-github-actions/auth][auth] action. You can
authenticate via:

### Workload Identity Federation (preferred)

**⚠️ You must use the Cloud SDK version 390.0.0 or later to authenticate the
`bq` and `gsutil` tools.**

```yaml
jobs:
  job_id:
    # Add "id-token" with the intended permissions.
    permissions:
      contents: 'read'
      id-token: 'write'

    steps:
    - id: 'auth'
      uses: 'google-github-actions/auth@v1'
      with:
        workload_identity_provider: 'projects/123456789/locations/global/workloadIdentityPools/my-pool/providers/my-provider'
        service_account: 'my-service-account@my-project.iam.gserviceaccount.com'

    - name: 'Set up Cloud SDK'
      uses: 'google-github-actions/setup-gcloud@v1'

    - name: 'Use gcloud CLI'
      run: 'gcloud info'
```

### Service Account Key JSON

```yaml
job:
  job_id:
    steps:
    - id: 'auth'
      uses: 'google-github-actions/auth@v1'
      with:
        credentials_json: '${{ secrets.GCP_CREDENTIALS }}'

    - name: 'Set up Cloud SDK'
      uses: 'google-github-actions/setup-gcloud@v1'

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
      uses: 'google-github-actions/setup-gcloud@v1'

    - name: 'Use gcloud CLI'
      run: 'gcloud info'
```


## Versioning

We recommend pinning to the latest available major version:

```yaml
- uses: 'google-github-actions/setup-gcloud@v1'
```

While this action attempts to follow semantic versioning, but we're ultimately
human and sometimes make mistakes. To prevent accidental breaking changes, you
can also pin to a specific version:

```yaml
- uses: 'google-github-actions/setup-gcloud@v1.0.0'
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
[auth]: https://github.com/google-github-actions/auth
[adc]: https://cloud.google.com/docs/authentication/production
[sdk]: https://cloud.google.com/sdk/
[gcloud]: https://cloud.google.com/sdk/gcloud/
[gsutil]: https://cloud.google.com/storage/docs/gsutil
[sa-iam-docs]: https://cloud.google.com/iam/docs/service-accounts
[sa]: https://cloud.google.com/iam/docs/creating-managing-service-accounts
[wif]: https://cloud.google.com/iam/docs/workload-identity-federation
