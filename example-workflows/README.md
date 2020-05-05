# Example Workflows for Github Actions with Google Cloud Platform

These example workflows use the [setup-gcloud][action] to build and deploy applications to Google Cloud Platform.

These examples are intended to be _examples_. You will likely need to change or
update values to match your setup.

## Workflows

|           Workflow              |        Description       |
| ------------------------------- | ------------------------ |
| [Google Kubernetes Engine](gke/)| Deploy a static site to an existing GKE cluster |
| [Cloud Run](cloud-run/)         | Deploy a container to Cloud Run (Fully Managed)|
| [Google Compute Engine](gce/)  | Deploy a container to a GCE VM |
| [Google Cloud Build](cloud-build)| Build a container image using CLoud Build|

## Github Actions resources

Learn more about [Automating your workflow with Github Actions](https://help.github.com/en/actions/automating-your-workflow-with-github-actions).


[action]: https://github.com/GoogleCloudPlatform/github-actions/tree/master/setup-gcloud
