<!--
 Copyright 2019 Google LLC

 Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in
 compliance with the License. You may obtain a copy of the License at

        https://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software distributed under the License
 is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
 implied. See the License for the specific language governing permissions and limitations under the
 License.
-->

# Google Kubernetes Engine - GitHub Actions

An example workflow that uses [GitHub Actions](https://help.github.com/en/categories/automating-your-workflow-with-github-actions) to deploy [a static website](site/) to an existing [Google Kubernetes Engine](https://cloud.google.com/kubernetes-engine/) cluster.

## Workflow

The [example workflow](.github/workflows/gke.yml) will trigger on every push to this repo.

For pushes to the _feature_ branch, the workflow will:
1. Build the Docker image
1. Verify the Google Cloud Platform credentials are correct

For pushes to the _default_ branch (`master`), in addition to the above Actions, the workflow will:
1. Tag and Push the image to Google Container Registry
    * The image is available through the following tags: `latest`, the branch name, and first 8 of the commit SHA
    * `gcloud` serves as a [credential helper](https://cloud.google.com/container-registry/docs/pushing-and-pulling) for Docker. This workflow registers `gcloud` as a credential helper and uses the 'docker' command within the `gcloud` action to push the image.
1. Use a Kubernetes Deployment to push an image to the Cluster
    * Note that a GKE deployment requires a unique Tag to update the pods. Using a constant tag `latest` or a branch name `master` may result in successful workflows that don't update the cluster.

## Pre-reqs

1. Google Cloud Platform project
1. GCP Service Account with write access to GCR and GKE for this project
1. GCP Service Account [credentials](https://cloud.google.com/iam/docs/creating-managing-service-account-keys) stored as a JSON key. Base64 encode the JSON key and paste the entire blob as a secret (Repository Settings --> Secrets) named `GKE_KEY`.
1. Also add Secrets for `GKE_PROJECT` and `GKE_EMAIL`. Those can be found in the raw key JSON above.
1. An existing Kubernetes Engine cluster
    1. [Create a Cluster](https://cloud.google.com/kubernetes-engine/docs/quickstart#create_cluster)
1. Edit `deployment.yml` to enter the correct GCR path to your image. Easy to find from GCR section of GCP console after first image push.
## Resources

#### Example Actions
* [`actions/setup-node`](https://github.com/actions/setup-node)
* [`actions/setup-gcloud`](https://github.com/GoogleCloudPlatform/github-actions/tree/master/setup-gcloud)
* [Actions in GitHub Marketplace](https://github.com/marketplace?type=actions)

#### Example Workflows
* [`actions/starter-workflows`](https://github.com/actions/starter-workflows)
