<!--
Copyright 2020 Google LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->
# get-gke-credentials

## **📢 DEPRECATION NOTICE**

### **GoogleCloudPlatform/github-actions/get-gke-credentials has been deprecated. Please use google-github-actions/get-gke-credentials**

```diff
steps:
 - id: get-credentials
-  uses: GoogleCloudPlatform/github-actions/get-gke-credentials@master
+  uses: google-github-actions/get-gke-credentials@main
```

This action configures authentication to a [GKE cluster][gke] via a `kubeconfig` file that can be used with `kubectl` or other methods of interacting with the cluster.

Authentication is performed by generating a [short-lived token][token] (default behaviour) or via the [GCP auth plugin][gcp-auth-plugin] present in `kubectl` which uses the service account keyfile path in [GOOGLE_APPLICATION_CREDENTIALS][gcp-gcloud-auth].

## Prerequisites

This action requires:

- Google Cloud credentials that are authorized to view a GKE cluster. See the Authorization section below for more information.

- [Create a GKE cluster](https://cloud.google.com/kubernetes-engine/docs/quickstart?_ga=2.267842766.1374248275.1591025444-475066991.1589991158)

## Usage

```yaml
steps:
- id: get-credentials
  uses: GoogleCloudPlatform/github-actions/get-gke-credentials@master
  with:
    cluster_name: my-cluster
    location: us-central1-a
    credentials: ${{ secrets.gcp_credentials }}

# The KUBECONFIG env var is automatically exported and picked up by kubectl.
- id: get-pods
  run: kubectl get pods
```

## Inputs

- `cluster_name`: (Required) Name of the cluster to get credentials for.

- `location`: (Required) Location (Region/Zone) for the cluster.

- `credentials`: (Optional) Service account key to use for authentication. This should be
  the JSON formatted private key which can be exported from the Cloud Console. The
  value can be raw or base64-encoded. Required if not using a the
  `setup-gcloud` action with exported credentials.

- `project_id`: (Optional) Project ID where the cluster is deployed. If provided, this
  will override the project configured by gcloud.

- `use_auth_provider`: (Optional) Flag to use GCP auth plugin in kubectl instead of a short lived token. Defaults to false.

- `use_internal_ip`: (Optional) Flag to use the internal IP address of the cluster endpoint with private clusters. Defaults to false.

## Outputs

- Exports env var `KUBECONFIG` which is set to the generated `kubeconfig` file path.

## Authorization

There are a few ways to authenticate this action. A service account will be needed
with **at least** the following roles:

- Kubernetes Engine Cluster Viewer (`roles/container.clusterViewer`):
  - Get and list access to GKE Clusters.
`

### Via Credentials

You can provide [Google Cloud Service Account JSON][sa] directly to the action
by specifying the `credentials` input. First, create a [GitHub
Secret][gh-secret] that contains the JSON content, then import it into the
action:

```yaml
- id: get-credentials
  uses: GoogleCloudPlatform/github-actions/get-gke-credentials@master
  with:
    cluster_name: my-cluster
    location: us-central1-a
    credentials: ${{ secrets.gcp_credentials }}
```

### Via Application Default Credentials

If you are hosting your own runners, **and** those runners are on Google Cloud,
you can leverage the Application Default Credentials of the instance. This will
authenticate requests as the service account attached to the instance. **This
only works using a custom runner hosted on GCP.**

```yaml
- id: get-credentials
  uses: GoogleCloudPlatform/github-actions/get-gke-credentials@master
  with:
    cluster_name: my-cluster
    location: us-central1-a
```

The action will automatically detect and use the Application Default
Credentials.

[gke]: https://cloud.google.com/kubernetes-engine
[gcp-auth-plugin]: https://github.com/kubernetes/client-go/tree/master/plugin/pkg/client/auth/gcp
[gcp-gcloud-auth]: https://cloud.google.com/kubernetes-engine/docs/how-to/api-server-authentication#using-gcloud-config
[token]: https://kubernetes.io/docs/reference/access-authn-authz/authentication/#openid-connect-tokens
[sm]: https://cloud.google.com/secret-manager
[sa]: https://cloud.google.com/iam/docs/creating-managing-service-accounts
[gh-runners]: https://help.github.com/en/actions/hosting-your-own-runners/about-self-hosted-runners
[gh-secret]: https://help.github.com/en/actions/configuring-and-managing-workflows/creating-and-storing-encrypted-secrets
[setup-gcloud]: ../setup-gcloud