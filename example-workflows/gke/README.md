# Google Kubernetes Engine - GitHub Actions

An example workflow that uses [GitHub Actions][actions] to deploy [a static
website](site/) to an existing [Google Kubernetes Engine][gke] cluster.

This code is intended to be an _example_. You will likely need to change or
update values to match your setup.

## Workflow description

For pushes to the `master` branch, this workflow will:

1.  Download and configure the Google [Cloud SDK][sdk] with the provided
    credentials.

1.  Build, tag, and push a container image to Google Container Registry.

1.  Use a Kubernetes Deployment to push the image to the cluster.

    - Note that a GKE deployment requires a unique Tag to update the pods. Using
      a constant tag `latest` or a branch name `master` may result in successful
      workflows that don't update the cluster.

## Setup

1.  Create a new Google Cloud Project (or select an existing project) and
    [enable the Container Registry and Kubernetes Engine APIs](https://console.cloud.google.com/flows/enableapi?apiid=containerregistry.googleapis.com,container.googleapis.com).

1.  [Create a new GKE cluster][cluster] or select an existing GKE cluster.

1.  Create or reuse a GitHub repository for the example workflow:

    1.  [Create a repository](https://help.github.com/en/github/creating-cloning-and-archiving-repositories/creating-a-new-repository).

    1.  Move into the repository directory:

        ```
        $ cd <repo>
        ```

    1.  Copy the example into the repository:

        ```
        $ cp -r <path_to>/github-actions/example-workflows/gke/ .
        ```

1.  [Create a Google Cloud service account][create-sa] if one does not already
    exist.

1.  Add the the following [Cloud IAM roles][roles] to your service account:

    - `Kubernetes Engine Developer` - allows deploying to GKE

    - `Storage Admin` - allows publishing to Container Registry

    Note: These permissions are overly broad to favor a quick start. They do not
    represent best practices around the Principle of Least Privilege. To
    properly restrict access, you should create a custom IAM role with the most
    restrictive permissions.

1.  [Create a JSON service account key][create-key] for the service account.

1.  Add the following secrets to your repository's secrets:

    - `GKE_PROJECT`: Google Cloud project ID

    - `GKE_SA_KEY`: the content of the service account JSON file

1.  Update `.github/workflows/gke.yml` to match the values corresponding to your
    VM:

    - `GKE_CLUSTER` - the instance name of your cluster

    - `GCE_ZONE` - the zone your cluster resides

    - `IMAGE` - your preferred Docker image name

    You can find the names of your clusters using the command:

    ```
    $ gcloud container clusters list
    ```

    and the zone using the command:

    ```
    $ gcloud container clusters describe <CLUSTER_NAME>
    ```

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
    of your repository on GitHub. Then click on the `Build and Deploy to GKE`
    element to see the details.

[actions]: https://help.github.com/en/categories/automating-your-workflow-with-github-actions
[cluster]: https://cloud.google.com/kubernetes-engine/docs/quickstart#create_cluster
[gke]: https://cloud.google.com/gke
[create-sa]: https://cloud.google.com/iam/docs/creating-managing-service-accounts
[create-key]: https://cloud.google.com/iam/docs/creating-managing-service-account-keys
[sdk]: https://cloud.google.com/sdk
[secrets]: https://help.github.com/en/actions/automating-your-workflow-with-github-actions/creating-and-using-encrypted-secrets
[roles]: https://cloud.google.com/iam/docs/granting-roles-to-service-accounts#granting_access_to_a_service_account_for_a_resource
