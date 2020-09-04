
#!/bin/bash
# Copyright 2020 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

set -e

if [ "$#" -lt 1 ]; then
    >&2 echo "Not all expected arguments set."
    exit 1
fi
ACTION=$1

pushd ${ACTION}
# get original SHAs and create times
ORIGINAL_SHA=$(shasum -a 512 dist/index.js | awk '{print $1}')
ORIGINAL_FILE_LAST_MODIFIED=$(date -r dist/index.js  +%s%10N)
# new build
npm run build

# get current SHAs and create times
CURRENT_BUILD_SHA=$(shasum -a 512 dist/index.js | awk '{print $1}')
CURRENT_BUILD_FILE_LAST_MODIFIED=$(date -r dist/index.js  +%s%10N)
echo "Current build @ ${CURRENT_BUILD_FILE_LAST_MODIFIED}"
echo "Original build @ ${ORIGINAL_FILE_LAST_MODIFIED}"
popd

# ensure build completed, index.js should be latest
if [[ $CURRENT_BUILD_FILE_LAST_MODIFIED -le $ORIGINAL_FILE_LAST_MODIFIED ]];then
    echo "❌ New ${ACTION}/dist/index.js not compiled."
    exit 1
fi
echo "Current build SHA: ${CURRENT_BUILD_SHA}"
echo "Original build SHA: ${ORIGINAL_SHA}"

# ensure SHAs match
if [[ $ORIGINAL_SHA != $CURRENT_BUILD_SHA ]];then
    echo "❌ New ${ACTION}/dist/index.js SHA does not match original SHA."
    exit 1
fi
echo "✅ ${ACTION}/dist/index.js compiled and SHA matches."
