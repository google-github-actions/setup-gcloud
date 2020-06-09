# Cloud Run - GitHub Actions

An example workflow that uses [GitHub Actions][actions] to deploy a
[Hello World Node.js app](index.js) to [Cloud Run][cloud-run].

This code is intended to be an _example_. You will likely need to change or
update values to match your setup.

## Workflow description

For pushes to the `master` branch, this workflow will:

1.  Download and configure the Google [Cloud SDK][sdk] with the provided
    credentials.

1.  Build, tag, and push a container image to Google Container Registry.

    - The image is built using Cloud Build and pushed to Google Container Registry.

    - The image is available through the following tags: `latest` and first 8 of
      the commit SHA.

1.  Deploy the image to [Cloud Run][cloud-run].

## Setup

1.  Create a new Google Cloud Project (or select an existing project) and
    [enable the Cloud Run and Cloud Build APIs](https://console.cloud.google.com/flows/enableapi?apiid=cloudbuild.googleapis.com,run.googleapis.com).

1.  Create or reuse a GitHub repository for the example workflow:

    1.  [Create a repository](https://help.github.com/en/github/creating-cloning-and-archiving-repositories/creating-a-new-repository).

    1.  Move into the repository directory:

        ```
        $ cd <repo>
        ```

    1.  Copy the example into the repository:

        ```
        $ cp -r <path_to>/github-actions/example-workflows/cloud-run/ .
        ```

1.  [Create a Google Cloud service account][create-sa] if one does not already
    exist.

1.  Add the the following [Cloud IAM roles][roles] to your service account:

    - `Cloud Run Admin` - allows for the creation of new services

    - `Cloud Build Editor` - allows for deploying cloud builds

    - `Cloud Build Service Account` - allows for deploying cloud builds

    - `Viewer` - allows for viewing the project

    - `Service Account User` -  required to deploy services to Cloud Run

    Note: These permissions are overly broad to favor a quick start. They do not
    represent best practices around the Principle of Least Privilege. To
    properly restrict access, you should create a custom IAM role with the most
    restrictive permissions.


1.  [Create a JSON service account key][create-key] for the service account.

1.  Add the following secrets to your repository's secrets:

    - `RUN_PROJECT`: Google Cloud project ID

    - `RUN_SA_KEY`: the content of the service account JSON file

## Run the workflow

1.  Add and commit your changes:

    ```text
    $ git add .
    $ git commit -m "Set up GitHub workflow"
    ```

1.  Push to the `master` branch:

    ```text
    $ git push -u origin master
    ```

1.  View the GitHub Actions Workflow by selecting the `Actions` tab at the top
    of your repository on GitHub. Then click on the `Build and Deploy to Cloud
    Run` element to see the details.

[actions]: https://help.github.com/en/categories/automating-your-workflow-with-github-actions
[cloud-run]: https://cloud.google.com/run/
[create-sa]: https://cloud.google.com/iam/docs/creating-managing-service-accounts
[create-key]: https://cloud.google.com/iam/docs/creating-managing-service-account-keys
[sdk]: https://cloud.google.com/sdk
[secrets]: https://help.github.com/en/actions/automating-your-workflow-with-github-actions/creating-and-using-encrypted-secrets
[roles]: https://cloud.google.com/iam/docs/granting-roles-to-service-accounts#granting_access_to_a_service_account_for_a_resource
