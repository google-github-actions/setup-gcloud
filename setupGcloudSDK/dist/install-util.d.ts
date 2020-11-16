/**
 * Installs the gcloud SDK into the actions environment.
 *
 * @param version The version being installed.
 * @param gcloudExtPath The extraction path for the gcloud SDK.
 * @returns The path of the installed tool.
 */
export declare function installGcloudSDK(version: string, gcloudExtPath: string): Promise<string>;
