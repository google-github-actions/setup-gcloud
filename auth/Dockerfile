FROM gcr.io/cloud-builders/gcloud-slim@sha256:7e910b97dd13d8e32acb3e53c5f4d2164c5ea8e93de1ea51e610a1112fa6308e

LABEL name="gcloud-auth"
LABEL version="1.0.1"
LABEL maintainer="GitHub Actions <support+actions@github.com>"

LABEL "com.github.actions.name"="GitHub Action for Google Cloud SDK auth"
LABEL "com.github.actions.description"="Wraps the GCloud SDK to login using a service account."
LABEL "com.github.actions.icon"="log-in"
LABEL "com.github.actions.color"="green"
COPY LICENSE README.md THIRD_PARTY_NOTICE.md /

COPY entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
