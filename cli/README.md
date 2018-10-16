# GitHub Action for Google Cloud Auth

The GitHub Actions for [Google Cloud Platform](https://cloud.google.com/)  and wraps the [gcloud SDK](https://cloud.google.com/sdk/) to enable common Google Cloud commands.

## Usage
An example workflow to authenticate with Google Cloud Platform and run the `gcloud` command:


```
workflow "Run gcloud Login" {
  on = "push"
  resolves = "Load credentials"
}

action "Setup Google Cloud" {
  uses = "docker://github/gcloud-auth"
  secrets = ["GCLOUD_AUTH"]
}

action "Load credentials" {
  needs = ["Setup Google Cloud"]
  uses = "docker://github/gcloud"
  args = "container clusters get-credentials example-project --zone us-central1-a --project data-services-engineering"
}
```

## License

The Dockerfile and associated scripts and documentation in this project are released under the [MIT License](LICENSE).

Container images built with this project include third party materials. See [THIRD_PARTY_NOTICE.md](THIRD_PARTY_NOTICE.md) for details.
