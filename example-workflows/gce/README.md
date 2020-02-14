<!-- Copyright 2020 Google LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License. -->

# Google Compute Engine - GitHub Actions

An example workflow that uses [GitHub Actions](https://help.github.com/en/categories/automating-your-workflow-with-github-actions) to deploy a container to an existing [Google Compute Engine](https://cloud.google.com/compute-engine/) (GCE) instance.

## Workflow

For pushes to the _default_ branch, `master`, the workflow will:

1. Verify the Google Cloud Platform credentials are correct.
1. Build, tag, and push the image to Google Container Registry.
1. Deploy the container image to a Google Compute Engine instance.
   Note that a GCE deployment requires an existing [container-optimized VM][create-vm].

## Setup

1. Create or reuse a Github repository for the example workflow:
  * [Create a repository](https://help.github.com/en/github/creating-cloning-and-archiving-repositories/creating-a-new-repository).
  * Move into your repository directory.
  * Copy the example into the repository:
  ```
  cp -r <path_to>/github-actions/example-workflows/gce/ ./
  ```

2. Add your Project ID to the [repository's secret][secrets], named `GCE_PROJECT`.
3. [Create a container-optimized GCE VM][create-vm] or use an existing
container-optimized VM.
4. Update `gce.yml` with the following values:
  * `GCE_INSTANCE`: the instance name of the VM.
  * `GCE_INSTANCE_ZONE`: the zone your VM resides.

Note: You can find the VM name and the zone on the
[Cloud Console](http://console.cloud.google.com/compute/instances).

5. [Add the the following roles to your service account][roles]:
  * `Compute Instance Admin`
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
Then click on the `Build and Deploy to GCE` workflow to see the details.

[secrets]: https://help.github.com/en/actions/automating-your-workflow-with-github-actions/creating-and-using-encrypted-secrets
[create-vm]: https://cloud.google.com/container-optimized-os/docs/how-to/create-configure-instance
[roles]: https://cloud.google.com/iam/docs/granting-roles-to-service-accounts#granting_access_to_a_service_account_for_a_resource
