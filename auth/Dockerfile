FROM gcr.io/cloud-builders/gcloud-slim@sha256:9ce2bb0f7459621450e1730c35c9620f23824e1c6d7a810c8eb1b80712d9af5a

LABEL name="gcloud-auth"
LABEL version="1.0.0"
LABEL maintainer="GitHub Actions <support+actions@github.com>"

LABEL "com.github.actions.name"="GitHub Action for Google Cloud SDK auth"
LABEL "com.github.actions.description"="Wraps the GCloud SDK to login using a service account."
LABEL "com.github.actions.icon"="log-in"
LABEL "com.github.actions.color"="green"
COPY LICENSE README.md THIRD_PARTY_NOTICE.md /

COPY entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
