<!--
Copyright 2020 Google LLC

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
# deploy-cloudrun

This action deploys your container image to [Cloud Run][cloud-run] and makes the URL
available to later build steps via outputs.

## Prerequisites

This action requires Google Cloud credentials that are authorized to deploy a
Cloud Run service. See the Authorization section below for more information.

## Usage

```yaml
steps:
- id: deploy
  uses: GoogleCloudPlatform/github-actions/deploy-appengine@master
  with:
    image: gcr.io/cloudrun/hello
    service: hello-cloud-run
    credentials: ${{ secrets.gcp_credentials }}

# Example of using the output
- id: test
  run: curl "${{ steps.deploy.outputs.url }}"
```

## Inputs

- `image`: Name of the container image to deploy (e.g. gcr.io/cloudrun/hello:latest).
  Required if not using a service YAML.

- `service`: ID of the service or fully qualified identifier for the service.
  Required if not using a service YAML.

- `region`: Region in which the resource can be found.

- `credentials`: Service account key to use for authentication. This should be
  the JSON formatted private key which can be exported from the Cloud Console. The
  value can be raw or base64-encoded. Required if not using a the
  `setup-gcloud` action with exported credentials.

- `env_vars`: List of key-value pairs to set as environment variables in the format:
  KEY1=VALUE1,KEY2=VALUE2. All existing environment variables will be
  removed first.

- `metadata`: YAML serivce description for the Cloud Run service. See
  [Metadata customizations](#metadata-customizations) for more information.

- `project_id`: (Optional) ID of the Google Cloud project. If provided, this
  will override the project configured by gcloud.

### Metadata customizations

You can store your service specification in a YAML file. This will allow for
further service configuration, such as [memory limits](https://cloud.google.com/run/docs/configuring/memory-limits), [CPU allocation](https://cloud.google.com/run/docs/configuring/cpu), [max instances](), and [more.](https://cloud.google.com/sdk/gcloud/reference/run/deploy#OPTIONAL-FLAGS)

- See [Deploying a new service](https://cloud.google.com/run/docs/deploying#yaml)
to create a new YAML service definition, for example:

```YAML
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: SERVICE
spec:
  template:
    spec:
      containers:
      - image: IMAGE
```

- See [Deploy a new revision of an existing service](https://cloud.google.com/run/docs/deploying#yaml_1)
to generated a YAML service specification from an existing service:

```
gcloud run services describe SERVICE --format yaml > service.yaml
```
## Allow unauthenticated requests

A Cloud Run product recommendation is that CI/CD systems not set the
allow unauthenticated requests flag. Therefore new deployments are automatically
private services. Deploying a revision of a public (unauthenticated) service
will preserve the IAM setting of public (unauthenticated). For more information,
see [Controlling access on an individual service](https://cloud.google.com/run/docs/securing/managing-access).

## Outputs

- `url`: The URL of your Cloud Run service.

## Authorization

There are a few ways to authenticate this action. The caller must have
permissions to access the secrets being requested.

Roles needed:

- Cloud Run Admin (`roles/run.admin`):
  - Can create, update, and delete services.
  - Can get and set IAM policies.


### Used with `setup-gcloud`

You can provide credentials using the [setup-gcloud][setup-gcloud] action:

```yaml
- uses: GoogleCloudPlatform/github-actions/setup-gcloud@master
  with:
    version: '290.0.1'
    service_account_key: ${{ secrets.GCP_SA_KEY }}
    export_default_credentials: true
- id: Deploy
  uses: GoogleCloudPlatform/github-actions/deploy-cloudrun@master
  with:
    image: gcr.io/cloudrun/hello
    service: hello-cloud-run
```

### Via Credentials

You can provide [Google Cloud Service Account JSON][sa] directly to the action
by specifying the `credentials` input. First, create a [GitHub
Secret][gh-secret] that contains the JSON content, then import it into the
action:

```yaml
- id: Deploy
  uses: GoogleCloudPlatform/github-actions/deploy-cloudrun@master
  with:
    credentials: ${{ secrets.GCP_SA_KEY }}
    image: gcr.io/cloudrun/hello
    service: hello-cloud-run
```

### Via Application Default Credentials

If you are hosting your own runners, **and** those runners are on Google Cloud,
you can leverage the Application Default Credentials of the instance. This will
authenticate requests as the service account attached to the instance. **This
only works using a custom runner hosted on GCP.**

```yaml
- id: Deploy
  uses: GoogleCloudPlatform/github-actions/deploy-cloudrun@master
  with:
    image: gcr.io/cloudrun/hello
    service: hello-cloud-run
```

The action will automatically detect and use the Application Default
Credentials.

[cloud-run]: https://cloud.google.com/run
[sm]: https://cloud.google.com/secret-manager
[sa]: https://cloud.google.com/iam/docs/creating-managing-service-accounts
[gh-runners]: https://help.github.com/en/actions/hosting-your-own-runners/about-self-hosted-runners
[gh-secret]: https://help.github.com/en/actions/configuring-and-managing-workflows/creating-and-storing-encrypted-secrets
[setup-gcloud]: ../setup-gcloud
