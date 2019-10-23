#!/bin/sh
# Copyright (c) 2018 GitHub, Inc. and contributors
# Copyright 2019 Google LLC

# Use of this source code is governed by an MIT-style
# license that can be found in the LICENSE file or at
# https://opensource.org/licenses/MIT.

set -e

echo "$GCLOUD_AUTH" | base64 --decode > "$HOME"/gcloud.json
sh -c "gcloud auth activate-service-account --key-file=$HOME/gcloud.json $*"
