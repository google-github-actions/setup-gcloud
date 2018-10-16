# GitHub Action for Google Cloud Auth

The GitHub Actions for [Google Cloud Platform](https://cloud.google.com/)  and wraps the [gcloud SDK](https://cloud.google.com/sdk/) for authorizing a service account.

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

### Secrets

* `GCLOUD_AUTH` **Required** Base64 encoded service account key exported as JSON [more info](https://cloud.google.com/sdk/docs/authorizing)

Example on encoding from a terminal : `base64 ~/<account_id>.json`

## License

The Dockerfile and associated scripts and documentation in this project are released under the [MIT License](LICENSE).

Container images built with this project include third party materials. See [THIRD_PARTY_NOTICE.md](THIRD_PARTY_NOTICE.md) for details.
