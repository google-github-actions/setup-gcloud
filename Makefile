MODULES=$(dir $(wildcard */Makefile))
export ROOT_DIR=$(CURDIR)
export DOCKER_REPO=github

lint: ## Call the 'lint' target on all sub-modules
	echo $(ROOT)
	$(foreach mod,$(MODULES),($(MAKE) -C $(mod) $@) || exit $$?;)

build: ## Call the 'build' target on all sub-modules
	$(foreach mod,$(MODULES),($(MAKE) -C $(mod) $@) || exit $$?;)

test: ## Call the 'test' target on all sub-modules
	$(foreach mod,$(MODULES),($(MAKE) -C $(mod) $@) || exit $$?;)

publish: ## Call the 'publish' target on all sub-modules
	$(foreach mod,$(MODULES),($(MAKE) -C $(mod) $@) || exit $$?;)

dev-all: lint build test

.PHONY: help
help:
#	$(foreach mod,$(MODULES),$(MAKE) -C $(mod) $@;)
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | sed 's/^[^:]*://g' | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
