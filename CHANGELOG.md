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
# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unresolved]

 ### Security

 ### Added

 ### Changed

 ### Removed

 ### Fixed

### [0.2.1](https://www.github.com/google-github-actions/setup-gcloud/compare/v0.2.0...v0.2.1) (2021-02-12)


### Bug Fixes

* Update action names ([#250](https://www.github.com/google-github-actions/setup-gcloud/issues/250)) ([#251](https://www.github.com/google-github-actions/setup-gcloud/issues/251)) ([95e2d15](https://www.github.com/google-github-actions/setup-gcloud/commit/95e2d15420adee2aa7d97b08aff5d50feacb17b0))

## [0.2.0](https://www.github.com/google-github-actions/setup-gcloud/compare/0.1.3...v0.2.0) (2020-11-16)


### Features

* add build and release ([#190](https://www.github.com/google-github-actions/setup-gcloud/issues/190)) ([11f1439](https://www.github.com/google-github-actions/setup-gcloud/commit/11f14399789c7ee67a0dab93e55aa61db68c1a0d))
* Add optional credentials_file_path input for setup-gcloud ([#153](https://www.github.com/google-github-actions/setup-gcloud/issues/153)) ([#213](https://www.github.com/google-github-actions/setup-gcloud/issues/213)) ([a4a3ab7](https://www.github.com/google-github-actions/setup-gcloud/commit/a4a3ab71b6a161eda3d0ba771380e9eb13bf83c7))
* clean up user agent ([#231](https://www.github.com/google-github-actions/setup-gcloud/issues/231)) ([478a42b](https://www.github.com/google-github-actions/setup-gcloud/commit/478a42baee02e58b183e8e82ba1800f5080bfa0a))


### Bug Fixes

* add @actions/exec library ([db3c7d6](https://www.github.com/google-github-actions/setup-gcloud/commit/db3c7d6e8477b8cdf9324c00d1d2c78de60fac7e))
* add GITHUB_PATH to unit test process stub ([#236](https://www.github.com/google-github-actions/setup-gcloud/issues/236)) ([6feeef5](https://www.github.com/google-github-actions/setup-gcloud/commit/6feeef597ba1bbc682d13ec32e53a4c223f3064e))
* bump @actions/tool-cache to 1.6.1 ([#232](https://www.github.com/google-github-actions/setup-gcloud/issues/232)) ([862c53e](https://www.github.com/google-github-actions/setup-gcloud/commit/862c53e843a9a04a006533f9340110845d292982))
* import * as exec ([2c0de75](https://www.github.com/google-github-actions/setup-gcloud/commit/2c0de755dfc78d287881043c1c7e0e4aa676460d))
* reference compiled dist/index.js in action.yml ([ccab249](https://www.github.com/google-github-actions/setup-gcloud/commit/ccab24911266f9267e21b7b3234613244bab3eeb))


### Reverts

* Revert "Use RUNNER_TEMP to export credentials" (#149) ([0926395](https://www.github.com/google-github-actions/setup-gcloud/commit/0926395459ca75ce323bcc26564f2843cd48ed98)), closes [#149](https://www.github.com/google-github-actions/setup-gcloud/issues/149) [#148](https://www.github.com/google-github-actions/setup-gcloud/issues/148)

## [0.1.3] - 2020-07-30

 ### Security

 ### Added
 - [deploy-cloudrun](https://github.com/GoogleCloudPlatform/github-actions/pull/117): Added action for deploying to Google Cloud Run
 - [appengine-deploy](https://github.com/GoogleCloudPlatform/github-actions/pull/91): Added action for deploying to Google App Engine
 - [upload-cloud-storage](https://github.com/GoogleCloudPlatform/github-actions/pull/121): Added action for uploading an artifact to GCS
 - [get-secretmanager-secrets](https://github.com/GoogleCloudPlatform/github-actions/pull/53): Fetch secrets from Secret Manager

 ### Changed
 - [setup-gcloud]: Allow setting of project Id

 ### Removed

 ### Fixed
 - cached gcloud path
 - missing credential input field in action.yml
 - allow GAE tests to run in parallel


## [0.1.2] - 2020-02-28

 ### Security

 ### Added
 - Added support for setting up GOOGLE APPLICATION CREDENTIALS
 - Can specify creds as b64 or plain json

 ### Changed
 - Changed testing framework for mocha
 - Updated linter config

 ### Removed

 ### Fixed


## [0.1.1] - 2020-01-30

 ### Security

 ### Added
 - [setup-gcloud]: Added support for specifying 'latest' SDK version
 - [setup-gcloud]: Made authentication optional
 - [setup-gcloud]: Added metrics tracking label
 - [setup-gcloud]: Added CloudRun example workflow
 - [setup-gcloud]: Added integration tests

 ### Changed

 ### Removed

 ### Fixed

## [0.1.0] - 2019-11-08

 ### Security

 ### Added
  - Initial release of setup-gcloud action.
    - Provides support for configuring Google Cloud SDK within the GitHub Actions v2 environment.

 ### Changed

 ### Removed

 ### Fixed
