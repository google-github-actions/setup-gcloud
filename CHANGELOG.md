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

## [0.6.0](https://www.github.com/google-github-actions/setup-gcloud/compare/v0.5.1...v0.6.0) (2022-03-08)


### ⚠ BREAKING CHANGES

* Require Node 16 (#532)

### Features

* switch to node16 ([#524](https://www.github.com/google-github-actions/setup-gcloud/issues/524)) ([c66a06c](https://www.github.com/google-github-actions/setup-gcloud/commit/c66a06cb89c6c4ceab6ae8cb679bc07b689c243d))


### Miscellaneous Chores

* Require Node 16 ([#532](https://www.github.com/google-github-actions/setup-gcloud/issues/532)) ([6194e1d](https://www.github.com/google-github-actions/setup-gcloud/commit/6194e1dc5928f3bf0f24eb73e8fc2734421e84f9))

### [0.5.1](https://www.github.com/google-github-actions/setup-gcloud/compare/v0.5.0...v0.5.1) (2022-02-16)


### Miscellaneous Chores

* release 0.5.1 ([64f0beb](https://www.github.com/google-github-actions/setup-gcloud/commit/64f0beb3041b0bf4f92f745cbc419ad54f282689))

## [0.5.0](https://www.github.com/google-github-actions/setup-gcloud/compare/v0.4.0...v0.5.0) (2022-02-04)

### Bug fixes

* fix a bug where gcloud error output was being hidden

### Miscellaneous Chores

* release 0.5.0 ([442c774](https://www.github.com/google-github-actions/setup-gcloud/commit/442c774cb39c4116f87a7c27a4ce4cc8f1477920))

## [0.4.0](https://www.github.com/google-github-actions/setup-gcloud/compare/v0.3.0...v0.4.0) (2022-01-21)


### Features

* add install_component field ([#399](https://www.github.com/google-github-actions/setup-gcloud/issues/399)) ([489ab62](https://www.github.com/google-github-actions/setup-gcloud/commit/489ab62c6e3c1ced7dd3ee7ae435591181cf8526))
* emit a warning when action is pinned to head ([#460](https://www.github.com/google-github-actions/setup-gcloud/issues/460)) ([1a48ffa](https://www.github.com/google-github-actions/setup-gcloud/commit/1a48ffaf046b28c93468eef7603c643377f487ec))


### Bug Fixes

* support export auth export with envvar for backwards compat ([#426](https://www.github.com/google-github-actions/setup-gcloud/issues/426)) ([aaf4f27](https://www.github.com/google-github-actions/setup-gcloud/commit/aaf4f27520fb60c21616fcb2c7c60a1108ce72cd))

## [0.3.0](https://www.github.com/google-github-actions/setup-gcloud/compare/v0.2.1...v0.3.0) (2021-12-06)


### Features

* cleanup old actions([#331](https://www.github.com/google-github-actions/setup-gcloud/issues/331)) ([38fab88](https://www.github.com/google-github-actions/setup-gcloud/commit/38fab8887c8defeb67814b4ccf61b916ce8b9220))
* Export credentials into RUNNER_TEMP instead of GITHUB_WORKSPACE ([#405](https://www.github.com/google-github-actions/setup-gcloud/issues/405)) ([9bd5f65](https://www.github.com/google-github-actions/setup-gcloud/commit/9bd5f65b7f188cbeaf56022b705397ec4ae49717))
* Support WIF creds and add deprecation notice for `service_account_key` input ([#413](https://www.github.com/google-github-actions/setup-gcloud/issues/413)) ([f38d54f](https://www.github.com/google-github-actions/setup-gcloud/commit/f38d54f0d75ec3e1b27429833f635cb308c71cd4))
* update to use setup-cloud-sdk package ([#397](https://www.github.com/google-github-actions/setup-gcloud/issues/397)) ([990c038](https://www.github.com/google-github-actions/setup-gcloud/commit/990c038e2c13ea4fc75024716f1cb8641d187185))


### Bug Fixes

* **deps:** bump y18n from 4.0.0 to 4.0.1 in /setupGcloudSDK ([#275](https://www.github.com/google-github-actions/setup-gcloud/issues/275)) ([00135cf](https://www.github.com/google-github-actions/setup-gcloud/commit/00135cf09c03f6102ba0f8c47d5d37d905ba197e))
* fix auth precedence ([#423](https://www.github.com/google-github-actions/setup-gcloud/issues/423)) ([f0d0410](https://www.github.com/google-github-actions/setup-gcloud/commit/f0d0410093b6663935c322444d414b182713ef47))

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
