export declare const GCLOUD_METRICS_ENV_VAR = "CLOUDSDK_METRICS_ENVIRONMENT";
export declare const GCLOUD_METRICS_LABEL = "github-actions-setup-gcloud";
/**
 * Installs the gcloud SDK into the actions environment.
 *
 * @param version The version being installed.
 * @param gcloudExtPath The extraction path for the gcloud SDK.
 * @returns The path of the installed tool.
 */
export declare function installGcloudSDK(version: string, gcloudExtPath: string): Promise<string>;
