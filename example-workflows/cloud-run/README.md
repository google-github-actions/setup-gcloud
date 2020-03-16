# Cloud Run - GitHub Actions

An example workflow that uses [GitHub Actions](https://help.github.com/en/categories/automating-your-workflow-with-github-actions) to deploy a [Hello World Node.js app](index.js) to [Cloud Run (Fully Managed)](https://cloud.google.com/run/).

## Workflow

For pushes to the _default_ branch, `master`, the workflow will:

1. Verify the Google Cloud Platform credentials are correct.

1. Build, tag, and push the image to Google Container Registry.

    * The image is built using Cloud Build and pushed to Google Container Registry.

    * The image is available through the following tags: `latest` and first 8 of
    the commit SHA.

1. Deploy the image to [Cloud Run](https://cloud.google.com/run/).

## Setup

1. Create or reuse a Github repository for the example workflow:

  1. [Create a repository](https://help.github.com/en/github/creating-cloning-and-archiving-repositories/creating-a-new-repository).

  1. Move into your repository directory.

  1. Copy the example into the repository:
  ```
  cp -r <path_to>/github-actions/example-workflows/cloud-run/ ./
  ```

1. Add your Project Id to the [repository's secret][secrets], named `RUN_PROJECT`.

1. Update `cloud-run.yml` with the following values:

  * `RUN_REGION`: the region in which the resource will be deployed.

  * `SERVICE_NAME`: your preferred name of your service and image.

1. [Add the the following role to your service account][roles]:

  * `Cloud Run Admin - roles/run.admin`: allows for the creation of new services
  * `Viewer - roles/viewer`: allows for viewing the project (needed for Storage access)
  * `Cloud Build Service Account - roles/cloudbuild.builds.builder`: allows for
    running and manipulating Cloud Build and Storage resources
  * `Cloud Build Editor - roles/cloudbuild.builds.editor`: allows for deploying cloud builds
  * `Service Account User - roles/iam.serviceAccountUser`: actAs requirement

1. Enable the [Cloud Run API and Cloud Build API.](https://console.cloud.google.com/flows/enableapi?apiid=cloudbuild.googleapis.com,run.googleapis.com&redirect=https://console.cloud.google.com&_ga=2.248833607.-1346582427.1578963531).

## Run the workflow

1. Add and commit your changes:
```
git add .
git commit -m "Set up Github workflow"
```

1. Push to the `master` branch:
```
git push origin master
```

1. View the workflow by selecting the `Actions` tab at the top of your repository.
Then click on the `Build and Deploy to Cloud Run` workflow to see the details.

**Note**: If this is your first Cloud Run deployment, your image will not allow
unauthenticated requests. If this is a service revision, then your service will
persist the current setting. Learn more about [allowing public access](https://cloud.google.com/run/docs/authenticating/public).

[secrets]: https://help.github.com/en/actions/automating-your-workflow-with-github-actions/creating-and-using-encrypted-secrets
[cluster]: https://cloud.google.com/kubernetes-engine/docs/quickstart#create_cluster
[roles]: https://cloud.google.com/iam/docs/granting-roles-to-service-accounts#granting_access_to_a_service_account_for_a_resource
