import { getLatestGcloudSDKVersion } from './version-util';
export { getLatestGcloudSDKVersion };
/**
 * Checks if gcloud is installed
 *
 * @param version (Optional) Cloud SDK version
 * @return true if gcloud is found in toolpath
 */
export declare function isInstalled(version?: string): boolean;
/**
 * Checks if gcloud is authenticated
 *
 * @returns true is gcloud is authenticated
 */
export declare function isAuthenticated(): Promise<boolean>;
/**
 * Installs the gcloud SDK into the actions environment.
 *
 * @param version The version being installed.
 * @param gcloudExtPath The extraction path for the gcloud SDK.
 * @returns The path of the installed tool.
 */
export declare function installGcloudSDK(version: string): Promise<string>;
/**
 * Authenticates the gcloud tool using a service account key
 *
 * @param serviceAccountKey The serive account key used for authentication.
 * @returns exit code
 */
export declare function authenticateGcloudSDK(serviceAccountKey: string): Promise<number>;
