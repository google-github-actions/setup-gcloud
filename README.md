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

# Google Cloud Platform: github-actions

This repository contains a library of [Github Actions](https://github.com/actions) providing functionality for working with [Google Cloud Platform](http://cloud.google.com/).

## Available Actions

* [setup-gcloud](./setup-gcloud/README.md): This action downloads, installs, and configures a [gcloud Cloud SDK](https://cloud.google.com/sdk/) environment for the worker, adding the `gcloud` CLI command to the worker's $PATH.

* [get-secretmanager-secrets](./get-secretmanager-secrets/README.md): This action accesses secrets from [Google Secret Manager](https://cloud.google.com/secret-manager) and makes their results available as output variables.

## Example Workflows

* [Google Kubernetes Engine](./example-workflows/gke/README.md): An example workflow that uses [GitHub Actions][github-action] to deploy a static website to an existing [Google Kubernetes Engine](https://cloud.google.com/kubernetes-engine/) cluster.

* [Cloud Run](./example-workflows/cloud-run/README.md): An example workflow that uses [GitHub Actions][github-action] to build and deploy a container to [Cloud Run](https://cloud.google.com/run/).

* [Google Compute Engine](./example-workflows/gce/README.md): An example workflow that uses [GitHub Actions](https://help.github.com/en/categories/automating-your-workflow-with-github-actions) to deploy a container to an existing [Google Compute Engine](https://cloud.google.com/compute-engine/) (GCE) instance.

## Feature requests and bug reports

Please file feature requests and bug reports as
[github issues](https://github.com/GoogleCloudPlatform/github-actions/issues).

## Community

The GCP GitHub Actions community uses the **#gcp-github-actions** slack channel on
[https://googlecloud-community.slack.com](https://googlecloud-community.slack.com)
to ask questions and share feedback. Invitation link available here:
[gcp-slack](https://cloud.google.com/community#home-support).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)

## License

See [LICENSE](LICENSE)


[github-action]:https://help.github.com/en/categories/automating-your-workflow-with-github-actions
