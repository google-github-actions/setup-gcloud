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

**This is not an officially supported Google product, and it is not covered by a
Google Cloud support contract. To report bugs or request features in a Google
Cloud product, please contact [Google Cloud
support](https://cloud.google.com/support).**

## Prerequisites

-   This action requires Google Cloud credentials to execute gcloud commands.
    See [Authorization](#Authorization) for more details.

-   This action runs using Node 20. If you are using self-hosted GitHub Actions
    runners, you must use a [runner
    version](https://github.com/actions/virtual-environments) that supports this
    version or newer.

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
      uses: 'google-github-actions/auth@v2'
      with:
        workload_identity_provider: 'projects/123456789/locations/global/workloadIdentityPools/my-pool/providers/my-provider'
        service_account: 'my-service-account@my-project.iam.gserviceaccount.com'

    - name: 'Set up Cloud SDK'
      uses: 'google-github-actions/setup-gcloud@v2'
      with:
        version: '>= 363.0.0'

    - name: 'Use gcloud CLI'
      run: 'gcloud info'
```

## Inputs

<!-- BEGIN_AUTOGEN_INPUTS -->

-   <a name="version"></a><a href="#user-content-version"><code>version</code></a>: _(Optional, default: `latest`)_ A string representing the version or version constraint of the Cloud SDK
    (`gcloud`) to install (e.g. `"290.0.1"` or `">= 197.0.1"`). The default
    value is `"latest"`, which will always download and install the latest
    available Cloud SDK version.

        - uses: 'google-github-actions/setup-gcloud@v2'
          with:
            version: '>= 416.0.0'

    If there is no installed `gcloud` version that matches the given
    constraint, this GitHub Action will download and install the latest
    available version that still matches the constraint.

    Authenticating via Workload Identity Federation requires version
    [363.0.0](https://cloud.google.com/sdk/docs/release-notes#36300_2021-11-02)
    or newer. If you need support for Workload Identity Federation, specify
    your version constraint as such:

        - uses: 'google-github-actions/setup-gcloud@v2'
          with:
            version: '>= 363.0.0'

    You are responsible for ensuring the `gcloud` version matches the features
    and components required.

-   <a name="project_id"></a><a href="#user-content-project_id"><code>project_id</code></a>: _(Optional)_ ID of the Google Cloud project. If provided, this will configure gcloud to
    use this project ID by default for commands. Individual commands can still
    override the project using the `--project` flag which takes precedence. If
    unspecified, the action attempts to find the "best" project ID by looking
    at other inputs and environment variables.

-   <a name="install_components"></a><a href="#user-content-install_components"><code>install_components</code></a>: _(Optional)_ List of additional [gcloud
    components](https://cloud.google.com/sdk/docs/components) to install,
    specified as a comma-separated list of strings:

        install_components: 'alpha,cloud-datastore-emulator'

-   <a name="skip_install"></a><a href="#user-content-skip_install"><code>skip_install</code></a>: _(Optional)_ Skip installation of gcloud and use the [system-supplied
    version](https://github.com/actions/runner-images) instead. If specified,
    the `version` input is ignored.

    ⚠️ You will not be able to install additional gcloud components, because the
    system installation is locked.


<!-- END_AUTOGEN_INPUTS -->

## Outputs

<!-- BEGIN_AUTOGEN_OUTPUTS -->

-   `version`: Version of gcloud that was installed.


<!-- END_AUTOGEN_OUTPUTS -->


## Authorization

The `setup-gcloud` action installs the Cloud SDK (`gcloud`). To configure its authentication
to Google Cloud, you must first use the [google-github-actions/auth][auth] action. The `auth`
action sets [Application Default Credentials][adc], then the `setup-gcloud` action references
these credentials to configure [gcloud credentials][gcloud-credentials] . You can
authenticate via the following options:

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
      uses: 'google-github-actions/auth@v2'
      with:
        workload_identity_provider: 'projects/123456789/locations/global/workloadIdentityPools/my-pool/providers/my-provider'
        service_account: 'my-service-account@my-project.iam.gserviceaccount.com'

    - name: 'Set up Cloud SDK'
      uses: 'google-github-actions/setup-gcloud@v2'

    - name: 'Use gcloud CLI'
      run: 'gcloud info'
```

### Service Account Key JSON

```yaml
jobs:
  job_id:
    steps:
    - id: 'auth'
      uses: 'google-github-actions/auth@v2'
      with:
        credentials_json: '${{ secrets.GCP_CREDENTIALS }}'

    - name: 'Set up Cloud SDK'
      uses: 'google-github-actions/setup-gcloud@v2'

    - name: 'Use gcloud CLI'
      run: 'gcloud info'
```

### Self-hosted runners on Google Cloud Platform

If you are using self-hosted runners that are hosted on Google Cloud Platform, credentials
are automatically obtained from the service account attached to the runner.
In this scenario, you do not need to run the [google-github-actions/auth][auth] action.

```yaml
jobs:
  job_id:
    steps:
    - name: 'Set up Cloud SDK'
      uses: 'google-github-actions/setup-gcloud@v2'

    - name: 'Use gcloud CLI'
      run: 'gcloud info'
```

### Multiple Service Accounts

To use multiple service accounts, a second auth step is required to update the credentials before using `setup-gcloud`:

```yaml
jobs:
  job_id:
    # Add "id-token" with the intended permissions.
    permissions:
      contents: 'read'
      id-token: 'write'

    steps:
      - id: 'auth service account 1'
        uses: 'google-github-actions/auth@v2'
        with:
          workload_identity_provider: 'projects/123456789/locations/global/workloadIdentityPools/my-pool/providers/my-provider'
          service_account: 'service-account-1@my-project.iam.gserviceaccount.com'

      - name: 'Set up Cloud SDK'
        uses: 'google-github-actions/setup-gcloud@v2'

      - name: 'Use gcloud CLI'
        run: 'gcloud auth list --filter=status:ACTIVE --format="value(account)"'
        # service-account-1@my-project.iam.gserviceaccount.com

      - id: 'auth service account 2'
        uses: 'google-github-actions/auth@v2'
        with:
          credentials_json: '${{ secrets.GCP_CREDENTIALS }}'

      - name: 'Set up Cloud SDK'
        uses: 'google-github-actions/setup-gcloud@v2'

      - name: 'Use gcloud CLI'
        run: 'gcloud auth list --filter=status:ACTIVE --format="value(account)"'
        # service-account-2@my-project.iam.gserviceaccount.com
```


## Versioning

We recommend pinning to the latest available major version:

```yaml
- uses: 'google-github-actions/setup-gcloud@v2'
```

While this action attempts to follow semantic versioning, but we're ultimately
human and sometimes make mistakes. To prevent accidental breaking changes, you
can also pin to a specific version:

```yaml
- uses: 'google-github-actions/setup-gcloud@v2.0.0'
```

However, you will not get automatic security updates or new features without
explicitly updating your version number. Note that we only publish `MAJOR` and
`MAJOR.MINOR.PATCH` versions. There is **not** a floating alias for
`MAJOR.MINOR`.


[github-action]:https://help.github.com/en/categories/automating-your-workflow-with-github-actions
[auth]: https://github.com/google-github-actions/auth
[adc]: https://cloud.google.com/docs/authentication/application-default-credentials
[sdk]: https://cloud.google.com/sdk/
[gcloud]: https://cloud.google.com/sdk/gcloud/
[gcloud-credentials]: https://cloud.google.com/docs/authentication/gcloud#gcloud-credentials
[gsutil]: https://cloud.google.com/storage/docs/gsutil
[sa-iam-docs]: https://cloud.google.com/iam/docs/service-accounts
[sa]: https://cloud.google.com/iam/docs/creating-managing-service-accounts
[wif]: https://cloud.google.com/iam/docs/workload-identity-federation
[github-runners]: https://github.com/actions/runner-images
[gcloud-release-notes]: https://cloud.google.com/sdk/docs/release-notes
