# Google Compute Engine - GitHub Actions

An example workflow that uses [GitHub Actions][actions] to deploy a container to
an existing [Google Compute Engine][gce] (GCE) instance.

This code is intended to be an _example_. You will likely need to change or
update values to match your setup.

## Workflow description

For pushes to the `master` branch, this workflow will:

1.  Download and configure the Google [Cloud SDK][sdk] with the provided
    credentials.

1.  Build, tag, and push a container image to Google Container Registry.

1.  Deploy the container image to a Google Compute Engine instance. Note that a
    GCE deployment requires an existing [container-optimized VM][create-vm].

## Setup

1.  Create a new Google Cloud Project (or select an existing project) and
    [enable the Container Registry and Compute APIs](https://console.cloud.google.com/flows/enableapi?apiid=containerregistry.googleapis.com,compute.googleapis.com).

1.  [Create a container-optimized GCE VM][create-vm] or use an existing
    container-optimized VM. Note the VM name and zone.

1.  Create or reuse a GitHub repository for the example workflow:

    1.  [Create a repository](https://help.github.com/en/github/creating-cloning-and-archiving-repositories/creating-a-new-repository).

    1.  Move into the repository directory:

        ```
        $ cd <repo>
        ```

    1.  Copy the example into the repository:

        ```
        $ cp -r <path_to>/github-actions/example-workflows/gce/ .
        ```

1.  [Create a Google Cloud service account][create-sa] if one does not already
    exist.

1.  Add the the following [Cloud IAM roles][roles] to your service account:

    - `Compute Instance Admin` - allows administering GCE VMs

    - `Storage Admin` - allows pushing to Container Registry

    - `Service Account User` - run operations as the compute storage account

    Note: These permissions are overly broad to favor a quick start. They do not
    represent best practices around the Principle of Least Privilege. To
    properly restrict access, you should create a custom IAM role with the most
    restrictive permissions.

1.  [Create a JSON service account key][create-key] for the service account.

1.  Add the following secrets to your repository's secrets:

    - `GCE_PROJECT`: Google Cloud project ID

    - `GCE_SA_KEY`: the content of the service account JSON file

1.  Update `.github/workflows/gce.yml` to match the values corresponding to your
    VM:

    - `GCE_INSTANCE` - the instance name of the VM

    - `GCE_INSTANCE_ZONE` - the zone your VM resides


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
    of your repository on GitHub. Then click on the `Build and Deploy to Google
    Compute Engine` element to see the details.

[actions]: https://help.github.com/en/categories/
[gce]: https://cloud.google.com/compute
[create-sa]: https://cloud.google.com/iam/docs/creating-managing-service-accounts
[create-key]: https://cloud.google.com/iam/docs/creating-managing-service-account-keys
[create-vm]: https://cloud.google.com/container-optimized-os/docs/how-to/create-configure-instance
[sdk]: https://cloud.google.com/sdk
[secrets]: https://help.github.com/en/actions/automating-your-workflow-with-github-actions/creating-and-using-encrypted-secrets
[roles]: https://cloud.google.com/iam/docs/granting-roles-to-service-accounts#granting_access_to_a_service_account_for_a_resource
