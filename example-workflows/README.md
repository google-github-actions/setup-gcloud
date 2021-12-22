# Example Workflows for Github Actions with Google Cloud Platform

These example workflows use the [setup-gcloud][action] to build and deploy applications to Google Cloud Platform.

These examples are intended to be _examples_. You will likely need to change or
update values to match your setup.

## Workflows

|           Workflow                        |        Description       |
| ----------------------------------------- | ------------------------ |
| [Google Kubernetes Engine](gke-kustomize/)| Build image and deploy a static site to an existing GKE cluster |
| [Google Kubernetes Engine](gke/)          | Deploy a simple hello app to an existing GKE cluster |
| [Cloud Run](cloud-run/)                   | Deploy a container to Cloud Run (Fully Managed)|
| [Google Compute Engine](gce/)             | Deploy a container to a GCE VM |
| [Cloud Build](cloud-build/)               | Build a container image using Cloud Build|
| [App Engine](gae/)                        | Deploy from source to App Engine |

## Community Workflows

* [Deploying a Fullstack React App + Express.js + MySQL to Google Compute Engine](https://github.com/ZBejavu/gcloud-deploy-tutorial)

## Github Actions resources

Learn more about [Automating your workflow with Github Actions](https://help.github.com/en/actions/automating-your-workflow-with-github-actions).


[action]: https://github.com/GoogleCloudPlatform/github-actions/tree/master/setup-gcloud
