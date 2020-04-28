# App Engine - GitHub Actions

An example workflow that uses [GitHub Actions](https://help.github.com/en/categories/automating-your-workflow-with-github-actions) to deploy a [Hello World Node.js (TypeScript) app](src/index.ts) to [App Engine](https://cloud.google.com/appengine). It also shows how to make [App Engine](https://cloud.google.com/appengine) to compile your app.

## Workflow

For pushes to the _default_ branch, `master`, the workflow will:

1. Verify the Google Cloud Platform credentials are correct.

1. Deploy the app to [App Engine](https://cloud.google.com/appengine).

## Setup

1. Create or reuse a GitHub repository for the example workflow:

  1. [Create a repository](https://help.github.com/en/github/creating-cloning-and-archiving-repositories/creating-a-new-repository).

  1. Move into your repository directory.

  1. Copy the example into the repository:
  ```
  cp -r <path_to>/github-actions/example-workflows/gae/ ./
  ```

  1. [Add the the following role to your service account][roles]:

    * `App Engine- roles/appengine.appAdmin`: allows for the creation of new services
    * `Browser - roles/browser`: allows for viewing and inserting items to the project (needed for Storage access)
    * `Cloud Build Service Account - roles/cloudbuild.builds.builder`: allows for
      running and manipulating Cloud Build and Storage resources
    * `Cloud Build Editor - roles/cloudbuild.builds.editor`: allows for deploying cloud builds
    * `Service Account User - roles/iam.serviceAccountUser`: actAs requirement

  1. Fill in the [repository's secret][secrets]:
    * `PROJECT_ID` Your Project Id
    * `GOOGLE_APPLICATION_CREDENTIALS` Service Account Key

  1. Enable the [App Engine API and Cloud Build API.](https://console.cloud.google.com/flows/enableapi?apiid=appengine.googleapis.com,cloudbuild.googleapis.com&redirect=https://console.cloud.google.com&_ga=2.248833607.-1346582427.1578963531).

  1. Create [Google App Engine](https://cloud.google.com/appengine) project running `gcloud app create` in your console.

## Run the workflow

1. Add and commit your changes:
```
git add .
git commit -m "Set up GitHub workflow"
```

1. Push to the `master` branch:
```
git push origin master
```

1. View the workflow by selecting the `Actions` tab at the top of your repository.
Then click on the `Deploy to App Engine` workflow to see the details.

[secrets]: https://help.github.com/en/actions/automating-your-workflow-with-github-actions/creating-and-using-encrypted-secrets
[roles]: https://cloud.google.com/iam/docs/granting-roles-to-service-accounts#granting_access_to_a_service_account_for_a_resource
