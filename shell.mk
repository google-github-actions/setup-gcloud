# Copyright (c) 2018 GitHub, Inc. and contributors
# Copyright 2019 Google LLC

# Use of this source code is governed by an MIT-style
# license that can be found in the LICENSE file or at
# https://opensource.org/licenses/MIT.

SHELL_FILES=$(wildcard *.sh */*.sh)
BATS_TESTS=$(wildcard *.bats */*.bats)

.PHONY: shell-lint
shell-lint:
	shellcheck $(SHELL_FILES)

.PHONY: shell-test
shell-test:
	bats $(BATS_TESTS)
