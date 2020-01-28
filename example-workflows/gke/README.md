<!-- Copyright 2019 Google LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License. -->

# Google Kubernetes Engine - GitHub Actions

An example workflow that uses [GitHub Actions](https://help.github.com/en/categories/automating-your-workflow-with-github-actions) to deploy [a static website](site/) to an existing [Google Kubernetes Engine](https://cloud.google.com/kubernetes-engine/) cluster.

## Workflow

For pushes to the _default_ branch, `master`, the workflow will:

1. Verify the Google Cloud Platform credentials are correct.

1. Build, tag, and push the image to Google Container Registry.

    * `gcloud` serves as a [credential helper](https://cloud.google.com/container-registry/docs/pushing-and-pulling) for Docker. This workflow registers `gcloud` as a
    credential helper and uses the 'docker' command within the `gcloud` action
    to push the image.

    * The image is available through the following tags: `latest`, the branch
    name, and first 8 of the commit SHA.

1. Use a Kubernetes Deployment to push the image to the cluster.

    * Note that a GKE deployment requires a unique Tag to update the pods. Using
    a constant tag `latest` or a branch name `master` may result in successful
    workflows that don't update the cluster.

## Setup

1. Create or reuse a Github repository for the example workflow:

  1. [Create a repository](https://help.github.com/en/github/creating-cloning-and-archiving-repositories/creating-a-new-repository).

  1. Move into your repository directory.

  1. Copy the example into the repository:
  ```
  cp -r <path_to>/github-actions/example-workflows/gke/ ./
  ```

1. Add your Project Id to the [repository's secret][secrets], named `GKE_PROJECT`.

1. [Create a GKE cluster][cluster] or select an existing GKE cluster.

1. Update `gke.yml` with the following values:

  * `GKE_CLUSTER`: the name of your cluster.

  * `GKE_ZONE`: the zone your cluster resides.

  * `IMAGE`: your preferred Docker image name.

  You can find the names of your clusters using the command: `gcloud container clusters list`,
and the zone using the command: `gcloud container clusters describe <CLUSTER_NAME>`.

1. [Add the the following roles to your service account][roles]:

  * `Kubernetes Engine Developer`
  * `Storage Admin`

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
Then click on the `Build and Deploy to GKE` workflow to see the details.

[secrets]: https://help.github.com/en/actions/automating-your-workflow-with-github-actions/creating-and-using-encrypted-secrets
[cluster]: https://cloud.google.com/kubernetes-engine/docs/quickstart#create_cluster
[roles]: https://cloud.google.com/iam/docs/granting-roles-to-service-accounts#granting_access_to_a_service_account_for_a_resource
