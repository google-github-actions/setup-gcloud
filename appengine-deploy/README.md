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
# appengine-deploy

This action deploys your source code to App Engine and makes the URL available to
later build steps via outputs. This allows you to parameterize your App Engine
deployments.

What does it do:


## Prerequisites


## Usage

```yaml
steps:
- id: deploy
  uses: GoogleCloudPlatform/github-actions/appengine-deploy@master
  with:
    project_id: ${{ secrets.PROJECT_ID }}

# Example of using the output
- id: test
  run: curl "${{ steps.deploy.outputs.url }}"
```

## Inputs

- `project_id`: (Required)

- `deliverables`: The yaml files for the services or configurations you want to
  deploy. If not given, defaults to app.yaml in the current directory. If that
  is not found, attempts to automatically generate necessary configuration
  files (such as app.yaml) in the current directory.

- `image-url`: Deploy with a specific container image. The image url must be
  from one of the valid gcr hostnames.

- `version`: The version of the app that will be created or replaced by this
  deployment. If you do not specify a version, one will be generated for
  you.

- `promote`: Promote the deployed version to receive all traffic.

### app.yaml customizations

## Outputs

- `url`: The URL of your App Engine Application.

## Authorization

There are a few ways to authenticate this action. The caller must have
permissions to access the secrets being requested.

Roles needed:

### Used with setup-gcloud

### Via Credentials
