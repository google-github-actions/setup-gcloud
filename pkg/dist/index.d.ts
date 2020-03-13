import { getLatestGcloudSDKVersion } from './version-util';
export { getLatestGcloudSDKVersion };
/**
* @Method: Check if gcloud is installed
* @Param {string} version (Optional) Cloud SDK version
* @Return {string} tool path for Cloud SDK
*/
export declare function isInstalled(version?: string): string | string[];
/**
* @Method: Check if gcloud is authenticated
*/
export declare function isAuthenticated(): Promise<boolean>;
/**
* @Method: Install the Cloud SDK
* @Param {string} version gcloud version
* @Return {Promise}
*/
export declare function installGcloudSDK(version: string): Promise<string>;
/**
* @Method: Authenticates the gcloud tool using a service account key
* @Param {string}
*/
export declare function authenticateGcloudSDK(serviceAccountKey: string): Promise<number>;
