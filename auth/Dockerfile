FROM gcr.io/cloud-builders/gcloud-slim@sha256:d4ca671e5764c0f8f494a2a7540ced1753fbbe62af249e74c2fc0bbac6fa94fc

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
