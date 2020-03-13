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
# appengine-deploy

This action deploys your source code to App Engine and makes the URL available to
later build steps via outputs. This allows you to parameterize your App Engine
deployments.

## Prerequisites

This action requires Google Cloud credentials that are authorized to deploy an
App Engine Application. See the Authorization section below for more information.

## Usage

```yaml
steps:
- id: deploy
  uses: GoogleCloudPlatform/github-actions/appengine-deploy@master
  with:
    project_id: ${{ secrets.PROJECT_ID }}

# Example of using the output
- id: test
  run: curl "${{ steps.deploy.outputs.url }}"
```

## Inputs

- `project_id`: (Required)

- `deliverables`: The yaml files for the services or configurations you want to
  deploy. If not given, defaults to app.yaml in the current directory. If that
  is not found, attempts to automatically generate necessary configuration
  files (such as app.yaml) in the current directory.

- `image-url`: Deploy with a specific container image. The image url must be
  from one of the valid GCR hostnames (example, `gcr.io/`).

- `version`: The version of the app that will be created or replaced by this
  deployment. If you do not specify a version, one will be generated for
  you.

- `promote`: Promote the deployed version to receive all traffic.

### app.yaml customizations

Other application configurations can be customized through the app.yaml, ie the
service name. See [app.yaml Configuration File](https://cloud.google.com/appengine/docs/standard/nodejs/config/appref) for more information.

## Outputs

- `url`: The URL of your App Engine Application.

## Authorization

There are a few ways to authenticate this action. The caller must have
permissions to access the secrets being requested.

Roles needed:

- Storage Admin (`roles/compute.storageAdmin`):to upload files
- Cloud Build Editor (`cloudbuild.builds.editor`): to build the application
- App Engine roles:
  - Deployer (`roles/appengine.deployer`): Can deploy but can not promote
  - Admin (`roles/appengine.appAdmin`): Can manage all App Engine resources (not recommended)

*Note:* An owner will be needed to create the App Engine application

### Used with setup-gcloud

You can provide credentials using the [setup-gcloud][setup-gcloud] action:

```yaml
- uses: GoogleCloudPlatform/github-actions/setup-gcloud@master
  with:
    export_default_credentials: true
- uses: GoogleCloudPlatform/github-actions/get-secretmanager-secrets@master
```

### Via Credentials

You can provide [Google Cloud Service Account JSON][sa] directly to the action
by specifying the `credentials` input. First, create a [GitHub
Secret][gh-secret] that contains the JSON content, then import it into the
action:

```yaml
- id: secrets
  uses: GoogleCloudPlatform/github-actions/appengine-deploy@master
  with:
    credentials: ${{ secrets.gcp_credentials }}
    project_id: ${{ secrets.PROJECT_ID }}
```

### Via Application Default Credentials

If you are hosting your own runners, **and** those runners are on Google Cloud,
you can leverage the Application Default Credentials of the instance. This will
authenticate requests as the service account attached to the instance. **This
only works using a custom runner hosted on GCP.**

```yaml
- id: secrets
  uses: GoogleCloudPlatform/github-actions/appengine-deploy@master
```

The action will automatically detect and use the Application Default
Credentials.


[sm]: https://cloud.google.com/secret-manager
[sa]: https://cloud.google.com/iam/docs/creating-managing-service-accounts
[gh-runners]: https://help.github.com/en/actions/hosting-your-own-runners/about-self-hosted-runners
[gh-secret]: https://help.github.com/en/actions/configuring-and-managing-workflows/creating-and-storing-encrypted-secrets
[setup-gcloud]: ../setup-gcloud
