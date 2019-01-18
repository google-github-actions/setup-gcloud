workflow "Build and Publish" {
  on = "push"
  resolves = "Publish"
}

action "Lint" {
  uses = "actions/action-builder/shell@master"
  runs = "make"
  args = "lint"
}

action "Test" {
  uses = "actions/action-builder/shell@master"
  runs = "make"
  args = "test"
}

action "Acceptance Test Auth" {
  uses = "./auth"
  secrets = ["GCLOUD_AUTH"]
}

action "Acceptance Test CLI" {
  needs = ["Acceptance Test Auth"]
  uses = "./cli"
  args = "auth list --filter no-such-account"
  secrets = ["GCLOUD_AUTH"]
}

action "Build" {
  needs = ["Lint", "Test", "Acceptance Test CLI"]
  uses = "actions/action-builder/docker@master"
  runs = "make"
  args = "build"
}

action "Publish Filter" {
  needs = ["Build"]
  uses = "actions/bin/filter@master"
  args = "branch master"
}

action "Docker Login" {
  needs = ["Publish Filter"]
  uses = "actions/docker/login@master"
  secrets = ["DOCKER_USERNAME", "DOCKER_PASSWORD"]
}

action "Publish" {
  needs = ["Docker Login"]
  uses = "actions/action-builder/docker@master"
  runs = "make"
  args = "publish"
}
