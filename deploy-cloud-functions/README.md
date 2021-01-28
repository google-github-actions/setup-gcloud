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
# deploy-cloud-functions

## **📢 DEPRECATION NOTICE**

### **GoogleCloudPlatform/github-actions/deploy-cloud-functions has been deprecated. Please use google-github-actions/deploy-cloud-functions**

```diff
steps:
 - id: deploy
-  uses: GoogleCloudPlatform/github-actions/deploy-cloud-functions@master
+  uses: google-github-actions/deploy-cloud-functions@main
```

This action deploys your function source code to [Cloud Functions](cloud-functions) and makes the URL
available to later build steps via outputs.

## Prerequisites

This action requires:

- Google Cloud credentials that are authorized to deploy a
Cloud Function. See the Authorization section below for more information.

- [Enable the Cloud Functions API](http://console.cloud.google.com/apis/library/cloudfunctions.googleapis.com?_ga=2.267842766.1374248275.1591025444-475066991.1589991158)

## Usage

```yaml
steps:
- id: deploy
  uses: GoogleCloudPlatform/github-actions/deploy-cloud-functions@master
  with:
    name: my-function
    runtime: nodejs10
    credentials: ${{ secrets.gcp_credentials }}

# Example of using the output
- id: test
  run: curl "${{ steps.deploy.outputs.url }}"
```

## Inputs

- `name`: (Required) Name of the Cloud Function.

- `runtime`: (Required) Runtime to use for the function. Possible options documented [here][runtimes].

- `entry_point`: (Optional) Name of a function (as defined in source code) that will be executed. Defaults to the resource name suffix, if not specified.

- `region`: (Optional) Region in which the function should be deployed. Defaults to `us-central1`.

- `credentials`: (Optional) Service account key to use for authentication. This should be
  the JSON formatted private key which can be exported from the Cloud Console. The
  value can be raw or base64-encoded. Required if not using a the
  `setup-gcloud` action with exported credentials.

- `env_vars`: (Optional) List of key-value pairs to set as environment variables in the format:
  KEY1=VALUE1,KEY2=VALUE2. All existing environment variables will be
  removed first.

- `source_dir`: (Optional) Source directory for the function. Defaults to current directory.

- `project_id`: (Optional) ID of the Google Cloud project. If provided, this
  will override the project configured by gcloud.

- `description`: (Optional) Description for the Cloud Function.

- `vpc_connector`: (Optional) The VPC Access connector that the function can connect to..

- `service_account_email`: (Optional) The email address of the IAM service account associated with the function at runtime.

- `timeout`: (Optional) The function execution timeout in seconds. Defaults to 60.

- `max_instances`: (Optional) The maximum number of instances for the function.

- `event_trigger_type`: (Optional) Specifies which action should trigger the function. Defaults to creation of http trigger.

- `event_trigger_resource`: (Optional) Specifies which resource from eventTrigger is observed.

- `event_trigger_service`: (Optional) The hostname of the service that should be observed.

## Allow unauthenticated requests

A Cloud Functions product recommendation is that CI/CD systems not set or change
settings for allowing unauthenticated invocations. New deployments are
automatically private services, while deploying a revision of a public
(unauthenticated) service will preserve the IAM setting of public
(unauthenticated). For more information, see [Controlling access on an individual service](https://cloud.google.com/functions/docs/securing/managing-access-iam).

## Outputs

- `url`: The URL of your Cloud Function. Only available with HTTP Trigger.

## Authorization

There are a few ways to authenticate this action. A service account will be needed
with the following roles:

- Cloud Functions Admin (`cloudfunctions.admin`):
  - Can create, update, and delete functions.
  - Can set IAM policies and view source code.

This service account needs to a member of the `Compute Engine default service account`,
`(PROJECT_NUMBER-compute@developer.gserviceaccount.com)`, with role
`Service Account User`. To grant a user permissions for a service account, use
one of the methods found in [Configuring Ownership and access to a service account](https://cloud.google.com/iam/docs/granting-roles-to-service-accounts#granting_access_to_a_user_for_a_service_account).

### Used with `setup-gcloud`

You can provide credentials using the [setup-gcloud][setup-gcloud] action:

```yaml
- uses: google-github-actions/setup-gcloud@master
  with:
    service_account_key: ${{ secrets.GCP_SA_KEY }}
    export_default_credentials: true
- id: Deploy
  uses: GoogleCloudPlatform/github-actions/deploy-cloud-functions@master
  with:
    name: my-function
    runtime: nodejs10
```

### Via Credentials

You can provide [Google Cloud Service Account JSON][sa] directly to the action
by specifying the `credentials` input. First, create a [GitHub
Secret][gh-secret] that contains the JSON content, then import it into the
action:

```yaml
- id: Deploy
  uses: GoogleCloudPlatform/github-actions/deploy-cloud-functions@master
  with:
    credentials: ${{ secrets.GCP_SA_KEY }}
    name: my-function
    runtime: nodejs10
```

### Via Application Default Credentials

If you are hosting your own runners, **and** those runners are on Google Cloud,
you can leverage the Application Default Credentials of the instance. This will
authenticate requests as the service account attached to the instance. **This
only works using a custom runner hosted on GCP.**

```yaml
- id: Deploy
  uses: GoogleCloudPlatform/github-actions/deploy-cloud-functions@master
  with:
    name: my-function
    runtime: nodejs10
```

The action will automatically detect and use the Application Default
Credentials.

[cloud-functions]: https://cloud.google.com/functions
[runtimes]: https://cloud.google.com/sdk/gcloud/reference/functions/deploy#--runtime
[sm]: https://cloud.google.com/secret-manager
[sa]: https://cloud.google.com/iam/docs/creating-managing-service-accounts
[gh-runners]: https://help.github.com/en/actions/hosting-your-own-runners/about-self-hosted-runners
[gh-secret]: https://help.github.com/en/actions/configuring-and-managing-workflows/creating-and-storing-encrypted-secrets
[setup-gcloud]: ../setup-gcloud