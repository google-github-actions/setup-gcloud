<!--
Copyright 2019 Google LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->

# get-secretmanager-secrets

This action fetches secrets from [Secret Manager][sm] and makes them available
to later build steps via outputs. This is useful when you want Secret Manager to
be the source of truth for secrets in your organization, but you need access to
those secrets in build steps.

Secrets that are successfully fetched are set as output variables and can be
used in subsequent actions. After a secret is accessed, its value is added to
the mask of the build to reduce the chance of it being printed or logged by
later steps.


## Prerequisites

-   This action requires Google Cloud credentials that are authorized to access
    the secrets being requested. See the Authorization section below for more
    information.


## Usage

```yaml
steps:
- id: secrets
  uses: GoogleCloudPlatform/github-actions/get-secretmanager-secrets@master
  with:
    secrets: |-
      token:my-project/docker-registry-token

# Example of using the output
- id: publish
  uses: foo/bar@master
  env:
    TOKEN: ${{steps.secrets.outputs.token}}
```


## Inputs

-   `secrets`: (Required) The list of secrets to access and inject into the
    environment. Due to limitations with GitHub Actions inputs, this is
    specified as a string.

    You can specify multiple secrets by putting each secret on its own line:

    ```yaml
    secrets: |-
      output1:my-project/my-secret1
      output2:my-project/my-secret2
    ```

    Secrets can be referenced using the following formats:

    ```text
    # Long form
    projects/<project-id>/secrets/<secret-id>/versions/<version-id>

    # Long form - "latest" version
    projects/<project-id>/secrets/<secret-id>

    # Short form
    <project-id>/<secret-id>/<version-id>

    # Short form - "latest" version
    <project-id>/<secret-id>
    ```

-   `credentials`: (Optional) [Google Service Account JSON][sa] credentials,
    typically sourced from a [GitHub Secret][gh-secret]. If unspecified, other
    authentication methods are attempted.


## Outputs

Each secret is prefixed with an output name. The secret's resolved access value
will be available at that output in future build steps.

For example:

```yaml
steps:
- id: secrets
  uses: GoogleCloudPlatform/github-actions/get-secretmanager-secrets@master
  with:
    secrets: |-
      token:my-project/docker-registry-token
```

will be available in future steps as the output "token":

```yaml
- id: publish
  uses: foo/bar@master
  env:
    TOKEN: ${{steps.secrets.outputs.token}}
```


## Authorization

There are a few ways to authenticate this action. The caller must have
permissions to access the secrets being requested.

### Via the setup-gcloud action

You can provide credentials using the [setup-gcloud][setup-gcloud] action:

```yaml
- uses: GoogleCloudPlatform/github-actions/setup-gcloud@master
  with:
    export_default_credentials: true
- uses: GoogleCloudPlatform/github-actions/get-secretmanager-secrets@master
```

The advantage of this approach is that it authenticates all future actions. A
disadvantage of this approach is that downloading and installing gcloud may be
heavy for some use cases.

### Via credentials

You can provide [Google Cloud Service Account JSON][sa] directly to the action
by specifying the `credentials` input. First, create a [GitHub
Secret][gh-secret] that contains the JSON content, then import it into the
action:

```yaml
- id: secrets
  uses: GoogleCloudPlatform/github-actions/get-secretmanager-secrets@master
  with:
    credentials: ${{ secrets.gcp_credentials }}
    secrets: |-
      # ...
```

### Via Application Default Credentials

If you are hosting your own runners, **and** those runners are on Google Cloud,
you can leverage the Application Default Credentials of the instance. This will
authenticate requests as the service account attached to the instance. **This
only works using a custom runner hosted on GCP.**

```yaml
- id: secrets
  uses: GoogleCloudPlatform/github-actions/get-secretmanager-secrets@master
```

The action will automatically detect and use the Application Default
Credentials.


[sm]: https://cloud.google.com/secret-manager
[sa]: https://cloud.google.com/iam/docs/creating-managing-service-accounts
[gh-runners]: https://help.github.com/en/actions/hosting-your-own-runners/about-self-hosted-runners
[gh-secret]: https://help.github.com/en/actions/configuring-and-managing-workflows/creating-and-storing-encrypted-secrets
[setup-gcloud]: ../setup-gcloud
