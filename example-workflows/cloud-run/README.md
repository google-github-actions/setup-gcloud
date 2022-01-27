# Cloud Run Workflow

An example workflow that uses the `setup-gcloud` action to deploy to [Cloud Run][cloud-run].

_**Checkout the [`deploy-cloudrun` action](https://github.com/google-github-actions/deploy-cloudrun) and [example workflows](https://github.com/google-github-actions/deploy-cloudrun/README.md#example-workflows)
for a specialized implementation.**_

This code is intended to be an _example_. You will likely need to change or
update values to match your setup.

## Workflow description

For pushes to the `example` branch, this workflow will:

1.  Download and configure the Google [Cloud SDK][sdk] with the provided
    credentials.

1. Authenticates Docker to push to Google Container Registry

1.  Build, tag, and push a container image to Google Container Registry.

    - The image is built using Docker and pushed to Google Container Registry.

    - The image is available through the following tags: `latest` and first 8 of
      the commit SHA.

1.  Deploy the image to [Cloud Run][cloud-run].

## Setup

1.  Create a new Google Cloud Project (or select an existing project).

1. [Enable the Cloud Run API](https://console.cloud.google.com/flows/enableapi?apiid=run.googleapis.com).

1.  [Create a Google Cloud service account][create-sa] or select an existing one.

1.  Add the following [Cloud IAM roles][roles] to your service account:

    - `Cloud Run Admin` - allows for the creation of new Cloud Run services

    - `Service Account User` -  required to deploy to Cloud Run as service account

    - `Storage Admin` - allow push to Google Container Registry

1.  [Download a JSON service account key][create-key] for the service account.

1.  Add the following [secrets to your repository's secrets][gh-secret]:

    - `GCP_PROJECT`: Google Cloud project ID

    - `GCP_SA_KEY`: the downloaded service account key

[actions]: https://help.github.com/en/categories/automating-your-workflow-with-github-actions
[cloud-run]: https://cloud.google.com/run/
[create-sa]: https://cloud.google.com/iam/docs/creating-managing-service-accounts
[create-key]: https://cloud.google.com/iam/docs/creating-managing-service-account-keys
[sdk]: https://cloud.google.com/sdk
[secrets]: https://help.github.com/en/actions/automating-your-workflow-with-github-actions/creating-and-using-encrypted-secrets
[roles]: https://cloud.google.com/iam/docs/granting-roles-to-service-accounts#granting_access_to_a_service_account_for_a_resource
