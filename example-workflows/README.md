# Example Workflows for Github Actions with Google Cloud Platform

These example workflows use the [setup-gcloud][action] to build and deploy applications to Google Cloud Platform.

## Workflows

|           Workflow              |        Description       |
| ------------------------------- | ------------------------ |
| [Google Kubernetes Engine](gke/)| Deploy a static site to an existing GKE cluster |
| [Cloud Run](cloud-run/)         | Deploy a container to Cloud Run (Fully Managed)|

## Before you begin

1. [Create or select a Google Cloud Platform project][project].

1. Make sure that billing is enabled for your Google Cloud project. [Learn how to confirm billing is enabled for your project.][billing]

1. [Create a Service Account][service-account] and download a [JSON key][key].

  * Base64 encode your JSON key with the following command:
  ```
  base64 ~/path/to/key/key.json
  ```

  * Add the encoded key to the [repository's secrets][secrets] (&#9881; Settings > Secrets), named `GOOGLE_APPLICATION_CREDENTIALS`.

  * Add the service account email, `<NAME@PROJECT_ID.iam.gserviceaccount.com`, to the repository's secrets, named `SA_EMAIL`.

## Resources

#### Example Actions
* [`actions/setup-node`](https://github.com/actions/setup-node)
* [`actions/setup-gcloud`](https://github.com/GoogleCloudPlatform/github-actions/tree/master/setup-gcloud)
* [Actions in GitHub Marketplace](https://github.com/marketplace?type=actions)

#### Example Workflows
* [`actions/starter-workflows`](https://github.com/actions/starter-workflows)


<!-- links -->
[action]: https://github.com/GoogleCloudPlatform/github-actions/tree/0c32120a9a2dda7fb9b392e6c3b90fa413b4642e/setup-gcloud
[project]: https://cloud.google.com/resource-manager/docs/creating-managing-projects#creating_a_project
[billing]: https://cloud.google.com/billing/docs/how-to/modify-project
[service-account]: https://cloud.google.com/iam/docs/creating-managing-service-accounts#creating
[key]: https://cloud.google.com/iam/docs/creating-managing-service-account-keys#creating_service_account_keys
[secrets]: https://help.github.com/en/actions/automating-your-workflow-with-github-actions/creating-and-using-encrypted-secrets
