# GitHub Action for Google Cloud Auth

The GitHub Actions for [Google Cloud Platform](https://cloud.google.com/) and wraps the [gcloud SDK](https://cloud.google.com/sdk/) for authorizing a service account. This is a thin wrapper around the `gcloud auth` command, facilitating providing credentials securely using [Secrets](https://developer.github.com/actions/creating-workflows/storing-secrets/).

## Usage

### Example Workflow file

An example workflow to authenticate with Google Cloud Platform:

```
workflow "Run gcloud Login" {
  on = "push"
  resolves = "Setup Google Cloud"
}

action "Setup Google Cloud" {
  uses = "actions/gcloud/auth@master"
  secrets = ["GCLOUD_AUTH"]
}
```

Subsequent actions in the workflow will then be able to use `gcloud` as that user ([see `cli` for examples](/cli)).

### Secrets

* `GCLOUD_AUTH` **Required** Base64 encoded service account key exported as JSON
   - For information about service account keys please see the [Google Cloud docs](https://cloud.google.com/sdk/docs/authorizing)
   - For information about using Secrets in Actions please see the [Actions docs](https://developer.github.com/actions/creating-workflows/storing-secrets/).

Example on encoding from a terminal : `base64 ~/<account_id>.json`

## License

The Dockerfile and associated scripts and documentation in this project are released under the [MIT License](LICENSE).

Container images built with this project include third party materials. See [THIRD_PARTY_NOTICE.md](THIRD_PARTY_NOTICE.md) for details.
