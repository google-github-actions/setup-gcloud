# App Engine - GitHub Actions

n example workflow that uses the `setup-gcloud` action to deploy to [App Engine](https://cloud.google.com/appengine).

_**Checkout the [`deploy-appengine` action](https://github.com/google-github-actions/deploy-appengine) and [example workflows](https://github.com/google-github-actions/deploy-appengine/README.md#example-workflows)
for a specialized implementation.**_

This code is intended to be an _example_. You will likely need to change or
update values to match your setup.

## Workflow

For pushes to the `example` branch, this workflow will:

1.  Download and configure the Google [Cloud SDK][sdk] with the provided
    credentials.

1. Deploy the app to [App Engine](https://cloud.google.com/appengine).

## Setup

1.  Create a new Google Cloud Project (or select an existing project).

1. [Initialize your App Engine app with your project](https://cloud.google.com/appengine/docs/standard/nodejs/console#console).

1.  [Create a Google Cloud service account][create-sa] or select an existing one.

1.  Add the following [Cloud IAM roles][roles] to your service account:

    - `App Engine Admin` - allows for the creation of new App Engine apps

    - `Service Account User` -  required to deploy to App Engine as service account

    - `Storage Admin` - allows upload of source code

    - `Cloud Build Editor` - allows building of source code

1.  [Download a JSON service account key][create-key] for the service account.

1.  Add the following [secrets to your repository's secrets][gh-secret]:

    - `GCP_PROJECT`: Google Cloud project ID

    - `GCP_SA_KEY`: the downloaded service account key

[create-sa]: https://cloud.google.com/iam/docs/creating-managing-service-accounts
[secrets]: https://help.github.com/en/actions/automating-your-workflow-with-github-actions/creating-and-using-encrypted-secrets
[roles]: https://cloud.google.com/iam/docs/granting-roles-to-service-accounts#granting_access_to_a_service_account_for_a_resource
