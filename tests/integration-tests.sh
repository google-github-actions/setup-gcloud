#!/bin/bash
# Copyright 2019 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# This file contains integration tests for the setup-gcloud action.

# fail on error
set -e

# Ensure authentication was succesfully configured
echo "Testing authentication..."
gcloud projects list > /dev/null && echo "Passed."

# Ensure gsutil was properly configured
# NOTE(craigdbarber): does not work for Windows as the gcloud
# SDK windows release is currently missing the gsutil bash
# entrypoint script.
if which "gsutil" &> /dev/null; then
    echo "Testing gsutil..."
    gsutil ls gs://cloud-sdk-release > /dev/null && echo "Passed."
fi
